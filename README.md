# Circuit Companion

This pass turns the mockup into a more functional React source package.

## What changed
- WebMIDI hook wired into parameter changes and MIDI CC input updates.
- Real Circuit Tracks parameter registry added for the surfaced controls.
- Drag-and-drop only appears on controls that are actual modulation destinations.
- Patch save/load and project save/load added with localStorage plus JSON import/export.
- Browser issues fixed:
  - `React is not defined` fixed by adding the React Vite plugin and explicit React imports.
  - `slider-vertical` deprecation fixed by using `writing-mode: vertical-lr` and `direction: rtl`.
  - favicon 404 fixed by adding `favicon.svg`.

## Notes
- This package focuses on the real-time CC-mapped controls surfaced in the UI.
- Circuit Tracks supports deeper patch serialization and other parameters through the programmer reference guide, including patch dump and replace workflows.
- Macro destination editing and the full dual-source modulation slot structure are not fully implemented yet.
- Patch and project save/load in this pass are app-level state features, not native `.syx` or pack import/export.

## Run
```bash
npm install
npm run dev
```


## Hardware sync notes
- CC-backed and NRPN-backed surfaced controls now transmit to Circuit Tracks.
- The hardware modulation matrix is synced through the official 12-slot NRPN table.
- Macro destination editing is still separate work and is not yet implemented.
