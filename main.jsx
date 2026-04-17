import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp7 } from '../utils/app.js';
import { MACRO_SECTION_COUNT, MACRO_SECTION_OFFSET, MACRO_SECTION_STRIDE, MACRO_TARGET_STRIDE, MACRO_TARGETS_PER_SECTION, MOD_MATRIX_OFFSET, MOD_MATRIX_SLOTS, MOD_MATRIX_STRIDE, NOVATION_SYSEX_HEADER, PATCH_BYTE_MAP, PATCH_CATEGORY_INDEX, PATCH_DATA_LENGTH, PATCH_GENRE_INDEX, PATCH_NAME_RANGE } from '../data/circuitTracks.js';

function createModSlotNrpn(count = 20) {
  const start = 211;
  return Array.from({ length: count }, (_, index) => {
    const base = start + index * 5;
    const pair = (offset) => [Math.floor((base + offset) / 128), (base + offset) % 128];
    return { source1: pair(0), source2: pair(1), depth: pair(3), destination: pair(4) };
  });
}

function createMacroSlotNrpn(count = 32) {
  const start = 384;
  return Array.from({ length: count }, (_, index) => {
    const base = start + index * 4;
    const pair = (offset) => [Math.floor((base + offset) / 128), (base + offset) % 128];
    return { destination: pair(0), start: pair(1), end: pair(2), depth: pair(3) };
  });
}

const MOD_SLOT_NRPN = createModSlotNrpn(20);
const MACRO_SLOT_NRPN = createMacroSlotNrpn(32);

function decodePatchName(bytes = []) {
  const [start, end] = PATCH_NAME_RANGE;
  return bytes.slice(start, end).map((v) => (v >= 32 && v <= 126 ? String.fromCharCode(v) : '')).join('').trim();
}

function encodePatchName(bytes, name = '') {
  const [start, end] = PATCH_NAME_RANGE;
  const clean = String(name || '').slice(0, end - start).padEnd(end - start, ' ');
  for (let i = start; i < end; i += 1) {
    bytes[i] = clean.charCodeAt(i - start) & 0x7f;
  }
}

function decodePatchMeta(bytes = []) {
  return {
    patchCategory: Number.isInteger(bytes[PATCH_CATEGORY_INDEX]) ? clamp7(bytes[PATCH_CATEGORY_INDEX]) : 0,
    patchGenre: Number.isInteger(bytes[PATCH_GENRE_INDEX]) ? clamp7(bytes[PATCH_GENRE_INDEX]) : 0,
  };
}

function encodePatchMeta(bytes, { patchCategory = null, patchGenre = null } = {}) {
  if (Number.isInteger(patchCategory)) bytes[PATCH_CATEGORY_INDEX] = clamp7(patchCategory);
  if (Number.isInteger(patchGenre)) bytes[PATCH_GENRE_INDEX] = clamp7(patchGenre);
}

export function parsePatchDump(message, paramsMeta) {
  const bytes = Array.from(message);
  if (bytes[0] !== 0xf0 || bytes[bytes.length - 1] !== 0xf7) return null;
  const header = bytes.slice(1, 6);
  if (header.join(',') !== NOVATION_SYSEX_HEADER.join(',')) return null;

  const command = bytes[6];
  if (command !== 0x00 && command !== 0x01) return null;

  const location = bytes[7];
  const patchData = bytes.slice(9, 9 + PATCH_DATA_LENGTH);
  if (patchData.length !== PATCH_DATA_LENGTH) return null;

  const params = {};
  Object.entries(PATCH_BYTE_MAP).forEach(([paramId, byteIndex]) => {
    if (typeof patchData[byteIndex] === 'number' && paramsMeta[paramId]) {
      params[paramId] = clamp7(patchData[byteIndex]);
    }
  });

  const routes = [];
  for (let i = 0; i < MOD_MATRIX_SLOTS; i += 1) {
    const offset = MOD_MATRIX_OFFSET + i * MOD_MATRIX_STRIDE;
    const source1 = patchData[offset];
    const source2 = patchData[offset + 1];
    const depth = patchData[offset + 2];
    const destination = patchData[offset + 3];
    if (!destination || (!source1 && !source2)) continue;
    routes.push({ slot: i, source1, source2, depth, destination });
  }

  const macroRoutes = [];
  for (let macroIndex = 0; macroIndex < MACRO_SECTION_COUNT; macroIndex += 1) {
    const baseOffset = MACRO_SECTION_OFFSET + macroIndex * MACRO_SECTION_STRIDE;
    for (let slot = 0; slot < MACRO_TARGETS_PER_SECTION; slot += 1) {
      const offset = baseOffset + 1 + slot * MACRO_TARGET_STRIDE;
      const destination = patchData[offset];
      if (!destination) continue;
      macroRoutes.push({
        slot: macroIndex * MACRO_TARGETS_PER_SECTION + slot,
        destination,
        start: patchData[offset + 1],
        end: patchData[offset + 2],
        depth: patchData[offset + 3],
      });
    }
  }

  const meta = decodePatchMeta(patchData);

  return {
    raw: bytes,
    command,
    location,
    rawPayload: patchData,
    patchName: decodePatchName(patchData),
    ...meta,
    params,
    hardwareRoutes: routes,
    hardwareMacroRoutes: macroRoutes,
  };
}

