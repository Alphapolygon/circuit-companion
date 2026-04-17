import React, { useState } from 'react';
import Panel from '../ui/Panel.jsx';
import OptionSelector from '../ui/OptionSelector.jsx';
import WaveformScreen from '../ui/WaveformScreen.jsx';
import KnobRow from '../ui/KnobRow.jsx';
import { PARAM_ORDER, PARAMS } from '../../data/circuitTracks.js';

export default function OscTab({ params, effectiveParams, updateParam, mod, macroMod, patches, loadPatch }) {
  const [activeEnv, setActiveEnv] = useState('amp');
  const [activeLfo, setActiveLfo] = useState('lfo1');

  const handleEnvChange = (stage, newEffectiveValue) => {
    const prefix = activeEnv === 'amp' ? 'amp_' : (activeEnv === 'filter' ? 'filter_' : 'env3_');
    const suffix = stage === 'a' ? 'attack' : stage === 'd' ? 'decay' : stage === 's' ? 'sustain' : 'release';
    const paramId = `${prefix}${suffix}`;
    
    const currentBase = params[paramId];
    const currentEffective = effectiveParams[paramId];
    const macroOffset = currentEffective - currentBase;
    const newBase = Math.max(0, Math.min(127, newEffectiveValue - macroOffset));
    
    updateParam(paramId, newBase);
  };

  return (
    <div className="serum-master-dashboard">
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'linear-gradient(180deg, #161d29, #0d131c)', padding: '6px 12px', borderRadius: '10px', marginBottom: '4px', border: '1px solid rgba(155,176,203,0.14)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#8f9fb5', letterSpacing: '0.08em' }}>STARTING POINT</span>
        <div style={{ flex: 1, maxWidth: '250px' }}>
          <OptionSelector
            value={""}
            options={[{label: 'Select a preset...', value: ''}, ...(patches || []).map(p => ({label: p.name, value: p.id}))]}
            onChange={(id) => { if (id) loadPatch(id); }}
          />
        </div>
        <button className="danger-button" onClick={() => loadPatch('init')} style={{ minHeight: '28px', padding: '0 12px', fontSize: '0.65rem', background: 'transparent', color: '#ff8da0', border: '1px solid rgba(255,141,160,0.3)' }}>
          Init Synth (Reset)
        </button>
      </div>

      <div className="serum-top-row">
        <Panel title="Mix / Noise" className="serum-panel dense-panel mix-col">
           <KnobRow ids={['mix_sub', 'mix_noise']} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="two-up" />
           <KnobRow ids={['mix_ring', 'mix_pan']} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="two-up" />
        </Panel>

        <Panel title="Osc A" className="serum-panel dense-panel osc-col">
          <WaveformScreen 
            mode="osc" 
            waveType={params.osc1_wave} 
            warpValue={effectiveParams.osc1_index} 
            syncValue={effectiveParams.osc1_vsync} 
            densityValue={effectiveParams.osc1_density} 
            accent="cyan"
          >
            <div className="osc-dropdown-overlay">
               <OptionSelector value={params.osc1_wave} options={PARAMS.osc1_wave.options} onChange={(value) => updateParam('osc1_wave', value)} />
            </div>
          </WaveformScreen>
          <KnobRow ids={PARAM_ORDER.oscA.slice(0, 4)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
          <KnobRow ids={PARAM_ORDER.oscA.slice(4)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
        </Panel>

        <Panel title="Osc B" className="serum-panel dense-panel osc-col">
          <WaveformScreen 
            mode="osc" 
            waveType={params.osc2_wave} 
            warpValue={effectiveParams.osc2_index} 
            syncValue={effectiveParams.osc2_vsync} 
            densityValue={effectiveParams.osc2_density} 
            accent="purple"
          >
            <div className="osc-dropdown-overlay">
               <OptionSelector value={params.osc2_wave} options={PARAMS.osc2_wave.options} onChange={(value) => updateParam('osc2_wave', value)} />
            </div>
          </WaveformScreen>
          <KnobRow ids={PARAM_ORDER.oscB.slice(0, 4)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
          <KnobRow ids={PARAM_ORDER.oscB.slice(4)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
        </Panel>

        <Panel title="Filter 1" className="serum-panel dense-panel filter-col">
          <WaveformScreen 
            mode="filter" 
            warpValue={effectiveParams.filter_cutoff} 
            resoValue={effectiveParams.filter_resonance} 
            driveValue={effectiveParams.filter_drive} 
            accent="cyan"
          >
            <div className="osc-dropdown-overlay">
               <OptionSelector value={params.filter_type} options={PARAMS.filter_type.options} onChange={(value) => updateParam('filter_type', value)} />
            </div>
          </WaveformScreen>
          <KnobRow ids={PARAM_ORDER.filter.slice(0, 3)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="three-up" />
          <KnobRow ids={PARAM_ORDER.filter.slice(3)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="three-up" />
        </Panel>
      </div>

      <div className="serum-bottom-row">
        <Panel title="Macros" className="serum-panel dense-panel macro-col">
          <KnobRow ids={PARAM_ORDER.macros.slice(0, 4)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
          <KnobRow ids={PARAM_ORDER.macros.slice(4)} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
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
          <WaveformScreen 
            mode="env" 
            accent="lime"
            envParams={{
              a: activeEnv === 'amp' ? effectiveParams.amp_attack : (activeEnv === 'filter' ? effectiveParams.filter_attack : effectiveParams.env3_attack),
              d: activeEnv === 'amp' ? effectiveParams.amp_decay : (activeEnv === 'filter' ? effectiveParams.filter_decay : effectiveParams.env3_decay),
              s: activeEnv === 'amp' ? effectiveParams.amp_sustain : (activeEnv === 'filter' ? effectiveParams.filter_sustain : effectiveParams.env3_sustain),
              r: activeEnv === 'amp' ? effectiveParams.amp_release : (activeEnv === 'filter' ? effectiveParams.filter_release : effectiveParams.env3_release)
            }}
            onEnvChange={handleEnvChange}
          />
          {activeEnv === 'amp' && <KnobRow ids={PARAM_ORDER.ampEnv} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="five-up" />}
          {activeEnv === 'filter' && <KnobRow ids={PARAM_ORDER.filterEnv} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="five-up" />}
          {activeEnv === 'env3' && <KnobRow ids={PARAM_ORDER.env3} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="five-up" />}
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
              <WaveformScreen mode="osc" waveType={params.lfo1_wave} warpValue={effectiveParams.lfo1_rate} accent="cyan">
                <div className="osc-dropdown-overlay" style={{top: '4px'}}>
                  <span style={{fontSize: '0.65rem', color: '#8f9fb5', marginRight: '8px'}}>WAVEFORM</span>
                  <OptionSelector value={params.lfo1_wave} options={PARAMS.lfo1_wave.options} onChange={(value) => updateParam('lfo1_wave', value)} />
                </div>
              </WaveformScreen>
              <KnobRow ids={PARAM_ORDER.lfo1} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
            </>
          )}
          {activeLfo === 'lfo2' && (
            <>
              <WaveformScreen mode="osc" waveType={params.lfo2_wave} warpValue={effectiveParams.lfo2_rate} accent="purple">
                <div className="osc-dropdown-overlay" style={{top: '4px'}}>
                  <span style={{fontSize: '0.65rem', color: '#8f9fb5', marginRight: '8px'}}>WAVEFORM</span>
                  <OptionSelector value={params.lfo2_wave} options={PARAMS.lfo2_wave.options} onChange={(value) => updateParam('lfo2_wave', value)} />
                </div>
              </WaveformScreen>
              <KnobRow ids={PARAM_ORDER.lfo2} params={params} effectiveParams={effectiveParams} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="four-up" />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}