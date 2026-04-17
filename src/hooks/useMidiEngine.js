import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp7 } from '../utils/app.js';
import { NOVATION_SYSEX_HEADER, PATCH_BYTE_MAP, PATCH_NAME_RANGE } from '../data/circuitTracks.js';

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
const PATCH_DATA_LENGTH = 348;

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

function parsePatchDump(message, paramsMeta) {
  const bytes = Array.from(message);
  if (bytes[0] !== 0xf0 || bytes[bytes.length - 1] !== 0xf7) return null;
  const header = bytes.slice(1, 6);
  if (header.join(',') !== NOVATION_SYSEX_HEADER.join(',')) return null;

  const patchData = bytes.slice(8, -1);
  const params = {};
  
  Object.entries(PATCH_BYTE_MAP).forEach(([paramId, byteIndex]) => {
    if (typeof patchData[byteIndex] === 'number' && paramsMeta[paramId]) {
      params[paramId] = clamp7(patchData[byteIndex]);
    }
  });

  const routes = [];
  for (let i = 0; i < 20; i += 1) {
    const offset = 116 + i * 4;
    const source1 = patchData[offset];
    const depth = patchData[offset + 2];
    const destination = patchData[offset + 3];
    if (!source1 || !destination) continue;
    routes.push({ slot: i, source: source1, depth, destination });
  }

  const macroRoutes = [];
  for (let macroIndex = 0; macroIndex < 8; macroIndex += 1) {
    const baseOffset = 196 + macroIndex * 17;
    for (let slot = 0; slot < 4; slot += 1) {
      const offset = baseOffset + 1 + slot * 4;
      const destination = patchData[offset];
      if (!destination) continue;
      macroRoutes.push({ slot: macroIndex * 4 + slot, destination, start: patchData[offset + 1], end: patchData[offset + 2], depth: patchData[offset + 3] });
    }
  }

  return {
    raw: bytes,
    rawPayload: patchData, // We expose the raw 348 bytes so we can use them as a foundation!
    patchName: decodePatchName(patchData),
    params,
    hardwareRoutes: routes,
    hardwareMacroRoutes: macroRoutes,
  };
}

// Accepts a basePayload to ensure hidden params (like Volume) are preserved
function buildPatchPayload({ params, routes = [], macroRoutes = [], patchName = '', paramsMeta, hardwareSourceMap, macroSourceMap, basePayload }) {
  const patchData = basePayload ? [...basePayload] : new Array(PATCH_DATA_LENGTH).fill(0);

  if (!basePayload) {
    patchData[1] = 127;
    patchData[2] = 127;
  } else {
    // CRITICAL: We surgically wipe the old matrices so ghost routes don't bleed through
    for (let i = 116; i < 196; i++) patchData[i] = 0; // Wipe Mod Matrix
    for (let m = 0; m < 8; m++) {
      for (let b = 1; b < 17; b++) patchData[196 + m * 17 + b] = 0; // Wipe Macro Targets
    }
  }

  Object.entries(PATCH_BYTE_MAP).forEach(([paramId, byteIndex]) => {
    if (byteIndex >= 0 && byteIndex < patchData.length) {
      patchData[byteIndex] = clamp7(params?.[paramId] ?? paramsMeta[paramId]?.defaultValue ?? 0);
    }
  });

  routes.filter((route) => Number.isInteger(hardwareSourceMap[route.sourceId]) && Number.isInteger(paramsMeta[route.targetId]?.modDestination))
    .slice(0, 20)
    .forEach((route, index) => {
      const offset = 116 + index * 4;
      patchData[offset] = clamp7(hardwareSourceMap[route.sourceId]);
      patchData[offset + 1] = 0; 
      patchData[offset + 2] = clamp7(route.amount ?? 64);
      patchData[offset + 3] = clamp7(paramsMeta[route.targetId]?.modDestination ?? 0);
    });

  const slottedMacroRoutes = Array.from({ length: 32 }, () => null);
  macroRoutes.filter((route) => Number.isInteger(macroSourceMap[route.sourceId]) && Number.isInteger(paramsMeta[route.targetId]?.macroDestination ?? paramsMeta[route.targetId]?.modDestination))
    .slice(0, 32)
    .forEach((route) => {
      const macroIndex = macroSourceMap[route.sourceId];
      const slotOffset = slottedMacroRoutes.slice(macroIndex * 4, macroIndex * 4 + 4).filter(Boolean).length;
      if (slotOffset < 4) slottedMacroRoutes[macroIndex * 4 + slotOffset] = route;
    });

  slottedMacroRoutes.forEach((route, index) => {
    if (!route) return;
    const offset = 196 + Math.floor(index / 4) * 17 + 1 + (index % 4) * 4;
    patchData[offset] = clamp7(paramsMeta[route.targetId]?.macroDestination ?? paramsMeta[route.targetId]?.modDestination ?? 0);
    patchData[offset + 1] = clamp7(route.start ?? 0);
    patchData[offset + 2] = clamp7(route.end ?? 127);
    patchData[offset + 3] = clamp7(route.depth ?? 64);
  });

  encodePatchName(patchData, patchName);
  return patchData;
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
      const existingCount = slottedRoutes.slice(macroIndex * 4, macroIndex * 4 + 4).filter(Boolean).length;
      const slotIndex = macroIndex * 4 + existingCount;
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

  const sendPatchToHardware = useCallback(({ params = {}, routes = [], macroRoutes = [], patchName = '', program = null, basePayload = null } = {}) => {
    const output = getOutput();
    if (!output) return Promise.reject(new Error('No MIDI output selected.'));

    return new Promise((resolve) => {
      const payload = buildPatchPayload({
        params,
        routes,
        macroRoutes,
        patchName,
        paramsMeta,
        hardwareSourceMap,
        macroSourceMap,
        basePayload
      });

      const sendPayload = () => {
        const sysex = [0xf0, ...NOVATION_SYSEX_HEADER, 0x00, synthChannel, ...payload.map(clamp7), 0xf7];
        output.send(sysex);
        resolve({ ok: true, bytes: payload.length, program });
      };

      if (Number.isInteger(program)) {
        output.send([0xc0 + synthChannel, clamp7(program)]);
        window.setTimeout(sendPayload, 150);
      } else {
        sendPayload();
      }
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
