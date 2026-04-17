import React, { useMemo } from 'react';

export default function WaveformScreen({ 
  mode = 'osc', 
  title, 
  subtitle, 
  accent = 'cyan', 
  waveType = 0, 
  warpValue = 64, 
  resoValue = 0 
}) {
  
  const paths = useMemo(() => {
    const w = Math.max(0.01, warpValue / 127); 

    // --- FX Mode ---
    if (mode === 'fx') {
      const spacing = 15 + (w * 40); // Delay time widens the bounces
      const decayRate = 1 - (resoValue / 127); // Reverb mix slows the decay
      
      let main = 'M 0 80 ';
      let ghost = 'M 0 85 ';
      
      for(let i=0; i <= 400; i += spacing) {
        // Create decaying "bounces"
        const height = 70 * Math.pow(1 - (i/400), 1 + decayRate * 4);
        main += `L ${i} ${80 - height} L ${i + spacing/2} ${80 + height} `;
        ghost += `L ${i} ${85 - height * 0.7} L ${i + spacing/2} ${85 + height * 0.7} `;
      }
      return { main: main + 'L 400 80', ghost: ghost + 'L 400 85' };
    }

    // --- Filter Mode ---
    if (mode === 'filter') {
      const cutX = w * 360;
      const peakY = 80 - (resoValue / 127) * 70;
      const main = `M 0 80 L ${Math.max(0, cutX - 60)} 80 Q ${cutX} ${peakY}, ${cutX + 40} 160 L 400 160`;
      const ghost = `M 0 90 L ${Math.max(0, cutX - 50)} 90 Q ${cutX} ${peakY + 20}, ${cutX + 50} 160`;
      return { main, ghost };
    }

    // --- Env Mode ---
    if (mode === 'env') {
      const decayX = 50 + (w * 250); 
      const susY = 160 - (w * 80);
      const main = `M 0 150 L 50 20 L ${decayX} ${susY} L 350 ${susY} L 400 150`;
      const ghost = `M 0 154 L 54 28 L ${decayX + 4} ${susY + 4} L 346 ${susY + 4} L 400 154`;
      return { main, ghost };
    }

    // --- OSC / LFO Mode ---
    let main = '';
    if (waveType === 0) {
      main = `M 0 80 Q 100 ${20 - w * 30}, 200 80 T 400 80`;
    } else if (waveType === 1) {
      const peakX = 200 + (w - 0.5) * 100;
      main = `M 0 80 L ${peakX} 20 L 400 140`;
    } else if (waveType === 2) {
      main = `M 0 140 L 200 20 L 200 140 L 400 20`;
    } else if (waveType >= 3 && waveType <= 11) {
      const ratio = (12 - waveType) / 10; 
      const splitX = 400 * ratio;
      main = `M 0 140 L ${splitX} 20 L ${splitX} 140 L 400 20`;
    } else if (waveType === 12) {
      const duty = 40 + (w * 320);
      main = `M 0 20 L ${duty} 20 L ${duty} 140 L 400 140`;
    } else if (waveType === 13) {
      main = `M 0 20 L 200 20 L 200 140 L 400 140`;
    } else if (waveType === 14) {
      const harm = w * 40;
      main = `M 0 80 Q 50 ${20+harm}, 100 80 T 200 80 Q 250 ${140-harm}, 300 80 T 400 80`;
    } else if (waveType === 15) {
      const duty = 80 + (w * 240);
      main = `M 0 25 L ${duty} 15 L ${duty} 145 L 400 135`;
    } else if (waveType === 16) {
      const cycles = 1 + (w * 5);
      let path = `M 0 140`;
      for(let i=0; i<Math.ceil(cycles); i++) {
         const startX = (i / cycles) * 400;
         let endX = ((i+1) / cycles) * 400;
         let endY = 20;
         if (endX > 400) {
             const frac = (400 - startX) / (endX - startX);
             endX = 400;
             endY = 140 - (120 * frac);
         }
         path += ` L ${endX} ${endY} L ${endX} 140`;
      }
      main = path;
    } else if (waveType === 17) {
      const peakX = 200 + (w * 180);
      main = `M 0 140 L ${peakX} 20 L 400 140`;
    } else if (waveType >= 18 && waveType <= 20) {
      const notch = w * 60;
      main = `M 0 140 L 100 20 L 150 ${20+notch} L 200 20 L 300 140 L 350 ${140-notch} L 400 140`;
    } else if (waveType >= 21 && waveType <= 26) {
      const f1 = 10 + (w * 40);
      const f2 = 150 - (w * 40);
      main = `M 0 80 Q 40 ${f1}, 80 80 T 160 80 Q 200 ${f2}, 240 80 T 320 80 Q 360 ${f1}, 400 80`;
    } else {
      const n1 = Math.sin(w * 10) * 40;
      const n2 = Math.cos(w * 15) * 50;
      const n3 = Math.sin(w * 20) * 30;
      main = `M 0 80 L 50 ${80+n1} L 100 ${80-n2} L 150 ${80+n3} L 200 80 L 250 ${80-n1} L 300 ${80+n2} L 350 ${80-n3} L 400 80`;
    }

    const ghost = main.replace(/ 20 /g, ' 35 ').replace(/ 140 /g, ' 125 ').replace(/ 80 /g, ' 85 ');
    return { main, ghost };
  }, [mode, waveType, warpValue, resoValue]);

  return (
    <div className={`wave-screen ${accent}`}>
      {(title || subtitle) && (
        <div className="wave-screen-top">
          <span>{title}</span>
          <span>{subtitle}</span>
        </div>
      )}
      <svg viewBox="0 0 400 160" className="wave-svg" preserveAspectRatio="none">
        <path d={paths.main} className="main" />
        <path d={paths.ghost} className="ghost" />
      </svg>
    </div>
  );
}