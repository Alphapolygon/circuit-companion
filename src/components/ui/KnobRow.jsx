import React from 'react';
import ParamKnob from './ParamKnob.jsx';
import { getParamMeta } from '../../data/circuitTracks.js';

export default function KnobRow({ ids, params, effectiveParams, updateParam, mod, macroMod, columns = 'four-up' }) {
  return (
    <div className={`knob-grid ${columns}`}>
      {ids.map((id) => {
        const meta = getParamMeta(id);
        return (
          <ParamKnob
            key={id}
            id={id}
            label={meta.label}
            value={params[id]}
            effectiveValue={effectiveParams ? effectiveParams[id] : params[id]}
            onChange={updateParam}
            routes={mod.getTargetRoutes(id)}
            macroRoutes={macroMod?.getTargetRoutes?.(id) || []}
            mod={mod}
            macroMod={macroMod}
            meta={meta}
          />
        );
      })}
    </div>
  );
}