import React from 'react';

export default function DisplayCard({ title, subtitle, value, accent = 'cyan' }) {
  return (
    <div className={`display-card ${accent}`}>
      <div className="display-kicker">{title}</div>
      <div className="display-value">{value}</div>
      <div className="display-subtitle">{subtitle}</div>
    </div>
  );
}
