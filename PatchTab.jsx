import React from 'react';
import Panel from '../ui/Panel.jsx';
import ParamFader from '../ui/ParamFader.jsx';
import WaveformScreen from '../ui/WaveformScreen.jsx';
import { PARAM_ORDER, getParamMeta } from '../../data/circuitTracks.js';

export default function MixTab({ params, updateParam, mod, macroMod }) {
  return (
    <div className="tab-layout serum-tab-grid">
      <Panel title="Internal Synth Mixer" className="serum-panel">
        <WaveformScreen title="Mixer Bus" subtitle="Osc / noise / ring energy" accent="blue" mode="noise" params={{ amount: Math.round((params.mix_osc1 + params.mix_osc2 + params.mix_noise + params.mix_ring) / 4) }} />
        <div className="fader-grid compact-fader-grid">
          {PARAM_ORDER.mixer.map((id) => (
            <ParamFader
              key={id}
              id={id}
              label={getParamMeta(id).label}
              value={params[id]}
              onChange={updateParam}
              routes={mod.getTargetRoutes(id)}
              macroRoutes={macroMod.getTargetRoutes(id)}
              mod={mod}
              macroMod={macroMod}
              meta={getParamMeta(id)}
            />
          ))}
        </div>
      </Panel>
      <Panel title="Mixer workflow" className="serum-panel">
        <div className="info-grid compact-info-grid display-info-grid">
          <div className="info-card"><strong>Dense but readable</strong><span>Faders are packed tighter and the top display reacts to the actual mix balance so this page reads more like a plugin mixer strip.</span></div>
          <div className="info-card"><strong>Fast routing</strong><span>Level-style destinations still accept drag and drop where the hardware supports it, without covering everything in extra UI chrome.</span></div>
        </div>
      </Panel>
    </div>
  );
}
