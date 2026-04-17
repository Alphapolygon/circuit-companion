import React from 'react';

export default function TopNav({ tabs, activeTab, onChange }) {
  return (
    <div className="top-nav serum-top-nav">
      {tabs.map((tab) => (
        <button key={tab.id} className={`top-nav-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => onChange(tab.id)}>
          <span className="top-nav-led" />
          <span className="top-nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