function clearRoutingSections(patchData) {
  for (let i = MOD_MATRIX_OFFSET; i < MACRO_SECTION_OFFSET; i += 1) patchData[i] = 0;
  for (let macroIndex = 0; macroIndex < MACRO_SECTION_COUNT; macroIndex += 1) {
    const sectionStart = MACRO_SECTION_OFFSET + macroIndex * MACRO_SECTION_STRIDE;
    for (let i = 1; i < MACRO_SECTION_STRIDE; i += 1) patchData[sectionStart + i] = 0;
  }
}

function placePreferredRoute(assignments, preferredSlot, route) {
  if (Number.isInteger(preferredSlot) && preferredSlot >= 0 && preferredSlot < assignments.length && !assignments[preferredSlot]) {
    assignments[preferredSlot] = route;
    return true;
  }
  const firstFreeSlot = assignments.findIndex((entry) => entry === null);
  if (firstFreeSlot === -1) return false;
  assignments[firstFreeSlot] = { ...route, slot: firstFreeSlot };
  return true;
}

function writeModAssignments(patchData, assignments) {
  assignments.forEach((route, slot) => {
    if (!route) return;
    const offset = MOD_MATRIX_OFFSET + slot * MOD_MATRIX_STRIDE;
    patchData[offset] = clamp7(route.source1 ?? 0);
    patchData[offset + 1] = clamp7(route.source2 ?? 0);
    patchData[offset + 2] = clamp7(route.depth ?? 64);
    patchData[offset + 3] = clamp7(route.destination ?? 0);
  });
}

function findFirstFreeMacroSlot(assignments, macroIndex) {
  const start = macroIndex * MACRO_TARGETS_PER_SECTION;
  const end = start + MACRO_TARGETS_PER_SECTION;
  for (let slot = start; slot < end; slot += 1) {
    if (!assignments[slot]) return slot;
  }
  return -1;
}

function writeMacroAssignments(patchData, assignments) {
  assignments.forEach((route, slot) => {
    if (!route) return;
    const offset = MACRO_SECTION_OFFSET + Math.floor(slot / MACRO_TARGETS_PER_SECTION) * MACRO_SECTION_STRIDE + 1 + (slot % MACRO_TARGETS_PER_SECTION) * MACRO_TARGET_STRIDE;
    patchData[offset] = clamp7(route.destination ?? 0);
    patchData[offset + 1] = clamp7(route.start ?? 0);
    patchData[offset + 2] = clamp7(route.end ?? 127);
    patchData[offset + 3] = clamp7(route.depth ?? 64);
  });
}

