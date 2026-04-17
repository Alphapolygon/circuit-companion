import React from 'react';
import Panel from '../ui/Panel.jsx';
import ParamFader from '../ui/ParamFader.jsx';
import WaveformScreen from '../ui/WaveformScreen.jsx';
import { getParamMeta, PARAM_ORDER } from '../../data/circuitTracks.js';

function DrumPanel({ title, ids, params, updateParam, mod, macroMod }) {
  const [pitchId, decayId, distId, filterId] = ids;
  return (
    <Panel title={title} className="serum-panel">
      <WaveformScreen title={title} subtitle="Pitch / decay contour" accent="cyan" mode="noise" params={{ amount: (params[pitchId] + params[decayId] + params[distId] + params[filterId]) / 4 }} />
      <div className="fader-grid drum-fader-grid">
        {ids.map((id) => {
          const meta = getParamMeta(id);
          return (
            <ParamFader
              key={id}
              id={id}
              label={meta.label}
              value={params[id]}
              onChange={updateParam}
              routes={[]}
              macroRoutes={[]}
              mod={mod}
              macroMod={macroMod}
              meta={meta}
            />
          );
        })}
      </div>
    </Panel>
  );
}

export default function DrumsTab({ params, updateParam, mod, macroMod }) {
  return (
    <div className="tab-layout perform-grid compact-perform-grid serum-tab-grid">
      <DrumPanel title="Drum 1 · MIDI Ch 10" ids={PARAM_ORDER.drums1} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} />
      <DrumPanel title="Drum 2 · MIDI Ch 10" ids={PARAM_ORDER.drums2} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} />
      <DrumPanel title="Drum 3 · MIDI Ch 10" ids={PARAM_ORDER.drums3} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} />
      <DrumPanel title="Drum 4 · MIDI Ch 10" ids={PARAM_ORDER.drums4} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} />
    </div>
  );
}
