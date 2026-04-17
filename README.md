# Circuit Companion

A modern, premium WebMIDI editor and librarian for the Novation Circuit Tracks. Runs entirely in the browser with a dense, VST-plugin-style interface.

## Features

- **Hardware SysEx Librarian:** Deep two-way integration with the Circuit Tracks hardware. Fetch the active patch, bulk-sync all 64 patches directly from the device memory, or queue and burn custom patches back to hardware slots.
- **Interactive Visualizers:** - **Faux-3D Oscillators:** Real-time animated wavetable displays that morph as you adjust Index, Density, and V-Sync.
  - **Draggable Envelopes:** Edit ADSR curves directly by clicking and dragging nodes on the waveform screen (with automatic macro-offset compensation).
  - **Spectral Filter:** Glowing filter curves with a dynamic resonance laser.
- **Deep Modulation Matrix:** Full read/write access to the internal 20-slot Mod Matrix and the 32-slot Macro Matrix. Includes visual drag-and-drop routing from source chips to destination knobs.
- **Real-Time WebMIDI:** Bidirectional CC and NRPN parameter sync. Turning a knob on the synth updates the UI instantly, and tweaking the UI updates the synth.
- **Local Storage & State:** Save custom patches and full projects (including sequencer sketch data and step locks) to your browser's local storage, or import/export them as JSON backups.

## Tech Stack & Architecture

- Built with **React** and **Vite**.
- **WebMIDI API** handles all communication.
- Custom SysEx parser strictly mapped to the Circuit Tracks 348-byte payload structure to accurately decode patch names, parameter states, and matrix routings.
- No backend required—runs entirely client-side.

## Local Development

To run this project locally:

```bash
npm install
npm run dev