export function buildPatchPayload({
  params,
  routes = [],
  macroRoutes = [],
  patchName = '',
  paramsMeta,
  hardwareSourceMap,
  macroSourceMap,
  basePayload,
  preservedHardwareRoutes = [],
  preservedHardwareMacroRoutes = [],
  patchCategory = null,
  patchGenre = null,
}) {
  const patchData = Array.isArray(basePayload) && basePayload.length === PATCH_DATA_LENGTH
    ? [...basePayload]
    : new Array(PATCH_DATA_LENGTH).fill(0);

  clearRoutingSections(patchData);

  Object.entries(PATCH_BYTE_MAP).forEach(([paramId, byteIndex]) => {
    if (byteIndex >= 0 && byteIndex < patchData.length) {
      patchData[byteIndex] = clamp7(params?.[paramId] ?? paramsMeta[paramId]?.defaultValue ?? 0);
    }
  });

  const modAssignments = Array.from({ length: MOD_MATRIX_SLOTS }, () => null);
  preservedHardwareRoutes
    .filter((route) => Number.isInteger(route?.slot) && route.slot >= 0 && route.slot < MOD_MATRIX_SLOTS)
    .forEach((route) => {
      if (!modAssignments[route.slot]) {
        modAssignments[route.slot] = {
          slot: route.slot,
          source1: clamp7(route.source1 ?? 0),
          source2: clamp7(route.source2 ?? 0),
          depth: clamp7(route.depth ?? 64),
          destination: clamp7(route.destination ?? 0),
        };
      }
    });

  routes
    .filter((route) => Number.isInteger(hardwareSourceMap[route.sourceId]) && Number.isInteger(paramsMeta[route.targetId]?.modDestination))
    .slice(0, MOD_MATRIX_SLOTS)
    .forEach((route) => {
      placePreferredRoute(modAssignments, route.hardwareSlot, {
        source1: clamp7(hardwareSourceMap[route.sourceId]),
        source2: 0,
        depth: clamp7(route.amount ?? 64),
        destination: clamp7(paramsMeta[route.targetId]?.modDestination ?? 0),
      });
    });
  writeModAssignments(patchData, modAssignments);

  const macroAssignments = Array.from({ length: MACRO_SECTION_COUNT * MACRO_TARGETS_PER_SECTION }, () => null);
  preservedHardwareMacroRoutes
    .filter((route) => Number.isInteger(route?.slot) && route.slot >= 0 && route.slot < macroAssignments.length)
    .forEach((route) => {
      if (!macroAssignments[route.slot]) {
        macroAssignments[route.slot] = {
          slot: route.slot,
          destination: clamp7(route.destination ?? 0),
          start: clamp7(route.start ?? 0),
          end: clamp7(route.end ?? 127),
          depth: clamp7(route.depth ?? 64),
        };
      }
    });

  macroRoutes
    .filter((route) => Number.isInteger(macroSourceMap[route.sourceId]) && Number.isInteger(paramsMeta[route.targetId]?.macroDestination ?? paramsMeta[route.targetId]?.modDestination))
    .slice(0, macroAssignments.length)
    .forEach((route) => {
      const macroIndex = macroSourceMap[route.sourceId];
      if (!Number.isInteger(macroIndex) || macroIndex < 0 || macroIndex >= MACRO_SECTION_COUNT) return;
      const preferredSlot = Number.isInteger(route.hardwareSlot)
        && route.hardwareSlot >= macroIndex * MACRO_TARGETS_PER_SECTION
        && route.hardwareSlot < (macroIndex + 1) * MACRO_TARGETS_PER_SECTION
        && !macroAssignments[route.hardwareSlot]
        ? route.hardwareSlot
        : findFirstFreeMacroSlot(macroAssignments, macroIndex);
      if (preferredSlot === -1) return;
      macroAssignments[preferredSlot] = {
        slot: preferredSlot,
        destination: clamp7(paramsMeta[route.targetId]?.macroDestination ?? paramsMeta[route.targetId]?.modDestination ?? 0),
        start: clamp7(route.start ?? 0),
        end: clamp7(route.end ?? 127),
        depth: clamp7(route.depth ?? 64),
      };
    });
  writeMacroAssignments(patchData, macroAssignments);

  encodePatchName(patchData, patchName);
  encodePatchMeta(patchData, { patchCategory, patchGenre });
  return patchData;
}

export function buildPatchSysexMessage({
  params = {},
  routes = [],
  macroRoutes = [],
  patchName = '',
  paramsMeta,
  hardwareSourceMap,
  macroSourceMap,
  basePayload = null,
  preservedHardwareRoutes = [],
  preservedHardwareMacroRoutes = [],
  patchCategory = null,
  patchGenre = null,
  command = 0x00,
  location = 0x00,
} = {}) {
  const payload = buildPatchPayload({
    params,
    routes,
    macroRoutes,
    patchName,
    paramsMeta,
    hardwareSourceMap,
    macroSourceMap,
    basePayload,
    preservedHardwareRoutes,
    preservedHardwareMacroRoutes,
    patchCategory,
    patchGenre,
  });

  return [0xf0, ...NOVATION_SYSEX_HEADER, clamp7(command), clamp7(location), 0x00, ...payload.map(clamp7), 0xf7];
}

