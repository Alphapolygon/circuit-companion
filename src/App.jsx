import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Cpu, FolderOpen, Radio, Save, Volume2 } from 'lucide-react';
import TopNav from './components/ui/TopNav.jsx';
import ModSourceChip from './components/ui/ModSourceChip.jsx';
import OscTab from './components/tabs/OscTab.jsx';
import MixTab from './components/tabs/MixTab.jsx';
import ModTab from './components/tabs/ModTab.jsx';
import PatchTab from './components/tabs/PatchTab.jsx';
import PerformTab from './components/tabs/PerformTab.jsx';
import FxTab from './components/tabs/FxTab.jsx';
import GlobalTab from './components/tabs/GlobalTab.jsx';
import DrumsTab from './components/tabs/DrumsTab.jsx';
import OptionSelector from './components/ui/OptionSelector.jsx';
import {
  DEFAULT_MACRO_ROUTES,
  DEFAULT_PARAMS,
  DEFAULT_PROJECTS,
  DEFAULT_ROUTES,
  DEFAULT_SEQUENCE,
  FACTORY_PATCHES,
  HARDWARE_MOD_SLOT_COUNT,
  MACRO_SOURCES,
  MOD_SOURCES,
  PARAMS,
  PATCH_STORAGE_KEY,
  PROJECT_STORAGE_KEY,
  SYNTH_CHANNELS,
  TABS,
} from './data/circuitTracks.js';
import { usePersistentState } from './hooks/usePersistentState.js';
import { useModMatrix } from './hooks/useModMatrix.js';
import { useMacroMatrix } from './hooks/useMacroMatrix.js';
import { useMidiEngine } from './hooks/useMidiEngine.js';
import { useSequencer } from './hooks/useSequencer.js';

const TAB_COMPONENTS = {
  OSC: OscTab,
  MIX: MixTab,
  FX: FxTab,
  MOD: ModTab,
  PATCH: PatchTab,
  PERFORM: PerformTab,
  GLOBAL: GlobalTab,
  DRUMS: DrumsTab,
};

function clampValue(value) {
  return Math.max(0, Math.min(127, Number(value) || 0));
}

function mapHardwareRoute(parsedRoute, modSources, paramsMeta) {
  const source = modSources.find((entry) => entry.hardwareSourceId === parsedRoute.source);
  const targetEntry = Object.entries(paramsMeta).find(([, meta]) => meta.modDestination === parsedRoute.destination);
  if (!source || !targetEntry) return null;
  return {
    id: crypto.randomUUID(),
    sourceId: source.id,
    targetId: targetEntry[0],
    amount: parsedRoute.depth,
  };
}

