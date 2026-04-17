function RouteDots({ routes, getSourceTheme }) {
  if (!routes.length) return null;
  return (
    <div className="route-dots">
      {routes.slice(0, 4).map((route) => (
        <span
          key={route.id}
          className="route-dot"
          style={{ background: getSourceTheme(route.sourceId) }}
        />
      ))}
    </div>
  );
}

export default function ModKnob({
  id,
  label,
  value,
  onChange,
  routes,
  armedSource,
  onDrop,
  onClickAssign,
  getSourceTheme,
}) {
  const rotation = -140 + (value / 127) * 280;

  return (
    <div
      className={`control-shell ${armedSource ? 'drop-ready' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, id)}
      onClick={() => onClickAssign(id)}
    >
      <RouteDots routes={routes} getSourceTheme={getSourceTheme} />
      <div className="knob-wrap">
        <div className="knob-face">
          <div className="knob-cap" style={{ transform: `rotate(${rotation}deg)` }}>
            <span className="knob-indicator" />
          </div>
        </div>
        <input
          className="knob-range"
          type="range"
          min="0"
          max="127"
          value={value}
          onChange={(event) => onChange(id, Number(event.target.value))}
        />
      </div>
      <div className="control-label">{label}</div>
      <div className="control-value">{value}</div>
    </div>
  );
}
