import React from 'react';
import Panel from '../ui/Panel.jsx';
import KnobRow from '../ui/KnobRow.jsx';
import WaveformScreen from '../ui/WaveformScreen.jsx';
import { PARAM_ORDER } from '../../data/circuitTracks.js';

export default function FxTab({ params, updateParam, mod, macroMod }) {
  return (
    <div className="tab-layout serum-tab-grid fx-serum-grid">
      <Panel title="FX Rack" className="serum-panel-wide">
        <WaveformScreen 
          mode="fx" 
          warpValue={params.fx_delay} 
          resoValue={params.fx_reverb} 
          accent="amber" 
        />
        <KnobRow ids={PARAM_ORDER.fx} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="six-up" />
      </Panel>

      <Panel title="Performance FX" className="serum-panel-stack">
        <div className="noise-preview serum-visual-tall" />
        {/* FIXED: Replaced invalid IDs with the correct ones from PARAMS */}
        <KnobRow 
          ids={['fx_delay', 'fx_reverb', 'fx_distortion', 'fx_chorus']} 
          params={params} 
          updateParam={updateParam} 
          mod={mod} 
          macroMod={macroMod} 
          columns="four-up" 
        />
      </Panel>

      <Panel title="FX Notes" className="serum-panel-full">
        <div className="info-grid compact-info-grid serum-info-grid">
          <div className="info-card"><strong>Routable where it matters</strong><span>Only real hardware destinations glow. The rest stays clean and direct.</span></div>
          <div className="info-card"><strong>Screen density</strong><span>The rack is compressed to a synth-plugin scale so you can see more without scrolling.</span></div>
        </div>
      </Panel>
    </div>
  );
}