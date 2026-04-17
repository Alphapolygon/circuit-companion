import React from 'react';

function RouteDots({ routes, getSourceTheme, className = '' }) {
  if (!routes.length) return null;
  return (
    <div className={`route-dots ${className}`.trim()}>
      {routes.slice(0, 4).map((route) => (
        <span key={route.id} className="route-dot" style={{ background: getSourceTheme(route.sourceId) }} />
      ))}
    </div>
  );
}

export default function ParamKnob({ id, label, value, effectiveValue, onChange, routes, macroRoutes = [], mod, macroMod, meta }) {
  const rotation = -140 + (value / 127) * 280;
  const effectiveRotation = -140 + ((effectiveValue ?? value) / 127) * 280;
  
  const modDropReady = meta.modulatable && Boolean(mod.armedSource);
  const macroDropReady = Boolean(meta.macroAssignable) && Boolean(macroMod?.armedSource);
  const canDrop = modDropReady || macroDropReady;

  const handleDrop = (event) => {
    const macroSource = event.dataTransfer.getData('text/macro-source');
    if (macroSource && macroMod && meta.macroAssignable) {
      macroMod.onTargetDrop(event, id);
      return;
    }
    if (meta.modulatable) mod.onTargetDrop(event, id);
  };

  const handleClick = () => {
    if (macroMod?.armedSource && meta.macroAssignable) {
      macroMod.onTargetClick(id);
      return;
    }
    if (meta.modulatable) mod.onTargetClick(id);
  };

  return (
    <div
      className={`control-shell ${canDrop ? 'drop-ready' : ''} ${meta.modulatable || meta.macroAssignable ? 'mod-target' : 'edit-only'}`}
      onDragOver={(meta.modulatable || meta.macroAssignable) ? (event) => event.preventDefault() : undefined}
      onDrop={(meta.modulatable || meta.macroAssignable) ? handleDrop : undefined}
      onClick={(meta.modulatable || meta.macroAssignable) ? handleClick : undefined}
    >
      <RouteDots routes={routes} getSourceTheme={mod.getSourceTheme} />
      <RouteDots routes={macroRoutes} getSourceTheme={macroMod?.getSourceTheme || (() => '#4b9dff')} className="macro-route-dots" />
      <div className="knob-wrap">
        <div className="knob-face">
          <div className="knob-cap" style={{ transform: `rotate(${rotation}deg)` }}>
            <span className="knob-indicator" />
          </div>
          {/* SERUM STYLE MODULATION INDICATOR */}
          {effectiveValue !== undefined && effectiveValue !== value && (
            <div className="knob-cap effective-cap" style={{ transform: `rotate(${effectiveRotation}deg)` }}>
              <span className="knob-indicator effective-indicator" />
            </div>
          )}
        </div>
        <input className="knob-range" type="range" min="0" max="127" value={value} onChange={(event) => onChange(id, Number(event.target.value))} />
      </div>
      <div className="control-label">{label}</div>
      <div className="control-value">{effectiveValue !== undefined && effectiveValue !== value ? <span style={{color: '#30c9ff'}}>{effectiveValue}</span> : value}</div>
    </div>
  );
}