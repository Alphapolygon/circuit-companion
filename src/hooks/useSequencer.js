import { useCallback, useEffect, useRef, useState } from 'react';

function clampMidi(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(127, Math.round(n)));
}

function normalizeNotes(note) {
  const raw = Array.isArray(note) ? note : [note ?? 60];
  const normalized = raw
    .map((value) => clampMidi(value, 60))
    .filter((value, index, array) => array.indexOf(value) === index);
  return normalized.length ? normalized : [60];
}

export function useSequencer({ sequence, bpm, swing = 0, probabilityBias = 100, onStep }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);
  const stepRef = useRef(-1);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    stepRef.current = -1;
    lastTickRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const start = useCallback(() => {
    setIsPlaying(true);
    lastTickRef.current = 0;
    stepRef.current = -1;
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying((current) => !current);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = (time) => {
      const safeBpm = Math.max(30, Math.min(300, Number(bpm) || 120));
      const baseStepMs = 60000 / safeBpm / 4;
      const swingAmount = Math.max(0, Math.min(0.45, (Number(swing) || 0) / 127 * 0.45));
      const nextIndex = (stepRef.current + 1 + sequence.length) % sequence.length;
      const isSwingStep = nextIndex % 2 === 1;
      const stepMs = baseStepMs * (isSwingStep ? 1 + swingAmount : 1 - swingAmount);

      if (!lastTickRef.current) lastTickRef.current = time;
      if (time - lastTickRef.current >= stepMs) {
        lastTickRef.current = time;
        stepRef.current = nextIndex;
        setCurrentStep(nextIndex);
        const step = sequence[nextIndex];
        if (step?.active) {
          const chance = Math.max(0, Math.min(100, (Number(step.probability) || 100) * ((Number(probabilityBias) || 100) / 100)));
          if (Math.random() * 100 <= chance) {
            onStep?.({
              ...step,
              notes: normalizeNotes(step.note),
              velocity: clampMidi(step.velocity ?? 100, 100),
              gate: clampMidi(step.gate ?? 92, 92),
              stepMs,
            });
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, sequence, bpm, swing, probabilityBias, onStep]);

  return { isPlaying, currentStep, start, stop, toggle, setIsPlaying };
}
