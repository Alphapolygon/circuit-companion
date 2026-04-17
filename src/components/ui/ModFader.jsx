export default function ModFader({
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
  return (
    <div
      className={`fader-shell ${armedSource ? 'drop-ready' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, id)}
      onClick={() => onClickAssign(id)}
    >
      <div className="fader-header">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="fader-track-wrap">
        <input
          type="range"
          min="0"
          max="127"
          value={value}
          onChange={(event) => onChange(id, Number(event.target.value))}
          className="fader-range"
        />
      </div>
      <div className="fader-route-row">
        {routes.map((route) => (
          <span
            key={route.id}
            className="route-pill"
            style={{ borderColor: getSourceTheme(route.sourceId), color: getSourceTheme(route.sourceId) }}
          >
            {route.sourceId.replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
