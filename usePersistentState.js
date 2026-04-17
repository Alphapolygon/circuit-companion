export const TABS = [
  { id: 'OSC', label: 'OSC' },
  { id: 'MIX', label: 'MIX' },
  { id: 'FX', label: 'FX' },
  { id: 'MOD', label: 'MOD' },
  { id: 'PATCH', label: 'PATCH' },
  { id: 'PERFORM', label: 'PERFORM' },
  { id: 'GLOBAL', label: 'GLOBAL' },
  { id: 'DRUMS', label: 'DRUMS' },
];

export const SYNTH_CHANNELS = [
  { value: 0, label: 'Synth 1', midi: 1 },
  { value: 1, label: 'Synth 2', midi: 2 },
];

export const HARDWARE_MOD_SLOT_COUNT = 20;
export const HARDWARE_MACRO_SLOT_COUNT = 32;
export const DRUM_MIDI_CHANNEL = 10;

export const WAVE_OPTIONS = [
  'Sine', 'Triangle', 'Sawtooth', 'Saw 9:1 PW', 'Saw 8:2 PW', 'Saw 7:3 PW',
  'Saw 6:4 PW', 'Saw 5:5 PW', 'Saw 4:6 PW', 'Saw 3:7 PW', 'Saw 2:8 PW', 'Saw 1:9 PW',
  'Pulse Width', 'Square', 'Sine Table', 'Analogue Pulse', 'Analogue Sync',
  'Triangle-Saw Blend', 'Digital Nasty 1', 'Digital Nasty 2', 'Digital Saw-Square',
  'Digital Vocal 1', 'Digital Vocal 2', 'Digital Vocal 3', 'Digital Vocal 4',
  'Digital Vocal 5', 'Digital Vocal 6', 'Random Collection 1', 'Random Collection 2', 'Random Collection 3'
];

export const FILTER_TYPE_OPTIONS = ['Low Pass 12 dB', 'Low Pass 24 dB', 'Band Pass 6/6 dB', 'Band Pass 12/12 dB', 'High Pass 12 dB', 'High Pass 24 dB'];
export const VOICE_MODE_OPTIONS = ['Mono', 'Mono Auto Glide', 'Poly'];

export const MACRO_SOURCES = Array.from({ length: 8 }, (_, index) => ({
  id: `macro_${index + 1}`,
  label: `Macro ${index + 1}`,
  color: index % 2 === 0 ? 'blue' : 'cyan',
  hardwareMacroIndex: index,
}));

export const MOD_SOURCES = [
  { id: 'mod_wheel', label: 'Mod Wheel', color: 'blue', hardwareSourceId: 1 },
  { id: 'pitch_bend', label: 'Pitch Bend', color: 'blue', hardwareSourceId: 2 },
  { id: 'aftertouch', label: 'Aftertouch', color: 'blue', hardwareSourceId: 3 },
  { id: 'velocity', label: 'Velocity', color: 'green', hardwareSourceId: 4 },
  { id: 'keyboard', label: 'Key Track', color: 'amber', hardwareSourceId: 5 },
  { id: 'lfo1_plus', label: 'LFO 1 +', color: 'cyan', hardwareSourceId: 6 },
  { id: 'lfo1_bipolar', label: 'LFO 1 +/-', color: 'cyan', hardwareSourceId: 7 },
  { id: 'lfo2_plus', label: 'LFO 2 +', color: 'purple', hardwareSourceId: 8 },
  { id: 'lfo2_bipolar', label: 'LFO 2 +/-', color: 'purple', hardwareSourceId: 9 },
  { id: 'env_amp', label: 'Env Amp', color: 'green', hardwareSourceId: 10 },
  { id: 'env_filter', label: 'Env Filter', color: 'amber', hardwareSourceId: 11 },
  { id: 'env3', label: 'Env 3', color: 'lime', hardwareSourceId: 12 },
];

