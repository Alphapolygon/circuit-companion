import React, { useState, useRef, useEffect } from 'react';

// Extracted the core math so we can loop it for the 3D layers
function getOscPath(waveType, w) {
  if (waveType === 0) return `M 0 80 Q 100 ${20 - w * 30}, 200 80 T 400 80`;
  if (waveType === 1) return `M 0 80 L ${200 + (w - 0.5) * 100} 20 L 400 140`;
  if (waveType === 2) return `M 0 140 L 200 20 L 200 140 L 400 20`;
  if (waveType >= 3 && waveType <= 11) return `M 0 140 L ${400 * ((12 - waveType) / 10)} 20 L ${400 * ((12 - waveType) / 10)} 140 L 400 20`;
  if (waveType === 12) return `M 0 20 L ${40 + (w * 320)} 20 L ${40 + (w * 320)} 140 L 400 140`;
  if (waveType === 13) return `M 0 20 L 200 20 L 200 140 L 400 140`;
  if (waveType === 14) return `M 0 80 Q 50 ${20+(w*40)}, 100 80 T 200 80 Q 250 ${140-(w*40)}, 300 80 T 400 80`;
  if (waveType === 15) return `M 0 25 L ${80 + (w * 240)} 15 L ${80 + (w * 240)} 145 L 400 135`;
  if (waveType === 16) {
    const cycles = 1 + (w * 5);
    let path = `M 0 140`;
    for(let i=0; i<Math.ceil(cycles); i++) {
       const startX = (i / cycles) * 400;
       let endX = ((i+1) / cycles) * 400;
       let endY = 20;
       if (endX > 400) {
           endY = 140 - (120 * ((400 - startX) / (endX - startX)));
           endX = 400;
       }
       path += ` L ${endX} ${endY} L ${endX} 140`;
    }
    return path;
  }
  if (waveType === 17) return `M 0 140 L ${200 + (w * 180)} 20 L 400 140`;
  if (waveType >= 18 && waveType <= 20) return `M 0 140 L 100 20 L 150 ${20+(w*60)} L 200 20 L 300 140 L 350 ${140-(w*60)} L 400 140`;
  if (waveType >= 21 && waveType <= 26) return `M 0 80 Q 40 ${10+(w*40)}, 80 80 T 160 80 Q 200 ${150-(w*40)}, 240 80 T 320 80 Q 360 ${10+(w*40)}, 400 80`;
  
  const n1 = Math.sin(w * 10) * 40;
  const n2 = Math.cos(w * 15) * 50;
  const n3 = Math.sin(w * 20) * 30;
  return `M 0 80 L 50 ${80+n1} L 100 ${80-n2} L 150 ${80+n3} L 200 80 L 250 ${80-n1} L 300 ${80+n2} L 350 ${80-n3} L 400 80`;
}

