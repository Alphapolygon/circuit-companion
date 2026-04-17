import React from 'react';

export default function ParamFader({ id, label, value, onChange, routes, macroRoutes = [], mod, macroMod, meta }) {
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
      className={`fader-shell ${canDrop ? 'drop-ready' : ''} ${meta.modulatable || meta.macroAssignable ? 'mod-target' : 'edit-only'}`}
      onDragOver={(meta.modulatable || meta.macroAssignable) ? (event) => event.preventDefault() : undefined}
      onDrop={(meta.modulatable || meta.macroAssignable) ? handleDrop : undefined}
      onClick={(meta.modulatable || meta.macroAssignable) ? handleClick : undefined}
    >
      <div className="fader-header">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="fader-track-wrap">
        <input type="range" min="0" max="127" value={value} onChange={(event) => onChange(id, Number(event.target.value))} className="fader-range" />
      </div>
      <div className="fader-route-row">
        {routes.map((route) => (
          <span key={route.id} className="route-pill" style={{ borderColor: mod.getSourceTheme(route.sourceId), color: mod.getSourceTheme(route.sourceId) }}>
            {route.sourceId.replaceAll('_', ' ')}
          </span>
        ))}
        {macroRoutes.map((route) => (
          <span key={route.id} className="route-pill macro-pill" style={{ borderColor: macroMod.getSourceTheme(route.sourceId), color: macroMod.getSourceTheme(route.sourceId) }}>
            {route.sourceId.replaceAll('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
