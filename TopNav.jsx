import React, { useState, useRef, useEffect } from 'react';

export default function OptionSelector({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if options are strings or {label, value} objects
  const isObjectMode = options.length > 0 && typeof options[0] === 'object';
  const displayValue = isObjectMode 
    ? (options.find((o) => o.value === value)?.label || 'Select...')
    : (options[value] || 'Select...');

  return (
    <div className="custom-select-container" ref={ref}>
      {label && <span className="custom-select-label">{label}</span>}
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="custom-select-text">{displayValue}</span>
        <span className="custom-select-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>
      
      {isOpen && (
        <ul className="custom-select-dropdown">
          {options.map((option, index) => {
            const optValue = isObjectMode ? option.value : index;
            const optLabel = isObjectMode ? option.label : option;
            return (
              <li
                key={`${optValue}-${index}`}
                className={optValue === value ? 'selected' : ''}
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
              >
                {optLabel}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}