export function useMidiEngine({ synthChannel, paramsMeta, modSources, macroSources = [], onIncomingParam }) {
  const [midiAccess, setMidiAccess] = useState(null);
  const [outputs, setOutputs] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [selectedOutputId, setSelectedOutputId] = useState('');
  const [selectedInputId, setSelectedInputId] = useState('');
  const [error, setError] = useState('');
  const syncedRouteSignatureRef = useRef('');
  const syncedMacroRouteSignatureRef = useRef('');
  const pendingPatchDumpRef = useRef(null);

  const ccToParam = useMemo(() => {
    const pairs = Object.entries(paramsMeta)
      .filter(([, meta]) => Number.isInteger(meta.cc))
      .map(([paramId, meta]) => [meta.cc, paramId]);
    return Object.fromEntries(pairs);
  }, [paramsMeta]);

  const hardwareSourceMap = useMemo(
    () => Object.fromEntries(modSources.filter((source) => Number.isInteger(source.hardwareSourceId)).map((source) => [source.id, source.hardwareSourceId])),
    [modSources]
  );

  const macroSourceMap = useMemo(
    () => Object.fromEntries(macroSources.filter((source) => Number.isInteger(source.hardwareMacroIndex)).map((source) => [source.id, source.hardwareMacroIndex])),
    [macroSources]
  );

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setError('WebMIDI is not available in this browser.');
      return;
    }

    let mounted = true;
    navigator.requestMIDIAccess({ sysex: true }).then(
      (access) => {
        if (!mounted) return;
        setMidiAccess(access);
        const nextOutputs = Array.from(access.outputs.values());
        const nextInputs = Array.from(access.inputs.values());
        setOutputs(nextOutputs);
        setInputs(nextInputs);

        const preferredOutput = nextOutputs.find((port) => port.name?.toLowerCase().includes('circuit tracks')) || nextOutputs[0];
        const preferredInput = nextInputs.find((port) => port.name?.toLowerCase().includes('circuit tracks')) || nextInputs[0];

        if (preferredOutput) setSelectedOutputId((current) => current || preferredOutput.id);
        if (preferredInput) setSelectedInputId((current) => current || preferredInput.id);

        access.onstatechange = () => {
          setOutputs(Array.from(access.outputs.values()));
          setInputs(Array.from(access.inputs.values()));
        };
      },
      () => setError('MIDI access was denied.')
    );

    return () => {
      mounted = false;
    };
  }, []);

  const getOutput = useCallback(() => {
    if (!midiAccess || !selectedOutputId) return null;
    return midiAccess.outputs.get(selectedOutputId) || null;
  }, [midiAccess, selectedOutputId]);

  useEffect(() => {
    if (!midiAccess || !selectedInputId) return undefined;
    const input = midiAccess.inputs.get(selectedInputId);
    if (!input) return undefined;

    input.onmidimessage = (event) => {
      const data = Array.from(event.data);
      const statusByte = data[0];
      const channel = statusByte & 0x0f;
      const messageType = statusByte & 0xf0;

      if (statusByte === 0xf0) {
        const parsed = parsePatchDump(data, paramsMeta);
        if (parsed && pendingPatchDumpRef.current) {
          if (pendingPatchDumpRef.current.timeoutId) {
            window.clearTimeout(pendingPatchDumpRef.current.timeoutId);
          }
          pendingPatchDumpRef.current.resolve(parsed);
          pendingPatchDumpRef.current = null;
        }
        return;
      }

      if (messageType !== 0xb0 || channel !== synthChannel) return;
      const paramId = ccToParam[data[1]];
      if (paramId) onIncomingParam(paramId, data[2]);
    };

    return () => {
      input.onmidimessage = null;
    };
  }, [midiAccess, selectedInputId, synthChannel, ccToParam, onIncomingParam, paramsMeta]);

  const sendCC = useCallback((ccNumber, value, options = {}) => {
    const output = getOutput();
    if (!output || !Number.isInteger(ccNumber)) return;
    const channel = Number.isInteger(options.channelOverride) ? options.channelOverride : synthChannel;
    output.send([0xb0 + channel, ccNumber, clamp7(value)]);
  }, [getOutput, synthChannel]);

  const sendProgramChange = useCallback((program, options = {}) => {
    const output = getOutput();
    if (!output || !Number.isInteger(program)) return;
    const channel = Number.isInteger(options.channelOverride) ? options.channelOverride : synthChannel;
    output.send([0xc0 + channel, clamp7(program)]);
  }, [getOutput, synthChannel]);

  const sendNRPN = useCallback((msb, lsb, value, options = {}) => {
    const output = getOutput();
    if (!output) return;
    const channel = Number.isInteger(options.channelOverride) ? options.channelOverride : synthChannel;
    const status = 0xb0 + channel;
    const safeValue = clamp7(value);
    output.send([status, 99, clamp7(msb)]);
    output.send([status, 98, clamp7(lsb)]);
    output.send([status, 6, safeValue]);
    output.send([status, 38, 0]);
  }, [getOutput, synthChannel]);

  const sendParamValue = useCallback((paramId, value, options = {}) => {
    const meta = paramsMeta[paramId];
    if (!meta) return;
    if (Number.isInteger(meta.cc)) {
      sendCC(meta.cc, value, options);
      return;
    }
    if (Array.isArray(meta.nrpn)) {
      sendNRPN(meta.nrpn[0], meta.nrpn[1], value, options);
    }
  }, [paramsMeta, sendCC, sendNRPN]);

  const assignHardwareModSlot = useCallback((slotIndex, route) => {
    const slot = MOD_SLOT_NRPN[slotIndex];
    if (!slot) return;

    const sourceValue = route ? hardwareSourceMap[route.sourceId] ?? 0 : 0;
    const destinationValue = route ? paramsMeta[route.targetId]?.modDestination ?? 0 : 0;
    const depthValue = route ? clamp7(route.amount) : 64;

    sendNRPN(slot.source1[0], slot.source1[1], sourceValue);
    sendNRPN(slot.source2[0], slot.source2[1], 0);
    sendNRPN(slot.depth[0], slot.depth[1], depthValue);
    sendNRPN(slot.destination[0], slot.destination[1], destinationValue);
  }, [hardwareSourceMap, paramsMeta, sendNRPN]);

  const assignHardwareMacroSlot = useCallback((slotIndex, route) => {
    const slot = MACRO_SLOT_NRPN[slotIndex];
    if (!slot) return;
    const destinationValue = route ? paramsMeta[route.targetId]?.macroDestination ?? paramsMeta[route.targetId]?.modDestination ?? 0 : 0;
    sendNRPN(slot.destination[0], slot.destination[1], destinationValue);
    sendNRPN(slot.start[0], slot.start[1], route ? clamp7(route.start) : 0);
    sendNRPN(slot.end[0], slot.end[1], route ? clamp7(route.end) : 127);
    sendNRPN(slot.depth[0], slot.depth[1], route ? clamp7(route.depth) : 0);
  }, [paramsMeta, sendNRPN]);

  const syncHardwareModMatrix = useCallback((routes = []) => {
    const hardwareRoutes = routes.filter((route) => Number.isInteger(hardwareSourceMap[route.sourceId]) && Number.isInteger(paramsMeta[route.targetId]?.modDestination)).slice(0, MOD_SLOT_NRPN.length);
    const signature = JSON.stringify(hardwareRoutes.map((route) => ({ sourceId: route.sourceId, targetId: route.targetId, amount: clamp7(route.amount) })));
    if (signature === syncedRouteSignatureRef.current) return;
    syncedRouteSignatureRef.current = signature;
    MOD_SLOT_NRPN.forEach((_, index) => assignHardwareModSlot(index, hardwareRoutes[index] || null));
  }, [assignHardwareModSlot, hardwareSourceMap, paramsMeta]);

  const syncHardwareMacroMatrix = useCallback((routes = []) => {
    const hardwareRoutes = routes.filter((route) => Number.isInteger(macroSourceMap[route.sourceId]) && Number.isInteger(paramsMeta[route.targetId]?.macroDestination ?? paramsMeta[route.targetId]?.modDestination)).slice(0, MACRO_SLOT_NRPN.length);
    const signature = JSON.stringify(hardwareRoutes.map((route) => ({ sourceId: route.sourceId, targetId: route.targetId, depth: clamp7(route.depth), start: clamp7(route.start), end: clamp7(route.end) })));
    if (signature === syncedMacroRouteSignatureRef.current) return;
    syncedMacroRouteSignatureRef.current = signature;

    const slottedRoutes = Array.from({ length: MACRO_SLOT_NRPN.length }, () => null);
    hardwareRoutes.forEach((route) => {
      const macroIndex = macroSourceMap[route.sourceId] ?? 0;
      const existingCount = slottedRoutes.slice(macroIndex * MACRO_TARGETS_PER_SECTION, macroIndex * MACRO_TARGETS_PER_SECTION + MACRO_TARGETS_PER_SECTION).filter(Boolean).length;
      const slotIndex = macroIndex * MACRO_TARGETS_PER_SECTION + existingCount;
      slottedRoutes[slotIndex] = route;
    });

    MACRO_SLOT_NRPN.forEach((_, index) => assignHardwareMacroSlot(index, slottedRoutes[index]));
  }, [assignHardwareMacroSlot, macroSourceMap, paramsMeta]);

  const pushAllParams = useCallback((params) => {
    Object.entries(params).forEach(([paramId, value]) => sendParamValue(paramId, value));
  }, [sendParamValue]);

  const invalidateRouteSync = useCallback(() => {
    syncedRouteSignatureRef.current = '';
  }, []);

  const invalidateMacroRouteSync = useCallback(() => {
    syncedMacroRouteSignatureRef.current = '';
  }, []);

  const playNote = useCallback((note = 60, velocity = 110, durationMs = 120) => {
    const output = getOutput();
    if (!output) return;
    const safeNote = clamp7(note);
    const safeVelocity = clamp7(velocity);
    output.send([0x90 + synthChannel, safeNote, safeVelocity]);
    window.setTimeout(() => {
      output.send([0x80 + synthChannel, safeNote, 0]);
    }, Math.max(20, durationMs));
  }, [getOutput, synthChannel]);

  const playPreviewNote = useCallback((isOn) => {
    const output = getOutput();
    if (!output) return;
    output.send(isOn ? [0x90 + synthChannel, 60, 110] : [0x80 + synthChannel, 60, 0]);
  }, [getOutput, synthChannel]);

  const requestCurrentPatchDump = useCallback((program = null) => {
    const output = getOutput();
    if (!output) return Promise.reject(new Error('No MIDI output selected.'));
    
    if (pendingPatchDumpRef.current) {
      if (pendingPatchDumpRef.current.timeoutId) {
        window.clearTimeout(pendingPatchDumpRef.current.timeoutId);
      }
      pendingPatchDumpRef.current = null;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        if (pendingPatchDumpRef.current) {
          pendingPatchDumpRef.current = null;
          reject(new Error('No patch dump received from hardware.'));
        }
      }, 1800);

      pendingPatchDumpRef.current = { resolve, reject, timeoutId };

      if (Number.isInteger(program)) {
        output.send([0xc0 + synthChannel, clamp7(program)]);
      }
      
      const sysex = [0xf0, ...NOVATION_SYSEX_HEADER, 0x40, synthChannel, 0xf7];
      window.setTimeout(() => output.send(sysex), 120);
    });
  }, [getOutput, synthChannel]);

  const sendPatchToHardware = useCallback(({ params = {}, routes = [], macroRoutes = [], patchName = '', program = null, basePayload = null, preservedHardwareRoutes = [], preservedHardwareMacroRoutes = [], patchCategory = null, patchGenre = null } = {}) => {
    const output = getOutput();
    if (!output) return Promise.reject(new Error('No MIDI output selected.'));

    return new Promise((resolve) => {
      const sendPayload = () => {
        const command = Number.isInteger(program) ? 0x01 : 0x00;
        const location = Number.isInteger(program) ? program : synthChannel;
        const sysex = buildPatchSysexMessage({
          params,
          routes,
          macroRoutes,
          patchName,
          paramsMeta,
          hardwareSourceMap,
          macroSourceMap,
          basePayload,
          preservedHardwareRoutes,
          preservedHardwareMacroRoutes,
          patchCategory,
          patchGenre,
          command,
          location,
        });
        output.send(sysex);
        resolve({ ok: true, bytes: sysex.length, program });
      };

      sendPayload();
    });
  }, [getOutput, synthChannel, paramsMeta, hardwareSourceMap, macroSourceMap]);

  return {
    outputs,
    inputs,
    selectedOutputId,
    setSelectedOutputId,
    selectedInputId,
    setSelectedInputId,
    sendCC,
    sendNRPN,
    sendParamValue,
    sendProgramChange,
    assignHardwareModSlot,
    assignHardwareMacroSlot,
    syncHardwareModMatrix,
    syncHardwareMacroMatrix,
    pushAllParams,
    invalidateRouteSync,
    invalidateMacroRouteSync,
    playPreviewNote,
    playNote,
    requestCurrentPatchDump,
    sendPatchToHardware,
    midiAvailable: Boolean(midiAccess),
    error,
  };
}
