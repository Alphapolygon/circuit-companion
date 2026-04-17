import React, { useRef } from 'react';
import Panel from '../ui/Panel.jsx';

export default function PatchTab({
  patchName,
  setPatchName,
  projectName,
  setProjectName,
  patches,
  projects,
  savePatch,
  loadPatch,
  deletePatch,
  saveProject,
  loadProject,
  deleteProject,
  exportState,
  importState,
  exportPatchSysex,
  importPatchSysex,
  fetchPatchFromHardware,
  syncAllHardwarePatches,
  burnPatchToHardware,
  hardwarePatchStatus,
  hardwareSaveSlot,
  setHardwareSaveSlot,
}) {
  const fileRef = useRef(null);
  const sysexFileRef = useRef(null);

  return (
    <div className="tab-layout serum-tab-grid patch-serum-grid">
      <Panel title="Patch Library" className="serum-panel-wide">
        
        {/* HARDWARE SYNC TOOLBAR */}
        <div className="toolbar-row compact-toolbar-row serum-toolbar-grid" style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', marginBottom: '10px' }}>
          <button className="hero-button ghost" onClick={fetchPatchFromHardware}>Fetch Active</button>
          <button className="hero-button ghost" onClick={syncAllHardwarePatches} style={{ color: '#ffbb55', borderColor: 'rgba(255, 187, 85, 0.3)' }}>
            Sync All 64 from Device
          </button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
          <label className="inline-select compact-select">
            <span>Burn To</span>
            <select value={hardwareSaveSlot} onChange={(event) => setHardwareSaveSlot(Number(event.target.value))}>
              {Array.from({ length: 64 }, (_, index) => (
                <option key={index + 1} value={index + 1}>Slot {index + 1}</option>
              ))}
            </select>
          </label>
          <button className="hero-button" onClick={burnPatchToHardware} style={{ background: '#2a1317', color: '#ff8da0', border: '1px solid rgba(255,141,160,0.3)' }}>Burn</button>
        </div>

        <div className="toolbar-row compact-toolbar-row serum-toolbar-grid">
          <input className="text-input" value={patchName} onChange={(event) => setPatchName(event.target.value)} placeholder="Patch name" />
          <button className="hero-button" onClick={savePatch}>Save Locally</button>
        </div>

        {hardwarePatchStatus ? <div className="info-card" style={{marginBottom: '10px'}}><strong>Hardware Status</strong><span style={{color: '#63f08a'}}>{hardwarePatchStatus}</span></div> : null}
        
        {/* PATCH BROWSER */}
        <div className="browser-list compact-browser-list serum-browser-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {patches.map((patch) => (
            <div key={patch.id} className="browser-row compact-browser-row">
              <button className="browser-main" onClick={() => loadPatch(patch.id)}>
                <strong>{patch.name}</strong>
                <span>{patch.author || 'User Patch'}</span>
              </button>
              <div className="browser-actions">
                <span className="tag">Load</span>
                {!patch.id.startsWith('factory-') && !patch.id.startsWith('hw-') && (
                  <button className="danger-button mini-danger" onClick={() => deletePatch(patch.id)}>×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Project State" className="serum-panel-stack">
        <div className="toolbar-row compact-toolbar-row">
          <input className="text-input" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" />
          <button className="hero-button" onClick={saveProject}>Save Project</button>
        </div>
        <div className="browser-list compact-browser-list serum-browser-list">
          {projects.map((project) => (
            <div key={project.id} className="browser-row compact-browser-row">
              <button className="browser-main" onClick={() => loadProject(project.id)}>
                <strong>{project.name}</strong>
                <span>{project.bpm} BPM · patch {project.activePatchId || 'current'}</span>
              </button>
              <div className="browser-actions">
                <span className="tag">Load</span>
                {!project.id.startsWith('project-1') && <button className="danger-button mini-danger" onClick={() => deleteProject(project.id)}>×</button>}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Backup + Share" className="full-width">
        <div className="toolbar-row compact-toolbar-row" style={{ flexWrap: 'wrap' }}>
          <button className="hero-button" onClick={exportPatchSysex}>Export Patch .syx</button>
          <button className="hero-button ghost" onClick={() => sysexFileRef.current?.click()}>Import Patch .syx</button>
          <input ref={sysexFileRef} type="file" accept=".syx,application/octet-stream,audio/x-midi" hidden onChange={importPatchSysex} />
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '0 8px' }} />
          <button className="hero-button" onClick={exportState}>Export Backup JSON</button>
          <button className="hero-button ghost" onClick={() => fileRef.current?.click()}>Import Backup JSON</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importState} />
        </div>
        <div className="info-card"><strong>Patch files</strong><span>.syx exports are portable Circuit Tracks single-patch files. JSON backups are for restoring the full app state, including patches, projects, drum settings, and sequencer step locks.</span></div>
      </Panel>
    </div>
  );
}