import React, { useState } from 'react';
import Panel from '../ui/Panel.jsx';
import OptionSelector from '../ui/OptionSelector.jsx';
import WaveformScreen from '../ui/WaveformScreen.jsx';
import KnobRow from '../ui/KnobRow.jsx';
import { PARAM_ORDER, PARAMS } from '../../data/circuitTracks.js';

export default function OscTab({ params, updateParam, mod, macroMod }) {
  const [activeEnv, setActiveEnv] = useState('amp');
  const [activeLfo, setActiveLfo] = useState('lfo1');

  return (
    <div className="serum-master-dashboard">
      <div className="serum-top-row">
        <Panel title="Mix / Noise" className="serum-panel dense-panel mix-col">
           <KnobRow ids={['mix_sub', 'mix_noise']} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="two-up" />
           <KnobRow ids={['mix_ring', 'mix_pan']} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="two-up" />
        </Panel>

        <Panel title="Osc A" className="serum-panel dense-panel osc-col">
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '4px'}}>
             <OptionSelector value={params.osc1_wave} options={PARAMS.osc1_wave.options} onChange={(value) => updateParam('osc1_wave', value)} />
          </div>
          {/* Wire the wave type and the "Index" knob to animate the SVG */}
          <WaveformScreen mode="osc" waveType={params.osc1_wave} warpValue={params.osc1_index} accent="cyan" />
          <KnobRow ids={PARAM_ORDER.oscA.slice(0, 4)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
          <KnobRow ids={PARAM_ORDER.oscA.slice(4)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
        </Panel>

        <Panel title="Osc B" className="serum-panel dense-panel osc-col">
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '4px'}}>
             <OptionSelector value={params.osc2_wave} options={PARAMS.osc2_wave.options} onChange={(value) => updateParam('osc2_wave', value)} />
          </div>
          <WaveformScreen mode="osc" waveType={params.osc2_wave} warpValue={params.osc2_index} accent="purple" />
          <KnobRow ids={PARAM_ORDER.oscB.slice(0, 4)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
          <KnobRow ids={PARAM_ORDER.oscB.slice(4)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
        </Panel>

        <Panel title="Filter 1" className="serum-panel dense-panel filter-col">
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '4px'}}>
             <OptionSelector value={params.filter_type} options={PARAMS.filter_type.options} onChange={(value) => updateParam('filter_type', value)} />
          </div>
          {/* Wire Cutoff and Resonance to the visualizer */}
          <WaveformScreen mode="filter" warpValue={params.filter_cutoff} resoValue={params.filter_resonance} accent="cyan" />
          <KnobRow ids={PARAM_ORDER.filter.slice(0, 3)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="three-up" />
          <KnobRow ids={PARAM_ORDER.filter.slice(3)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="three-up" />
        </Panel>
      </div>

      <div className="serum-bottom-row">
        <Panel title="Macros" className="serum-panel dense-panel macro-col">
          <KnobRow ids={PARAM_ORDER.macros.slice(0, 4)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
          <KnobRow ids={PARAM_ORDER.macros.slice(4)} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
        </Panel>

        <Panel 
          title="Envelopes" 
          className="serum-panel dense-panel env-col"
          right={
            <div className="mini-tabs">
              <button className={activeEnv === 'amp' ? 'active' : ''} onClick={() => setActiveEnv('amp')}>AMP</button>
              <button className={activeEnv === 'filter' ? 'active' : ''} onClick={() => setActiveEnv('filter')}>FLT</button>
              <button className={activeEnv === 'env3' ? 'active' : ''} onClick={() => setActiveEnv('env3')}>ENV3</button>
            </div>
          }
        >
          {/* Use the decay knob to stretch the envelope graphic */}
          <WaveformScreen mode="env" warpValue={activeEnv === 'amp' ? params.amp_decay : (activeEnv === 'filter' ? params.filter_decay : params.env3_decay)} accent="lime" />
          {activeEnv === 'amp' && <KnobRow ids={PARAM_ORDER.ampEnv} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="five-up" />}
          {activeEnv === 'filter' && <KnobRow ids={PARAM_ORDER.filterEnv} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="five-up" />}
          {activeEnv === 'env3' && <KnobRow ids={PARAM_ORDER.env3} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="five-up" />}
        </Panel>

        <Panel 
          title="LFOs" 
          className="serum-panel dense-panel lfo-col"
          right={
            <div className="mini-tabs">
              <button className={activeLfo === 'lfo1' ? 'active' : ''} onClick={() => setActiveLfo('lfo1')}>LFO 1</button>
              <button className={activeLfo === 'lfo2' ? 'active' : ''} onClick={() => setActiveLfo('lfo2')}>LFO 2</button>
            </div>
          }
        >
          {activeLfo === 'lfo1' && (
            <>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                 <span style={{fontSize: '0.65rem', color: '#8f9fb5', alignSelf: 'center', paddingLeft: '8px'}}>WAVEFORM</span>
                 <OptionSelector value={params.lfo1_wave} options={PARAMS.lfo1_wave.options} onChange={(value) => updateParam('lfo1_wave', value)} />
              </div>
              <WaveformScreen mode="osc" waveType={params.lfo1_wave} warpValue={params.lfo1_rate} accent="cyan" />
              <KnobRow ids={PARAM_ORDER.lfo1} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
            </>
          )}
          {activeLfo === 'lfo2' && (
            <>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                 <span style={{fontSize: '0.65rem', color: '#8f9fb5', alignSelf: 'center', paddingLeft: '8px'}}>WAVEFORM</span>
                 <OptionSelector value={params.lfo2_wave} options={PARAMS.lfo2_wave.options} onChange={(value) => updateParam('lfo2_wave', value)} />
              </div>
              <WaveformScreen mode="osc" waveType={params.lfo2_wave} warpValue={params.lfo2_rate} accent="purple" />
              <KnobRow ids={PARAM_ORDER.lfo2} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}