export default function WaveformScreen({ 
  mode = 'osc', 
  title, 
  subtitle, 
  accent = 'cyan', 
  waveType = 0, 
  warpValue = 64, 
  resoValue = 0,
  syncValue = 0,    // NEW: Captures V-Sync knob
  densityValue = 0, // NEW: Captures Density knob
  driveValue = 0,   // NEW: Captures Filter Drive knob
  envParams,
  onEnvChange,
  children          // NEW: Allows dropdown menu to render inside
}) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (mode !== 'osc') return; 
    let frameId;
    let startTime = performance.now();
    const animate = (now) => {
      setTime((now - startTime) * 0.0015);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [mode]);

  const w = Math.max(0.01, warpValue / 127);
  const isInteractiveEnv = mode === 'env' && Boolean(envParams);
  let envNodes = null;
  let envMain = '';
  let envGhost = '';

  if (isInteractiveEnv) {
    const aVal = envParams.a ?? 0;
    const dVal = envParams.d ?? 0;
    const sVal = envParams.s ?? 0;
    const rVal = envParams.r ?? 0;

    const ptA = { x: 10 + (aVal / 127) * 90, y: 20 };
    const ptD = { x: ptA.x + 10 + (dVal / 127) * 100, y: 150 - (sVal / 127) * 130 };
    const ptS = { x: 280, y: ptD.y };
    const ptR = { x: 280 + 10 + (rVal / 127) * 100, y: 150 };

    envMain = `M 0 150 L ${ptA.x} ${ptA.y} L ${ptD.x} ${ptD.y} L ${ptS.x} ${ptS.y} L ${ptR.x} ${ptR.y}`;
    envGhost = `M 0 154 L ${ptA.x + 2} ${ptA.y + 6} L ${ptD.x + 2} ${ptD.y + 6} L ${ptS.x - 2} ${ptS.y + 6} L ${ptR.x} 154`;

    const handlePointerDown = (nodeId) => (e) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(nodeId);
    };

    const handlePointerMove = (nodeId) => (e) => {
      if (dragging !== nodeId || !onEnvChange || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 400;
      const svgY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)) * 160;

      if (nodeId === 'a') {
        onEnvChange('a', Math.round(((svgX - 10) / 90) * 127));
      } else if (nodeId === 'ds') {
        onEnvChange('d', Math.round(((svgX - ptA.x - 10) / 100) * 127));
        onEnvChange('s', Math.round(((150 - svgY) / 130) * 127));
      } else if (nodeId === 'r') {
        onEnvChange('r', Math.round(((svgX - ptS.x - 10) / 100) * 127));
      }
    };

    const handlePointerUp = (e) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(null);
    };

    envNodes = (
      <>
        <circle cx={ptA.x} cy={ptA.y} r="20" className={`env-handle ${dragging === 'a' ? 'active' : ''}`} onPointerDown={handlePointerDown('a')} onPointerMove={handlePointerMove('a')} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} />
        <circle cx={ptA.x} cy={ptA.y} r="4" className="env-handle-dot" pointerEvents="none" />
        <circle cx={ptD.x} cy={ptD.y} r="20" className={`env-handle ${dragging === 'ds' ? 'active' : ''}`} onPointerDown={handlePointerDown('ds')} onPointerMove={handlePointerMove('ds')} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} />
        <circle cx={ptD.x} cy={ptD.y} r="4" className="env-handle-dot" pointerEvents="none" />
        <circle cx={ptR.x} cy={ptR.y} r="20" className={`env-handle ${dragging === 'r' ? 'active' : ''}`} onPointerDown={handlePointerDown('r')} onPointerMove={handlePointerMove('r')} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} />
        <circle cx={ptR.x} cy={ptR.y} r="4" className="env-handle-dot" pointerEvents="none" />
      </>
    );
  }

  let fxMain = '', fxGhost = '';
  if (mode === 'fx') {
    const spacing = 15 + (w * 40);
    const decayRate = 1 - (resoValue / 127);
    fxMain = 'M 0 80 ';
    fxGhost = 'M 0 85 ';
    for(let i=0; i <= 400; i += spacing) {
      const height = 70 * Math.pow(1 - (i/400), 1 + decayRate * 4);
      fxMain += `L ${i} ${80 - height} L ${i + spacing/2} ${80 + height} `;
      fxGhost += `L ${i} ${85 - height * 0.7} L ${i + spacing/2} ${85 + height * 0.7} `;
    }
    fxMain += 'L 400 80';
    fxGhost += 'L 400 85';
  }

  const cutX = w * 360;
  const reso = resoValue / 127;
  const peakY = 80 - reso * 70;

  return (
    <div className={`wave-screen ${accent} ${dragging ? 'dragging' : ''}`}>
      {(title || subtitle) && (
        <div className="wave-screen-top">
          <span>{title}</span>
          <span>{subtitle}</span>
        </div>
      )}

      {/* DROPDOWN OVERLAY RENDERED HERE */}
      {children}

      <svg viewBox="0 0 400 160" className="wave-svg" preserveAspectRatio="none" ref={svgRef} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`glow-${accent}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.75" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {mode === 'osc' && (
          [5, 4, 3, 2, 1, 0].map(i => {
            const depth = i / 5; 
            const timeMod = Math.sin(time + depth * 3.5) * 0.06; 
            
            // Sync adds a heavy warp offset to the back layers
            const syncOffset = (syncValue / 127) * depth * 0.5;
            const layerWarp = Math.max(0.01, Math.min(1, w - (depth * 0.22) + timeMod + syncOffset));
            
            // Density dramatically increases the 3D spread
            const d = densityValue / 127;
            const spreadX = 32 + (d * 40);
            const spreadY = -22 - (d * 15);
            
            return (
              <path
                key={i}
                d={getOscPath(waveType, layerWarp)}
                className={`osc-layer ${i === 0 ? 'front' : ''}`}
                style={{
                  transform: `translate(${depth * spreadX}px, ${depth * spreadY}px) scale(${1 + (syncValue / 127) * 0.15 * depth})`,
                  transformOrigin: 'bottom left',
                  opacity: 1 - (depth * 0.35),
                  strokeWidth: i === 0 ? 2.5 : 1.2
                }}
              />
            )
          })
        )}

        {mode === 'filter' && (() => {
           const drive = driveValue / 127;
           return (
             <>
               <path d={`M 0 160 L 0 80 L ${Math.max(0, cutX - 60)} 80 Q ${cutX} ${peakY}, ${cutX + 40} 160 Z`} className="filter-fill" style={{ fill: `url(#glow-${accent})`, opacity: 0.6 + drive * 0.4 }} />
               <path d={`M 0 80 L ${Math.max(0, cutX - 60)} 80 Q ${cutX} ${peakY}, ${cutX + 40} 160 L 400 160`} className="main" style={{ filter: `drop-shadow(0 0 ${8 + drive*8}px currentColor)`, strokeWidth: 2.1 + drive * 2 }} />
               {reso > 0.05 && <line x1={cutX} y1={160} x2={cutX} y2={peakY} className="filter-laser" style={{ opacity: reso * 1.5 + drive * 0.5, strokeWidth: 2 + drive * 2 }} />}
             </>
           );
        })()}

        {mode === 'env' && (
          isInteractiveEnv ? (
            <>
              <path d={envMain} className="main" />
              <path d={envGhost} className="ghost" />
              {envNodes}
            </>
          ) : (
            <>
               <path d={`M 0 150 L 50 20 L ${50 + (w * 250)} ${160 - (w * 80)} L 350 ${160 - (w * 80)} L 400 150`} className="main" />
               <path d={`M 0 154 L 54 28 L ${54 + (w * 250)} ${164 - (w * 80)} L 346 ${164 - (w * 80)} L 400 154`} className="ghost" />
            </>
          )
        )}

        {mode === 'fx' && (
          <>
            <path d={fxMain} className="main" />
            <path d={fxGhost} className="ghost" />
          </>
        )}
      </svg>
    </div>
  );
}