export const PARAMS = {
  voice_mode: { label: 'Voice Mode', controlType: 'select', options: VOICE_MODE_OPTIONS, cc: 3, defaultValue: 2, modulatable: false, section: 'voice' },
  portamento: { label: 'Porta', controlType: 'knob', cc: 5, defaultValue: 0, modulatable: false, section: 'voice' },
  pre_glide: { label: 'Pre-Glide', controlType: 'knob', cc: 9, defaultValue: 64, modulatable: false, section: 'voice' },
  keyboard_octave: { label: 'Octave', controlType: 'knob', cc: 13, defaultValue: 64, modulatable: false, section: 'voice' },

  osc1_wave: { label: 'Osc 1 Wave', controlType: 'select', options: WAVE_OPTIONS, cc: 19, defaultValue: 2, modulatable: false, section: 'osc1' },
  osc1_interpolate: { label: 'Interp', controlType: 'knob', cc: 20, defaultValue: 0, modulatable: false, section: 'osc1' },
  osc1_index: { label: 'Index', controlType: 'knob', cc: 21, defaultValue: 127, modulatable: true, macroAssignable: true, modDestination: 5, section: 'osc1' },
  osc1_vsync: { label: 'V-Sync', controlType: 'knob', cc: 22, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 3, section: 'osc1' },
  osc1_density: { label: 'Density', controlType: 'knob', cc: 24, defaultValue: 0, modulatable: false, section: 'osc1' },
  osc1_detune: { label: 'Detune', controlType: 'knob', cc: 25, defaultValue: 0, modulatable: false, section: 'osc1' },
  osc1_semitones: { label: 'Semi', controlType: 'knob', cc: 26, defaultValue: 64, modulatable: false, section: 'osc1' },
  osc1_cents: { label: 'Fine', controlType: 'knob', cc: 27, defaultValue: 64, modulatable: false, section: 'osc1' },
  osc1_pitchbend: { label: 'Bend', controlType: 'knob', cc: 28, defaultValue: 76, modulatable: false, section: 'osc1' },

  osc2_wave: { label: 'Osc 2 Wave', controlType: 'select', options: WAVE_OPTIONS, cc: 29, defaultValue: 2, modulatable: false, section: 'osc2' },
  osc2_interpolate: { label: 'Interp', controlType: 'knob', cc: 30, defaultValue: 0, modulatable: false, section: 'osc2' },
  osc2_index: { label: 'Index', controlType: 'knob', cc: 31, defaultValue: 127, modulatable: true, macroAssignable: true, modDestination: 6, section: 'osc2' },
  osc2_vsync: { label: 'V-Sync', controlType: 'knob', cc: 33, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 4, section: 'osc2' },
  osc2_density: { label: 'Density', controlType: 'knob', cc: 35, defaultValue: 0, modulatable: false, section: 'osc2' },
  osc2_detune: { label: 'Detune', controlType: 'knob', cc: 36, defaultValue: 0, modulatable: false, section: 'osc2' },
  osc2_semitones: { label: 'Semi', controlType: 'knob', cc: 37, defaultValue: 64, modulatable: false, section: 'osc2' },
  osc2_cents: { label: 'Fine', controlType: 'knob', cc: 39, defaultValue: 64, modulatable: false, section: 'osc2' },
  osc2_pitchbend: { label: 'Bend', controlType: 'knob', cc: 40, defaultValue: 76, modulatable: false, section: 'osc2' },

  mix_osc1: { label: 'Osc 1', controlType: 'fader', cc: 51, defaultValue: 127, modulatable: true, macroAssignable: true, modDestination: 7, section: 'mix' },
  mix_osc2: { label: 'Osc 2', controlType: 'fader', cc: 52, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 8, section: 'mix' },
  mix_ring: { label: 'Ring', controlType: 'fader', cc: 54, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 10, section: 'mix' },
  mix_noise: { label: 'Noise', controlType: 'fader', cc: 56, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 9, section: 'mix' },
  mix_sub: { label: 'Sub Level', controlType: 'fader', defaultValue: 0, modulatable: false, section: 'mix' },
  mix_pre_fx: { label: 'Pre FX', controlType: 'fader', cc: 58, defaultValue: 64, modulatable: false, section: 'mix' },
  mix_post_fx: { label: 'Post FX', controlType: 'fader', cc: 59, defaultValue: 64, modulatable: false, section: 'mix' },
  mix_pan: { label: 'Pan', controlType: 'fader', defaultValue: 64, modulatable: false, section: 'mix' },

  filter_drive: { label: 'Drive', controlType: 'knob', cc: 63, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 11, section: 'filter' },
  filter_drive_type: { label: 'Drive Type', controlType: 'select', options: ['Diode', 'Valve', 'Clipper', 'Cross-over', 'Rectifier', 'Bit Reducer', 'Rate Reducer'], cc: 65, defaultValue: 0, modulatable: false, section: 'filter' },
  filter_type: { label: 'Filter Type', controlType: 'select', options: FILTER_TYPE_OPTIONS, cc: 68, defaultValue: 1, modulatable: false, section: 'filter' },
  filter_cutoff: { label: 'Cutoff', controlType: 'knob', cc: 74, defaultValue: 127, modulatable: true, macroAssignable: true, modDestination: 12, section: 'filter' },
  filter_tracking: { label: 'Tracking', controlType: 'knob', cc: 69, defaultValue: 127, modulatable: false, section: 'filter' },
  filter_resonance: { label: 'Resonance', controlType: 'knob', cc: 71, defaultValue: 0, modulatable: true, macroAssignable: true, modDestination: 13, section: 'filter' },
  filter_q: { label: 'Q Norm', controlType: 'knob', cc: 78, defaultValue: 64, modulatable: false, section: 'filter' },
  filter_env_amount: { label: 'Env 2→Freq', controlType: 'knob', cc: 79, defaultValue: 64, modulatable: false, section: 'filter' },

  amp_velocity: { label: 'Amp Vel', controlType: 'knob', cc: 108, defaultValue: 64, modulatable: false, section: 'amp_env' },
  amp_attack: { label: 'Amp Attack', controlType: 'knob', cc: 73, defaultValue: 2, modulatable: false, section: 'amp_env' },
  amp_decay: { label: 'Amp Decay', controlType: 'knob', cc: 75, defaultValue: 90, modulatable: true, macroAssignable: true, modDestination: 16, section: 'amp_env' },
  amp_sustain: { label: 'Amp Sustain', controlType: 'knob', cc: 70, defaultValue: 127, modulatable: false, section: 'amp_env' },
  amp_release: { label: 'Amp Release', controlType: 'knob', cc: 72, defaultValue: 40, modulatable: false, section: 'amp_env' },

  filter_velocity: { label: 'Filter Vel', controlType: 'knob', nrpn: [0, 0], defaultValue: 64, modulatable: false, section: 'filter_env' },
  filter_attack: { label: 'Filter Attack', controlType: 'knob', nrpn: [0, 1], defaultValue: 2, modulatable: false, section: 'filter_env' },
  filter_decay: { label: 'Filter Decay', controlType: 'knob', nrpn: [0, 2], defaultValue: 75, modulatable: true, macroAssignable: true, modDestination: 17, section: 'filter_env' },
  filter_sustain: { label: 'Filter Sustain', controlType: 'knob', nrpn: [0, 3], defaultValue: 35, modulatable: false, section: 'filter_env' },
  filter_release: { label: 'Filter Release', controlType: 'knob', nrpn: [0, 4], defaultValue: 45, modulatable: false, section: 'filter_env' },

  env3_delay: { label: 'Env 3 Delay', controlType: 'knob', nrpn: [0, 14], defaultValue: 0, modulatable: false, section: 'env3' },
  env3_attack: { label: 'Env 3 Attack', controlType: 'knob', nrpn: [0, 15], defaultValue: 10, modulatable: false, section: 'env3' },
  env3_decay: { label: 'Env 3 Decay', controlType: 'knob', nrpn: [0, 16], defaultValue: 70, modulatable: false, section: 'env3' },
  env3_sustain: { label: 'Env 3 Sustain', controlType: 'knob', nrpn: [0, 17], defaultValue: 64, modulatable: false, section: 'env3' },
  env3_release: { label: 'Env 3 Release', controlType: 'knob', nrpn: [0, 18], defaultValue: 40, modulatable: false, section: 'env3' },

  lfo1_wave: { label: 'LFO 1 Wave', controlType: 'select', options: ['Sine', 'Triangle', 'Sawtooth', 'Square', 'Random S/H'], nrpn: [0, 70], defaultValue: 0, modulatable: false, section: 'lfo1' },
  lfo1_phase: { label: 'LFO 1 Phase', controlType: 'knob', nrpn: [0, 71], defaultValue: 0, modulatable: false, section: 'lfo1' },
  lfo1_slew: { label: 'LFO 1 Slew', controlType: 'knob', nrpn: [0, 72], defaultValue: 0, modulatable: false, section: 'lfo1' },
  lfo1_delay: { label: 'LFO 1 Delay', controlType: 'knob', nrpn: [0, 74], defaultValue: 0, modulatable: false, section: 'lfo1' },
  lfo1_delay_sync: { label: 'LFO 1 Delay Sync', controlType: 'knob', nrpn: [0, 75], defaultValue: 0, modulatable: false, section: 'lfo1' },
  lfo1_rate: { label: 'LFO 1 Rate', controlType: 'knob', nrpn: [0, 76], defaultValue: 68, modulatable: true, macroAssignable: true, modDestination: 14, section: 'lfo1' },
  lfo1_rate_sync: { label: 'LFO 1 Rate Sync', controlType: 'knob', nrpn: [0, 77], defaultValue: 0, modulatable: false, section: 'lfo1' },

  lfo2_wave: { label: 'LFO 2 Wave', controlType: 'select', options: ['Sine', 'Triangle', 'Sawtooth', 'Square', 'Random S/H'], nrpn: [0, 79], defaultValue: 0, modulatable: false, section: 'lfo2' },
  lfo2_phase: { label: 'LFO 2 Phase', controlType: 'knob', nrpn: [0, 80], defaultValue: 0, modulatable: false, section: 'lfo2' },
  lfo2_slew: { label: 'LFO 2 Slew', controlType: 'knob', nrpn: [0, 81], defaultValue: 0, modulatable: false, section: 'lfo2' },
  lfo2_delay: { label: 'LFO 2 Delay', controlType: 'knob', nrpn: [0, 83], defaultValue: 0, modulatable: false, section: 'lfo2' },
  lfo2_delay_sync: { label: 'LFO 2 Delay Sync', controlType: 'knob', nrpn: [0, 84], defaultValue: 0, modulatable: false, section: 'lfo2' },
  lfo2_rate: { label: 'LFO 2 Rate', controlType: 'knob', nrpn: [0, 85], defaultValue: 68, modulatable: true, macroAssignable: true, modDestination: 15, section: 'lfo2' },
  lfo2_rate_sync: { label: 'LFO 2 Rate Sync', controlType: 'knob', nrpn: [0, 86], defaultValue: 0, modulatable: false, section: 'lfo2' },

  fx_chorus: { label: 'Chorus', controlType: 'knob', cc: 93, defaultValue: 0, modulatable: false, section: 'fx' },
  fx_delay: { label: 'Delay', controlType: 'knob', defaultValue: 26, modulatable: false, section: 'fx' },
  fx_reverb: { label: 'Reverb', controlType: 'knob', defaultValue: 32, modulatable: false, section: 'fx' },
  fx_distortion: { label: 'Distort', controlType: 'knob', cc: 91, defaultValue: 0, modulatable: false, section: 'fx' },
  fx_sidechain: { label: 'Sidechain', controlType: 'knob', defaultValue: 0, modulatable: false, section: 'fx' },
  fx_master_filter: { label: 'Tone', controlType: 'knob', defaultValue: 64, modulatable: false, section: 'fx' },

  global_bpm: { label: 'BPM', controlType: 'knob', defaultValue: 120, modulatable: false, section: 'global' },
  global_swing: { label: 'Swing', controlType: 'knob', defaultValue: 0, modulatable: false, section: 'global' },
  global_prob: { label: 'Chance', controlType: 'knob', defaultValue: 100, modulatable: false, section: 'global' },
  global_mutate: { label: 'Mutate', controlType: 'knob', defaultValue: 0, modulatable: false, section: 'global' },

  drum_1_pitch: { label: 'D1 Pitch', controlType: 'fader', cc: 8, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_1_decay: { label: 'D1 Decay', controlType: 'fader', cc: 43, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_1_distortion: { label: 'D1 Dist', controlType: 'fader', cc: 12, defaultValue: 0, modulatable: false, section: 'drums' },
  drum_1_filter: { label: 'D1 Filter', controlType: 'fader', cc: 74, defaultValue: 64, modulatable: false, section: 'drums' },

  drum_2_pitch: { label: 'D2 Pitch', controlType: 'fader', cc: 18, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_2_decay: { label: 'D2 Decay', controlType: 'fader', cc: 44, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_2_distortion: { label: 'D2 Dist', controlType: 'fader', cc: 22, defaultValue: 0, modulatable: false, section: 'drums' },
  drum_2_filter: { label: 'D2 Filter', controlType: 'fader', cc: 75, defaultValue: 64, modulatable: false, section: 'drums' },

  drum_3_pitch: { label: 'D3 Pitch', controlType: 'fader', cc: 28, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_3_decay: { label: 'D3 Decay', controlType: 'fader', cc: 45, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_3_distortion: { label: 'D3 Dist', controlType: 'fader', cc: 32, defaultValue: 0, modulatable: false, section: 'drums' },
  drum_3_filter: { label: 'D3 Filter', controlType: 'fader', cc: 76, defaultValue: 64, modulatable: false, section: 'drums' },

  drum_4_pitch: { label: 'D4 Pitch', controlType: 'fader', cc: 38, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_4_decay: { label: 'D4 Decay', controlType: 'fader', cc: 46, defaultValue: 64, modulatable: false, section: 'drums' },
  drum_4_distortion: { label: 'D4 Dist', controlType: 'fader', cc: 42, defaultValue: 0, modulatable: false, section: 'drums' },
  drum_4_filter: { label: 'D4 Filter', controlType: 'fader', cc: 77, defaultValue: 64, modulatable: false, section: 'drums' },

  macro_1: { label: 'Macro 1', controlType: 'knob', cc: 80, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 1 },
  macro_2: { label: 'Macro 2', controlType: 'knob', cc: 81, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 2 },
  macro_3: { label: 'Macro 3', controlType: 'knob', cc: 82, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 3 },
  macro_4: { label: 'Macro 4', controlType: 'knob', cc: 83, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 4 },
  macro_5: { label: 'Macro 5', controlType: 'knob', cc: 84, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 5 },
  macro_6: { label: 'Macro 6', controlType: 'knob', cc: 85, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 6 },
  macro_7: { label: 'Macro 7', controlType: 'knob', cc: 86, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 7 },
  macro_8: { label: 'Macro 8', controlType: 'knob', cc: 87, defaultValue: 0, modulatable: false, section: 'macros', macroIndex: 8 },
};

export const PARAM_ORDER = {
  oscA: ['osc1_interpolate', 'osc1_index', 'osc1_vsync', 'osc1_density', 'osc1_detune', 'osc1_semitones', 'osc1_cents', 'osc1_pitchbend'],
  oscB: ['osc2_interpolate', 'osc2_index', 'osc2_vsync', 'osc2_density', 'osc2_detune', 'osc2_semitones', 'osc2_cents', 'osc2_pitchbend'],
  mixer: ['mix_osc1', 'mix_osc2', 'mix_sub', 'mix_ring', 'mix_noise', 'mix_pan', 'mix_pre_fx', 'mix_post_fx'],
  filter: ['filter_drive', 'filter_cutoff', 'filter_resonance', 'filter_tracking', 'filter_q', 'filter_env_amount'],
  ampEnv: ['amp_velocity', 'amp_attack', 'amp_decay', 'amp_sustain', 'amp_release'],
  filterEnv: ['filter_velocity', 'filter_attack', 'filter_decay', 'filter_sustain', 'filter_release'],
  env3: ['env3_delay', 'env3_attack', 'env3_decay', 'env3_sustain', 'env3_release'],
  lfo1: ['lfo1_phase', 'lfo1_slew', 'lfo1_delay', 'lfo1_rate'],
  lfo2: ['lfo2_phase', 'lfo2_slew', 'lfo2_delay', 'lfo2_rate'],
  fx: ['fx_chorus', 'fx_delay', 'fx_reverb', 'fx_distortion', 'fx_sidechain', 'fx_master_filter'],
  global: ['global_bpm', 'global_swing', 'global_prob', 'global_mutate'],
  macros: ['macro_1','macro_2','macro_3','macro_4','macro_5','macro_6','macro_7','macro_8'],
  voice: ['portamento', 'pre_glide', 'keyboard_octave'],
  drums1: ['drum_1_pitch', 'drum_1_decay', 'drum_1_distortion', 'drum_1_filter'],
  drums2: ['drum_2_pitch', 'drum_2_decay', 'drum_2_distortion', 'drum_2_filter'],
  drums3: ['drum_3_pitch', 'drum_3_decay', 'drum_3_distortion', 'drum_3_filter'],
  drums4: ['drum_4_pitch', 'drum_4_decay', 'drum_4_distortion', 'drum_4_filter'],
};

export const DEFAULT_PARAMS = Object.fromEntries(Object.entries(PARAMS).map(([id, meta]) => [id, meta.defaultValue]));

export const DEFAULT_ROUTES = [
  { id: 'seed-1', sourceId: 'lfo1_plus', targetId: 'filter_cutoff', amount: 72 },
  { id: 'seed-2', sourceId: 'env3', targetId: 'osc1_vsync', amount: 56 },
  { id: 'seed-3', sourceId: 'velocity', targetId: 'filter_resonance', amount: 38 },
];

const CHORD_SEQUENCE = [
  [60, 64, 67],
  [62, 65, 69],
  [57, 60, 64],
  [55, 59, 62],
];

export const DEFAULT_SEQUENCE = Array.from({ length: 32 }, (_, index) => ({
  index,
  active: index % 4 === 0 || index % 7 === 0,
  probability: index % 3 === 0 ? 75 : 100,
  velocity: index % 2 === 0 ? 110 : 88,
  note: CHORD_SEQUENCE[index % CHORD_SEQUENCE.length],
  gate: 92,
}));

// A reusable standard mapping matching your hardware layout
const STANDARD_MACROS = [
  { id: 'm1', sourceId: 'macro_1', targetId: 'osc1_index', depth: 80, start: 0, end: 127 },
  { id: 'm2', sourceId: 'macro_2', targetId: 'osc2_index', depth: 80, start: 0, end: 127 },
  { id: 'm3', sourceId: 'macro_3', targetId: 'amp_decay', depth: 100, start: 0, end: 127 },
  { id: 'm4', sourceId: 'macro_4', targetId: 'filter_decay', depth: 100, start: 0, end: 127 },
  { id: 'm5', sourceId: 'macro_5', targetId: 'filter_cutoff', depth: 127, start: 0, end: 127 },
  { id: 'm6', sourceId: 'macro_6', targetId: 'filter_resonance', depth: 100, start: 0, end: 127 },
  { id: 'm7', sourceId: 'macro_7', targetId: 'lfo1_rate', depth: 80, start: 0, end: 127 },
  { id: 'm8', sourceId: 'macro_8', targetId: 'filter_drive', depth: 127, start: 0, end: 127 } 
];

export const DEFAULT_MACRO_ROUTES = STANDARD_MACROS;



export const FACTORY_PATCHES = [
  { id: 'init', name: 'Init Patch', author: 'System', params: DEFAULT_PARAMS, routes: [], macroRoutes: [] },
  
  { id: 'factory-1', name: 'Acid 303', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 2, mix_osc2: 0, filter_cutoff: 35, filter_resonance: 105, filter_env_amount: 95, filter_decay: 35, amp_sustain: 0, amp_decay: 45 }, 
    routes: [{ id: 'r1', sourceId: 'velocity', targetId: 'filter_decay', amount: 85 }], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-2', name: 'Trance Pluck', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 3, osc1_density: 127, osc2_wave: 3, osc2_density: 127, mix_osc2: 127, filter_cutoff: 20, filter_env_amount: 85, filter_decay: 40, amp_sustain: 0, amp_release: 50, fx_delay: 50, fx_reverb: 40 }, 
    routes: [
      { id: 'r1', sourceId: 'velocity', targetId: 'amp_decay', amount: 90 },
      { id: 'r2', sourceId: 'velocity', targetId: 'filter_cutoff', amount: 40 }
    ], 
    macroRoutes: STANDARD_MACROS
  },
  
  { id: 'factory-3', name: 'SuperSaw Pad', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 4, osc1_density: 127, osc2_wave: 5, osc2_density: 127, mix_osc2: 127, filter_cutoff: 80, amp_attack: 75, amp_release: 95, fx_chorus: 100, fx_reverb: 80 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo2_bipolar', targetId: 'filter_cutoff', amount: 30 },
      { id: 'r2', sourceId: 'mod_wheel', targetId: 'filter_cutoff', amount: 80 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-4', name: 'Classic Mininova', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 13, osc1_index: 64, osc2_wave: 13, osc2_detune: 10, mix_osc2: 127, filter_cutoff: 100, filter_drive: 64 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo1_bipolar', targetId: 'osc1_index', amount: 40 },
      { id: 'r2', sourceId: 'lfo1_bipolar', targetId: 'osc2_index', amount: 40 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-5', name: 'Deep House Bass', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 1, osc2_wave: 12, mix_osc2: 80, mix_sub: 100, filter_cutoff: 40, filter_env_amount: 45, filter_decay: 65, amp_sustain: 20, amp_release: 30 }, 
    routes: [{ id: 'r1', sourceId: 'velocity', targetId: 'filter_cutoff', amount: 65 }], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-6', name: 'Glassy Bells', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 14, osc1_index: 100, osc2_wave: 0, mix_osc1: 100, mix_osc2: 100, mix_ring: 90, amp_attack: 5, amp_decay: 100, amp_sustain: 0, amp_release: 80, fx_delay: 60, fx_reverb: 60 }, 
    routes: [{ id: 'r1', sourceId: 'velocity', targetId: 'mix_ring', amount: 80 }], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-7', name: 'Lo-Fi Keys', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 27, mix_noise: 35, filter_cutoff: 55, filter_resonance: 20, amp_attack: 10, amp_release: 60, lfo1_rate: 60, lfo1_wave: 4 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo1_bipolar', targetId: 'filter_cutoff', amount: 45 },
      { id: 'r2', sourceId: 'velocity', targetId: 'filter_cutoff', amount: 60 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-8', name: 'Cyberpunk Brass', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 2, osc2_wave: 2, osc2_detune: 18, mix_osc2: 127, filter_cutoff: 40, filter_env_amount: 75, filter_attack: 35, filter_decay: 85, filter_sustain: 60, filter_drive: 100, amp_attack: 25, amp_release: 50 }, 
    routes: [
      { id: 'r1', sourceId: 'mod_wheel', targetId: 'filter_cutoff', amount: 100 },
      { id: 'r2', sourceId: 'velocity', targetId: 'filter_drive', amount: 70 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-9', name: 'Wobble Bass', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 12, mix_osc2: 0, mix_sub: 80, filter_cutoff: 30, filter_resonance: 60, lfo1_rate: 95, lfo1_wave: 0 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo1_plus', targetId: 'filter_cutoff', amount: 80 },
      { id: 'r2', sourceId: 'mod_wheel', targetId: 'lfo1_rate', amount: 100 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-10', name: 'Stranger Arps', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 16, osc1_index: 40, mix_osc2: 0, filter_cutoff: 50, filter_env_amount: 60, filter_decay: 40, amp_sustain: 0, amp_release: 40, fx_delay: 70 }, 
    routes: [
      { id: 'r1', sourceId: 'velocity', targetId: 'filter_cutoff', amount: 60 },
      { id: 'r2', sourceId: 'env3', targetId: 'osc1_index', amount: 75 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-11', name: '80s Synthwave', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 17, osc1_index: 64, mix_osc2: 0, filter_cutoff: 70, filter_env_amount: 30, filter_decay: 60, amp_attack: 15, amp_release: 50, fx_chorus: 80, fx_reverb: 50 }, 
    routes: [{ id: 'r1', sourceId: 'lfo2_bipolar', targetId: 'filter_cutoff', amount: 40 }], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-12', name: 'Vocal Formants', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 22, osc1_index: 20, mix_osc2: 0, filter_cutoff: 100, lfo2_rate: 70, lfo2_wave: 0 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo2_bipolar', targetId: 'osc1_index', amount: 80 },
      { id: 'r2', sourceId: 'velocity', targetId: 'filter_cutoff', amount: 60 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-13', name: 'FM FM FM', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 0, osc1_vsync: 10, mix_osc2: 0, filter_cutoff: 127, env3_attack: 5, env3_decay: 60, env3_sustain: 0, amp_sustain: 0, amp_decay: 65 }, 
    routes: [
      { id: 'r1', sourceId: 'env3', targetId: 'osc1_vsync', amount: 90 },
      { id: 'r2', sourceId: 'velocity', targetId: 'filter_cutoff', amount: 70 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-14', name: 'Cinematic Drone', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 2, osc1_cents: 40, osc2_wave: 2, osc2_cents: 88, mix_osc2: 100, mix_noise: 20, filter_cutoff: 40, filter_resonance: 30, amp_attack: 110, amp_release: 110, lfo1_rate: 30, fx_reverb: 110 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo1_bipolar', targetId: 'filter_cutoff', amount: 30 },
      { id: 'r2', sourceId: 'lfo2_plus', targetId: 'mix_noise', amount: 50 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
  
  { id: 'factory-15', name: 'Chiptune Lead', author: 'Companion', 
    params: { ...DEFAULT_PARAMS, osc1_wave: 12, osc1_index: 64, mix_osc2: 0, filter_cutoff: 127, filter_env_amount: 0, amp_attack: 2, amp_release: 10, fx_delay: 20 }, 
    routes: [
      { id: 'r1', sourceId: 'lfo1_bipolar', targetId: 'osc1_index', amount: 40 },
      { id: 'r2', sourceId: 'mod_wheel', targetId: 'lfo1_rate', amount: 80 }
    ], 
    macroRoutes: STANDARD_MACROS 
  },
];

export const DEFAULT_PROJECTS = [
  { id: 'project-1', name: 'Warehouse Set', bpm: 128, activePatchId: 'factory-1', sequence: DEFAULT_SEQUENCE, routes: DEFAULT_ROUTES, macroRoutes: STANDARD_MACROS },
];

// Version bumped to v10 to force the browser to clear the cache and load the new arrays!
export const PATCH_STORAGE_KEY = 'circuit-companion-patches-v15';
export const PROJECT_STORAGE_KEY = 'circuit-companion-projects-v15';

// Circuit Tracks single-patch payload layout from the official programmer reference.
export const PATCH_DATA_LENGTH = 340;
export const PATCH_NAME_RANGE = [0, 16];
export const PATCH_CATEGORY_INDEX = 16;
export const PATCH_GENRE_INDEX = 17;
export const MOD_MATRIX_OFFSET = 124;
export const MOD_MATRIX_SLOTS = 20;
export const MOD_MATRIX_STRIDE = 4;
export const MACRO_SECTION_OFFSET = 204;
export const MACRO_SECTION_COUNT = 8;
export const MACRO_SECTION_STRIDE = 17;
export const MACRO_TARGETS_PER_SECTION = 4;
export const MACRO_TARGET_STRIDE = 4;

export const PATCH_BYTE_MAP = {
  voice_mode: 32,
  portamento: 33,
  pre_glide: 34,
  keyboard_octave: 35,

  osc1_wave: 36,
  osc1_interpolate: 37,
  osc1_index: 38,
  osc1_vsync: 39,
  osc1_density: 40,
  osc1_detune: 41,
  osc1_semitones: 42,
  osc1_cents: 43,
  osc1_pitchbend: 44,

  osc2_wave: 45,
  osc2_interpolate: 46,
  osc2_index: 47,
  osc2_vsync: 48,
  osc2_density: 49,
  osc2_detune: 50,
  osc2_semitones: 51,
  osc2_cents: 52,
  osc2_pitchbend: 53,

  mix_osc1: 54,
  mix_osc2: 55,
  mix_ring: 56,
  mix_noise: 57,
  mix_pre_fx: 58,
  mix_post_fx: 59,

  filter_drive: 61,
  filter_drive_type: 62,
  filter_type: 63,
  filter_cutoff: 64,
  filter_tracking: 65,
  filter_resonance: 66,
  filter_q: 67,
  filter_env_amount: 68,

  amp_velocity: 69,
  amp_attack: 70,
  amp_decay: 71,
  amp_sustain: 72,
  amp_release: 73,

  filter_velocity: 74,
  filter_attack: 75,
  filter_decay: 76,
  filter_sustain: 77,
  filter_release: 78,

  env3_delay: 79,
  env3_attack: 80,
  env3_decay: 81,
  env3_sustain: 82,
  env3_release: 83,

  lfo1_wave: 84,
  lfo1_phase: 85,
  lfo1_slew: 86,
  lfo1_delay: 87,
  lfo1_delay_sync: 88,
  lfo1_rate: 89,
  lfo1_rate_sync: 90,

  lfo2_wave: 92,
  lfo2_phase: 93,
  lfo2_slew: 94,
  lfo2_delay: 95,
  lfo2_delay_sync: 96,
  lfo2_rate: 97,
  lfo2_rate_sync: 98,

  fx_distortion: 100,
  fx_chorus: 102,

  macro_1: 204,
  macro_2: 221,
  macro_3: 238,
  macro_4: 255,
  macro_5: 272,
  macro_6: 289,
  macro_7: 306,
  macro_8: 323,
};

export const NOVATION_SYSEX_HEADER = [0x00, 0x20, 0x29, 0x01, 0x64];

export function getParamMeta(id) {
  return PARAMS[id];
}