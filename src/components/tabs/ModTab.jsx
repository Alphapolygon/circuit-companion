import React from 'react';
import Panel from '../ui/Panel.jsx';
import { HARDWARE_MACRO_SLOT_COUNT, PARAMS } from '../../data/circuitTracks.js';

export default function ModTab({ mod, macroMod }) {
  return (
    <div className="tab-layout serum-tab-grid matrix-only-grid" style={{ gridTemplateColumns: '1fr', alignContent: 'start' }}>
      
      {/* HARDWARE MOD MATRIX */}
      <Panel title={`Hardware Mod Matrix (${mod.routes.length}/${mod.maxRoutes})`} className="serum-panel-full">
        <div className="matrix-list compact-matrix-list serum-matrix-list">
          {mod.routes.map((route) => (
            <div key={route.id} className="matrix-row compact-matrix-row serum-matrix-row">
              <div className="matrix-route" style={{ borderLeftColor: mod.getSourceTheme(route.sourceId) }}>
                <div className="matrix-source">{route.sourceId.replaceAll('_', ' ')}</div>
                <div className="matrix-arrow">→</div>
                <div className="matrix-target">{PARAMS[route.targetId]?.label || route.targetId}</div>
              </div>
              <input type="range" min="0" max="127" value={route.amount} onChange={(event) => mod.updateRouteAmount(route.id, Number(event.target.value))} />
              <div className="matrix-amount">{route.amount}</div>
              <button className="danger-button" onClick={() => mod.removeRoute(route.id)}>Remove</button>
            </div>
          ))}
          {mod.routes.length === 0 && (
            <div className="info-card" style={{textAlign: 'center', padding: '20px'}}>
              <span style={{opacity: 0.6}}>No modulations routed. Drag a source chip to a knob to create one.</span>
            </div>
          )}
        </div>
      </Panel>

      {/* MACRO ASSIGNMENT MATRIX */}
      <Panel title={`Macro Assignment Matrix (${macroMod.routes.length}/${HARDWARE_MACRO_SLOT_COUNT})`} className="serum-panel-full">
        <div className="matrix-list compact-matrix-list serum-matrix-list">
          {macroMod.routes.map((route) => (
            <div key={route.id} className="matrix-row compact-matrix-row serum-matrix-row macro-matrix-row">
              <div className="matrix-route" style={{ borderLeftColor: macroMod.getSourceTheme(route.sourceId) }}>
                <div className="matrix-source">{route.sourceId.replaceAll('_', ' ')}</div>
                <div className="matrix-arrow">→</div>
                <div className="matrix-target">{PARAMS[route.targetId]?.label || route.targetId}</div>
              </div>
              <div className="macro-mini-grid" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#8f9fb5'}}>
                  Start<input type="range" min="0" max="127" value={route.start} onChange={(event) => macroMod.updateRoute(route.id, { start: Number(event.target.value) })} />
                </label>
                <label style={{display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#8f9fb5'}}>
                  End<input type="range" min="0" max="127" value={route.end} onChange={(event) => macroMod.updateRoute(route.id, { end: Number(event.target.value) })} />
                </label>
                <label style={{display: 'flex', gap: '6px', fontSize: '0.7rem', color: '#8f9fb5'}}>
                  Depth<input type="range" min="0" max="127" value={route.depth} onChange={(event) => macroMod.updateRoute(route.id, { depth: Number(event.target.value) })} />
                </label>
              </div>
              <button className="danger-button" onClick={() => macroMod.removeRoute(route.id)}>Remove</button>
            </div>
          ))}
          {macroMod.routes.length === 0 && (
            <div className="info-card" style={{textAlign: 'center', padding: '20px'}}>
              <span style={{opacity: 0.6}}>No macros assigned. Drag a macro chip to a knob to assign one.</span>
            </div>
          )}
        </div>
      </Panel>

    </div>
  );
}