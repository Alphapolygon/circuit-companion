import React, { useMemo, useState } from 'react';
import Panel from '../ui/Panel.jsx';
import KnobRow from '../ui/KnobRow.jsx';
import ModSourceChip from '../ui/ModSourceChip.jsx';
import { MACRO_SOURCES, PARAM_ORDER } from '../../data/circuitTracks.js';

const NOTE_RANGE = Array.from({ length: 25 }, (_, index) => 48 + index);
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function formatNote(note) {
  const octave = Math.floor(note / 12) - 1;
  return `${NOTE_NAMES[note % 12]}${octave}`;
}

function NoteEditorModal({ step, onClose, onSave }) {
  const [notes, setNotes] = useState(Array.isArray(step.note) ? step.note : [step.note ?? 60]);

  const toggleNote = (note) => {
    setNotes((current) => current.includes(note) ? current.filter((entry) => entry !== note) : [...current, note].sort((a, b) => a - b));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card note-modal" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h3>Edit Step {step.index + 1} Notes</h3>
          <button className="danger-button mini-danger" onClick={onClose}>×</button>
        </div>
        <div className="note-chip-grid">
          {NOTE_RANGE.map((note) => (
            <button
              key={note}
              className={`note-chip ${notes.includes(note) ? 'active' : ''}`}
              onClick={() => toggleNote(note)}
            >
              {formatNote(note)}
            </button>
          ))}
        </div>
        <div className="toolbar-row compact-toolbar-row">
          <span className="tag">{notes.length ? notes.map(formatNote).join(' · ') : 'No notes selected'}</span>
          <button className="hero-button" onClick={() => onSave(notes.length ? notes : [60])}>Save Notes</button>
        </div>
      </div>
    </div>
  );
}

export default function PerformTab({
  params,
  updateParam,
  mod,
  macroMod,
  sequence,
  toggleStep,
  cycleStepProbability,
  sequencer,
  activeLockStep,
  setActiveLockStep,
  updateStepNotes,
  clearStepLocks,
}) {
  const [noteEditorIndex, setNoteEditorIndex] = useState(null);
  const selectedStep = useMemo(() => sequence.find((step) => step.index === activeLockStep) || null, [sequence, activeLockStep]);

  return (
    <div className="tab-layout perform-grid compact-perform-grid">
      <Panel title="Macro Sources + Strip">
        <div className="perform-macro-panel">
          <div className="macro-source-grid">
            {MACRO_SOURCES.map((source) => (
              <ModSourceChip key={source.id} source={source} armed={macroMod.armedSource === source.id} onArm={macroMod.setArmedSource} onDragStart={macroMod.onSourceDragStart} />
            ))}
          </div>
          <KnobRow ids={PARAM_ORDER.macros} params={params} updateParam={updateParam} mod={mod} macroMod={macroMod} columns="eight-up" />
        </div>
      </Panel>
      <Panel title="Sketch Sequencer">
        <div className="toolbar-row compact-toolbar-row sequencer-toolbar">
          <button className="hero-button" onClick={sequencer.toggle}>{sequencer.isPlaying ? 'Stop' : 'Play'}</button>
          <span className="tag">Step {sequencer.currentStep >= 0 ? sequencer.currentStep + 1 : '--'}</span>
          <span className={`tag ${activeLockStep !== null ? 'lock-tag active' : 'lock-tag'}`}>
            {activeLockStep !== null ? `Lock Step ${activeLockStep + 1}` : 'No lock step'}
          </span>
          {activeLockStep !== null ? <button className="hero-button ghost" onClick={() => clearStepLocks(activeLockStep)}>Clear Locks</button> : null}
        </div>
        <div className="step-grid compact-step-grid">
          {sequence.map((step) => (
            <div
              key={step.index}
              className={`step-cell ${step.active ? 'active' : ''} ${step.index % 8 === 0 ? 'accent' : ''} ${sequencer.currentStep === step.index ? 'playing' : ''} ${activeLockStep === step.index ? 'lock-selected' : ''}`}
            >
              <button className="step-main-button" onClick={() => toggleStep(step.index)}>
                <span>{step.index + 1}</span>
                <small>{Array.isArray(step.note) ? `${step.note.length}n` : '1n'} · {step.probability}%</small>
                <small>{Object.keys(step.locks || {}).length} locks</small>
              </button>
              <div className="step-actions-row">
                <button className="step-mini-button" onClick={() => cycleStepProbability(step.index)}>Chance</button>
                <button className="step-mini-button" onClick={() => setNoteEditorIndex(step.index)}>Notes</button>
                <button className={`step-mini-button ${activeLockStep === step.index ? 'active' : ''}`} onClick={() => setActiveLockStep((current) => current === step.index ? null : step.index)}>Lock</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {noteEditorIndex !== null ? (
        <NoteEditorModal
          step={sequence[noteEditorIndex]}
          onClose={() => setNoteEditorIndex(null)}
          onSave={(notes) => {
            updateStepNotes(noteEditorIndex, notes);
            setNoteEditorIndex(null);
          }}
        />
      ) : null}
      {selectedStep ? (
        <Panel title={`Step ${selectedStep.index + 1} Param Locks`} className="full-width">
          <div className="info-card">
            <strong>Recording locks is live</strong>
            <span>Turn any synth knob while a lock step is selected and the current value is stored on that step. Playback will send those CC/NRPN values before the notes fire.</span>
          </div>
          <div className="lock-list">
            {Object.entries(selectedStep.locks || {}).length ? Object.entries(selectedStep.locks || {}).map(([paramId, value]) => (
              <div key={paramId} className="live-route-item">
                <span>{paramId.replaceAll('_', ' ')}</span>
                <strong>{value}</strong>
              </div>
            )) : <div className="info-card"><span>No locks yet for this step.</span></div>}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
