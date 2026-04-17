import React from 'react';

export default function ModSourceChip({ source, armed, onArm, onDragStart }) {
  return (
    <button
      draggable
      onDragStart={(event) => onDragStart(event, source.id)}
      onClick={() => onArm(armed ? null : source.id)}
      className={`mod-chip ${source.color} ${armed ? 'armed' : ''}`}
      title="Drag to a lit destination or click once and then click a destination"
    >
      <span className="mod-chip-dot" />
      <span>{source.label}</span>
    </button>
  );
}
