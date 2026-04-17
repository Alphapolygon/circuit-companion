import Panel from '../ui/Panel';

export default function MatrixTab({ routes, updateRoute, removeRoute, getSourceTheme }) {
  return (
    <div className="tab-layout">
      <Panel title={`Mod Matrix (${routes.length})`}>
        <div className="matrix-list">
          {routes.map((route) => (
            <div key={route.id} className="matrix-row">
              <div className="matrix-route" style={{ borderLeftColor: getSourceTheme(route.sourceId) }}>
                <div className="matrix-source">{route.sourceId.replaceAll('_', ' ')}</div>
                <div className="matrix-arrow">→</div>
                <div className="matrix-target">{route.targetId.replaceAll('_', ' ')}</div>
              </div>
              <input
                type="range"
                min="0"
                max="127"
                value={route.amount}
                onChange={(event) => updateRoute(route.id, Number(event.target.value))}
              />
              <div className="matrix-amount">{route.amount}</div>
              <button className="danger-button" onClick={() => removeRoute(route.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
