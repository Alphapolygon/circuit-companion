import React from 'react';
import Panel from '../ui/Panel.jsx';
import KnobRow from '../ui/KnobRow.jsx';
import OptionSelector from '../ui/OptionSelector.jsx';
import WaveformScreen from '../ui/WaveformScreen.jsx';
import { PARAM_ORDER, PARAMS } from '../../data/circuitTracks.js';

export default function GlobalTab({ params, updateParam, mod, macroMod }) {
  return (
    <div className="tab-layout mod-grid serum-tab-grid">
      <Panel title="Voice + Glide" className="serum-panel" right={<OptionSelector label="Mode" value={params.voice_mode} options={PARAMS.voice_mode.options} onChange={(value) => updateParam('voice_mode', value)} />}>
        <WaveformScreen title="Voicing" subtitle={PARAMS.voice_mode.options[params.voice_mode]} accent="cyan" mode="lfo" params={{ shape: params.voice_mode, rate: params.portamento, phase: params.pre_glide, slew: params.keyboard_octave }} />
        <KnobRow ids={PARAM_ORDER.voice} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="three-up" />
      </Panel>
      <Panel title="Performance Rules" className="serum-panel">
        <WaveformScreen title="Transport Feel" subtitle="BPM / swing / mutate" accent="purple" mode="lfo" params={{ shape: 1, rate: params.global_bpm, phase: params.global_swing, slew: params.global_mutate }} />
        <KnobRow ids={PARAM_ORDER.global} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
      </Panel>
      <Panel title="Companion behavior" className="full-width serum-panel">
        <div className="info-grid compact-info-grid display-info-grid">
          <div className="info-card"><strong>Real displays</strong><span>LFO, envelope, filter, and FX views now respond to live parameter changes instead of sitting there as static wallpaper.</span></div>
          <div className="info-card"><strong>Plugin density</strong><span>This tab uses the same tighter panel scale and chrome treatment as the synth pages so the whole app feels like one instrument.</span></div>
        </div>
      </Panel>
    </div>
  );
}