function mapHardwareMacroRoute(parsedRoute, macroSources, paramsMeta) {
  const macroIndex = Math.floor(parsedRoute.slot / 4);
  const source = macroSources[macroIndex];
  const targetEntry = Object.entries(paramsMeta).find(([, meta]) => (meta.macroDestination ?? meta.modDestination) === parsedRoute.destination);
  if (!source || !targetEntry) return null;
  return {
    id: crypto.randomUUID(),
    sourceId: source.id,
    targetId: targetEntry[0],
    start: parsedRoute.start,
    end: parsedRoute.end,
    depth: parsedRoute.depth,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('OSC');
  const [synthChannel, setSynthChannel] = useState(0);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [patchName, setPatchName] = useState('My Patch');
  const [projectName, setProjectName] = useState('New Project');
  const [sequence, setSequence] = useState(DEFAULT_SEQUENCE);
  const [hardwarePatchStatus, setHardwarePatchStatus] = useState('');
  const [patches, setPatches] = usePersistentState(PATCH_STORAGE_KEY, FACTORY_PATCHES);
  const [projects, setProjects] = usePersistentState(PROJECT_STORAGE_KEY, DEFAULT_PROJECTS);
  const [hardwareSaveSlot, setHardwareSaveSlot] = useState(1);
  const [activeLockStep, setActiveLockStep] = useState(null);

  const mod = useModMatrix({ modSources: MOD_SOURCES, paramsMeta: PARAMS, initialRoutes: DEFAULT_ROUTES });
  const macroMod = useMacroMatrix({ macroSources: MACRO_SOURCES, paramsMeta: PARAMS, initialRoutes: DEFAULT_MACRO_ROUTES, maxRoutes: 32 });
  const skipParamPushRef = useRef(false);

  const onIncomingParam = useCallback((paramId, value) => {
    setParams((current) => ({ ...current, [paramId]: clampValue(value) }));
  }, []);

  const midi = useMidiEngine({ synthChannel, paramsMeta: PARAMS, modSources: MOD_SOURCES, macroSources: MACRO_SOURCES, onIncomingParam });

  const updateStepLock = useCallback((stepIndex, paramId, value) => {
    setSequence((current) => current.map((step) => step.index === stepIndex ? { ...step, locks: { ...(step.locks || {}), [paramId]: value } } : step));
  }, []);

  const updateParam = useCallback((paramId, value) => {
    const nextValue = clampValue(value);
    setParams((current) => ({ ...current, [paramId]: nextValue }));

    const isDrumParam = paramId.startsWith('drum_');
    midi.sendParamValue(paramId, nextValue, isDrumParam ? { channelOverride: 9 } : undefined);

    if (activeLockStep !== null && !isDrumParam && PARAMS[paramId] && (Number.isInteger(PARAMS[paramId].cc) || Array.isArray(PARAMS[paramId].nrpn))) {
      updateStepLock(activeLockStep, paramId, nextValue);
    }
  }, [midi, activeLockStep, updateStepLock]);

  const { 
    selectedOutputId, 
    invalidateRouteSync, 
    invalidateMacroRouteSync, 
    syncHardwareModMatrix, 
    syncHardwareMacroMatrix 
  } = midi;

  useEffect(() => {
    if (skipParamPushRef.current) {
      skipParamPushRef.current = false;
      return;
    }
    if (!selectedOutputId) return;
    
    invalidateRouteSync();
    invalidateMacroRouteSync();
    syncHardwareModMatrix(mod.routes);
    syncHardwareMacroMatrix(macroMod.routes);
    
  }, [
    mod.routes, 
    macroMod.routes, 
    synthChannel, 
    selectedOutputId, 
    invalidateRouteSync, 
    invalidateMacroRouteSync, 
    syncHardwareModMatrix, 
    syncHardwareMacroMatrix
  ]);

  const applyPatchState = useCallback((nextParams, nextRoutes = mod.routes, nextMacroRoutes = macroMod.routes, pushToHardware = true) => {
    skipParamPushRef.current = true;
    setParams(nextParams);
    mod.setRoutes(nextRoutes);
    macroMod.setRoutes(nextMacroRoutes);
    
    if (pushToHardware) {
      requestAnimationFrame(() => {
        midi.pushAllParams(nextParams);
        midi.invalidateRouteSync();
        midi.invalidateMacroRouteSync();
        midi.syncHardwareModMatrix(nextRoutes);
        midi.syncHardwareMacroMatrix(nextMacroRoutes);
      });
    }
  }, [midi, mod, macroMod]);

  const savePatch = () => {
    const nextPatch = {
      id: crypto.randomUUID(),
      name: patchName.trim() || 'Untitled Patch',
      author: 'User',
      params,
      routes: mod.routes,
      macroRoutes: macroMod.routes,
    };
    setPatches((current) => [nextPatch, ...current]);
  };

  const loadPatch = (patchId) => {
    const patch = patches.find((entry) => entry.id === patchId);
    if (!patch) return;

    const isHardware = Number.isInteger(patch.program);
    if (isHardware && midi.sendProgramChange) {
      midi.sendProgramChange(patch.program);
    }

    applyPatchState({ ...DEFAULT_PARAMS, ...patch.params }, patch.routes || [], patch.macroRoutes || [], !isHardware);
    setPatchName(patch.name);
  };

  const deletePatch = (patchId) => setPatches((current) => current.filter((entry) => entry.id !== patchId));

  const saveProject = () => {
    const nextProject = {
      id: crypto.randomUUID(),
      name: projectName.trim() || 'Untitled Project',
      bpm: params.global_bpm,
      activePatchId: patchName.trim() || 'Current',
      params,
      routes: mod.routes,
      macroRoutes: macroMod.routes,
      sequence,
      synthChannel,
    };
    setProjects((current) => [nextProject, ...current]);
  };

  const loadProject = (projectId) => {
    const project = projects.find((entry) => entry.id === projectId);
    if (!project) return;
    setProjectName(project.name);
    applyPatchState({ ...DEFAULT_PARAMS, ...project.params }, project.routes || [], project.macroRoutes || []);
    setSequence(project.sequence || DEFAULT_SEQUENCE);
    setSynthChannel(project.synthChannel ?? 0);
  };

  const deleteProject = (projectId) => setProjects((current) => current.filter((entry) => entry.id !== projectId));

  const exportState = () => {
    const blob = new Blob([
      JSON.stringify({ params, routes: mod.routes, macroRoutes: macroMod.routes, patches, projects, sequence, synthChannel, hardwareSaveSlot }, null, 2),
    ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'circuit-companion-state.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importState = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    const importedParams = parsed.params ? { ...DEFAULT_PARAMS, ...parsed.params } : params;
    const importedRoutes = parsed.routes || mod.routes;
    const importedMacroRoutes = parsed.macroRoutes || macroMod.routes;
    applyPatchState(importedParams, importedRoutes, importedMacroRoutes);
    if (parsed.patches) setPatches(parsed.patches);
    if (parsed.projects) setProjects(parsed.projects);
    if (parsed.sequence) setSequence(parsed.sequence);
    if (typeof parsed.synthChannel === 'number') setSynthChannel(parsed.synthChannel);
    if (typeof parsed.hardwareSaveSlot === 'number') setHardwareSaveSlot(parsed.hardwareSaveSlot);
    event.target.value = '';
  };

  const burnPatchToHardware = useCallback(async () => {
    setHardwarePatchStatus(`Capturing active state & Queueing to slot ${hardwareSaveSlot}…`);
    try {
      const dump = await midi.requestCurrentPatchDump();
      
      await midi.sendPatchToHardware({
        params,
        routes: mod.routes,
        macroRoutes: macroMod.routes,
        patchName,
        program: hardwareSaveSlot - 1,
        basePayload: dump.rawPayload
      });
      setHardwarePatchStatus(`Queued ${patchName || 'current patch'} to slot ${hardwareSaveSlot}. Press SAVE on device!`);
    } catch (err) {
      setHardwarePatchStatus(err.message || 'Hardware burn failed.');
    }
  }, [midi, params, mod.routes, macroMod.routes, patchName, hardwareSaveSlot]);

  const fetchPatchFromHardware = useCallback(async () => {
    setHardwarePatchStatus('Requesting patch from hardware…');
    try {
      const parsed = await midi.requestCurrentPatchDump();
      const nextParams = { ...DEFAULT_PARAMS, ...parsed.params };
      const nextRoutes = parsed.hardwareRoutes.map((route) => mapHardwareRoute(route, MOD_SOURCES, PARAMS)).filter(Boolean);
      const nextMacroRoutes = parsed.hardwareMacroRoutes.map((route) => mapHardwareMacroRoute(route, MACRO_SOURCES, PARAMS)).filter(Boolean);
      applyPatchState(nextParams, nextRoutes, nextMacroRoutes, false);
      if (parsed.patchName) setPatchName(parsed.patchName);
      setHardwarePatchStatus(parsed.patchName ? `Loaded ${parsed.patchName} from hardware.` : 'Loaded current hardware patch.');
    } catch (err) {
      setHardwarePatchStatus(err.message || 'Hardware patch request failed.');
    }
  }, [applyPatchState, midi]);

  const syncAllHardwarePatches = useCallback(async () => {
    if (!midi.selectedOutputId || !midi.selectedInputId) {
      setHardwarePatchStatus('Error: Both MIDI Out and MIDI In must be selected!');
      return;
    }

    setHardwarePatchStatus('Starting bulk sync... Please wait (~15 seconds).');
    const hwPatches = [];

    for (let i = 0; i < 64; i++) {
      try {
        setHardwarePatchStatus(`Fetching slot ${i + 1} of 64...`);
        const parsed = await midi.requestCurrentPatchDump(i);

        const nextParams = { ...DEFAULT_PARAMS, ...parsed.params };
        const nextRoutes = parsed.hardwareRoutes.map((route) => mapHardwareRoute(route, MOD_SOURCES, PARAMS)).filter(Boolean);
        const nextMacroRoutes = parsed.hardwareMacroRoutes.map((route) => mapHardwareMacroRoute(route, MACRO_SOURCES, PARAMS)).filter(Boolean);

        hwPatches.push({
          id: `hw-synth${synthChannel + 1}-slot${i + 1}`,
          name: parsed.patchName || `HW Slot ${i + 1}`,
          author: `Circuit Synth ${synthChannel + 1}`,
          params: nextParams,
          routes: nextRoutes,
          macroRoutes: nextMacroRoutes,
          program: i,
        });

        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (err) {
        console.error(`Failed to fetch slot ${i + 1}`, err);
        setHardwarePatchStatus(`Sync aborted at slot ${i + 1}: ${err.message}. Ensure Circuit is not busy.`);
        return; 
      }
    }

    setPatches((current) => {
      const filtered = current.filter(p => !p.id.startsWith(`hw-synth${synthChannel + 1}-`));
      return [...hwPatches, ...filtered];
    });

    setHardwarePatchStatus(`Successfully synced ${hwPatches.length} patches from hardware.`);
  }, [midi, synthChannel, setPatches]);

  const toggleStep = (index) => {
    setSequence((current) => current.map((step) => step.index === index ? { ...step, active: !step.active } : step));
  };

  const cycleStepProbability = (index) => {
    const values = [25, 50, 75, 100];
    setSequence((current) => current.map((step) => {
      if (step.index !== index) return step;
      const currentIdx = values.indexOf(step.probability ?? 100);
      return { ...step, probability: values[(currentIdx + 1) % values.length] };
    }));
  };

  const updateStepNotes = useCallback((index, notes) => {
    setSequence((current) => current.map((step) => step.index === index ? { ...step, note: notes } : step));
  }, []);

  const clearStepLocks = useCallback((index) => {
    setSequence((current) => current.map((step) => step.index === index ? { ...step, locks: {} } : step));
  }, []);

  const sequencer = useSequencer({
    sequence,
    bpm: params.global_bpm,
    swing: params.global_swing,
    probabilityBias: params.global_prob,
    onStep: ({ notes, velocity, gate, stepMs, locks }) => {
      Object.entries(locks || {}).forEach(([paramId, value]) => midi.sendParamValue(paramId, value));
      const durationMs = Math.max(40, stepMs * (gate / 127));
      notes.forEach((note) => midi.playNote(note, velocity, durationMs));
    },
  });

  const effectiveParams = useMemo(() => {
    const result = { ...params };
    
    macroMod.routes.forEach((route) => {
      const macroVal = params[route.sourceId] || 0;
      const start = route.start ?? 0;
      const end = route.end ?? 127;
      const depth = route.depth ?? 64;
      
      let progress = 0;
      if (start < end) {
        if (macroVal >= end) progress = 1;
        else if (macroVal > start) progress = (macroVal - start) / (end - start);
      } else if (start > end) { // Inverted range
        if (macroVal <= end) progress = 1;
        else if (macroVal < start) progress = (start - macroVal) / (start - end);
      }
      
      const depthNormalized = (depth - 64) / 63; 
      const offset = progress * depthNormalized * 127;
      
      if (result[route.targetId] !== undefined) {
        result[route.targetId] = Math.max(0, Math.min(127, Math.round(result[route.targetId] + offset)));
      }
    });
    
    return result;
  }, [params, macroMod.routes]);

  const summary = useMemo(() => ({
    patch: patchName,
    routes: mod.routes.length,
    midi: midi.selectedOutputId ? 'Connected' : 'No Port',
    armedSource: mod.armedSource ? mod.armedSource.replaceAll('_', ' ') : (macroMod.armedSource ? macroMod.armedSource.replaceAll('_', ' ') : 'None'),
  }), [patchName, mod.routes.length, midi.selectedOutputId, mod.armedSource, macroMod.armedSource]);

  const ActiveTab = TAB_COMPONENTS[activeTab];

  return (
    <div className="app-shell compact-shell">
      <header className="hero-bar compact-hero">
        <div className="brand-block compact-brand">
          <div className="brand-title">Circuit Companion</div>
          <div className="brand-subtitle">Modern Circuit Tracks editor with dense plugin-style layout</div>
        </div>
        <TopNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        <div className="hero-actions compact-actions">
            <OptionSelector 
              label="Track" 
              value={synthChannel} 
              options={SYNTH_CHANNELS.map((item) => ({ label: `${item.label} · Ch ${item.midi}`, value: item.value }))}
              onChange={(val) => setSynthChannel(Number(val))} 
            />
          <button className="hero-button" onPointerDown={() => midi.playPreviewNote(true)} onPointerUp={() => midi.playPreviewNote(false)} onPointerLeave={() => midi.playPreviewNote(false)}>
            <Volume2 size={14} /> Preview
          </button>
        </div>
      </header>

      <section className="status-strip">
        <div className="status-pill"><span>Patch</span><strong>{summary.patch}</strong></div>
        <div className="status-pill"><span>Routes</span><strong>{summary.routes}/{HARDWARE_MOD_SLOT_COUNT}</strong></div>
        <div className="status-pill"><span>MIDI</span><strong>{summary.midi}</strong></div>
        <div className="status-pill"><span>Armed</span><strong>{summary.armedSource}</strong></div>
      </section>

     <section className="workspace-grid compact-workspace">
        <aside className="left-rail compact-rail">
          <div className="rail-panel">
            <div className="rail-title"><Radio size={14} /> Mod Sources</div>
            <div className="mod-chip-list compact-chip-list">
              {MOD_SOURCES.map((source) => (
                <ModSourceChip key={source.id} source={source} armed={mod.armedSource === source.id} onArm={mod.setArmedSource} onDragStart={mod.onSourceDragStart} />
              ))}
            </div>

            <div className="rail-title" style={{ marginTop: '14px' }}><Cpu size={14} /> Macro Sources</div>
            <div className="mod-chip-list compact-chip-list">
              {MACRO_SOURCES.map((source) => (
                <ModSourceChip key={source.id} source={source} armed={macroMod.armedSource === source.id} onArm={macroMod.setArmedSource} onDragStart={macroMod.onSourceDragStart} />
              ))}
            </div>
          </div>
          
          <div className="rail-panel compact">
            <div className="rail-title"><FolderOpen size={14} /> Live Routes</div>
            <div className="live-route-list compact-route-list">
              {mod.routes.map((route) => (
                <div key={route.id} className="live-route-item">
                  <span style={{ color: mod.getSourceTheme(route.sourceId) }}>{route.sourceId.replaceAll('_', ' ')}</span>
                  <span>→</span>
                  <span>{PARAMS[route.targetId]?.label || route.targetId}</span>
                </div>
              ))}
              {macroMod.routes.map((route) => (
                <div key={route.id} className="live-route-item macro-route-item">
                  <span style={{ color: macroMod.getSourceTheme(route.sourceId) }}>{route.sourceId.replaceAll('_', ' ')}</span>
                  <span>→</span>
                  <span>{PARAMS[route.targetId]?.label || route.targetId}</span>
                </div>
              ))}
              {mod.routes.length === 0 && macroMod.routes.length === 0 && (
                <div style={{fontSize: '0.65rem', color: '#8f9fb5', textAlign: 'center', padding: '10px 0'}}>No routes active</div>
              )}
            </div>
          </div>

          <div className="rail-panel compact">
            <div className="rail-title"><Activity size={14} /> Easy UX</div>
            <ul className="hint-list compact-hints">
              <li>Drag mod chips to lit destinations.</li>
              <li>Click source then target works too.</li>
              <li>Select a sequencer lock to write motion.</li>
            </ul>
          </div>
          
          <div className="rail-panel compact">
            <div className="rail-title"><Save size={14} /> MIDI</div>
            <div className="field-stack compact-stack">
              <OptionSelector
                label="Out"
                value={midi.selectedOutputId}
                options={[{label: 'No output', value: ''}, ...midi.outputs.map((port) => ({label: port.name, value: port.id}))]}
                onChange={midi.setSelectedOutputId}
              />
              <OptionSelector
                label="In"
                value={midi.selectedInputId}
                options={[{label: 'No input', value: ''}, ...midi.inputs.map((port) => ({label: port.name, value: port.id}))]}
                onChange={midi.setSelectedInputId}
              />
            </div>
          </div>
        </aside>

        <main className="main-stage compact-stage">
          <ActiveTab
            params={params}
            effectiveParams={effectiveParams}
            updateParam={updateParam}
            mod={mod}
            macroMod={macroMod}
            routes={mod.routes}
            patchName={patchName}
            setPatchName={setPatchName}
            projectName={projectName}
            setProjectName={setProjectName}
            patches={patches}
            projects={projects}
            savePatch={savePatch}
            loadPatch={loadPatch}
            deletePatch={deletePatch}
            saveProject={saveProject}
            loadProject={loadProject}
            deleteProject={deleteProject}
            exportState={exportState}
            importState={importState}
            fetchPatchFromHardware={fetchPatchFromHardware}
            syncAllHardwarePatches={syncAllHardwarePatches}
            burnPatchToHardware={burnPatchToHardware}
            hardwarePatchStatus={hardwarePatchStatus}
            hardwareSaveSlot={hardwareSaveSlot}
            setHardwareSaveSlot={setHardwareSaveSlot}
            sequence={sequence}
            toggleStep={toggleStep}
            cycleStepProbability={cycleStepProbability}
            sequencer={sequencer}
            activeLockStep={activeLockStep}
            setActiveLockStep={setActiveLockStep}
            updateStepNotes={updateStepNotes}
            clearStepLocks={clearStepLocks}
          />
        </main>
      </section>
    </div>
  );
}
