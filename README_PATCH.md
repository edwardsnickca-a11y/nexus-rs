# NEXUS RS Coordinator Workspace Fix Pass 3

## Summary
This patch removes the center advisor divider and scrollbar, keeps the advisor column fixed, moves the Coordinator lower row across the full workspace width, cleans up the Lt Col Edwards identity block, and prevents map-wheel zoom from scrolling the page.

## Files changed
- `src/components/current-operations/CurrentOperationsRouter.jsx`
- `src/components/AdvisorIdentity.jsx`
- `src/styles.css`

## Changes

### Map wheel behavior
The interactive map now uses a non-passive native wheel handler. Mouse-wheel zoom is contained inside the map and no longer scrolls the Current Operations page at the same time.

### Advisor column
- Removed the center resize divider.
- Removed the visible center scrollbar.
- Kept the advisor column fixed in place.
- Removed the `ADVISOR ACTIVE` label.
- Tightened avatar, name, and title alignment.
- Preserved advisor messaging, history, input, Anthropic integration, and deterministic fallback behavior.

### Full-width lower row
For the Remote Sensing Coordinator, the bottom row now spans beneath both the main workspace and advisor column:

`Sync Matrix | Airspace / TFR | Intelligence Oversight | Key Decision Windows`

The four panels retain movable internal dividers and fill the page from the main content edge to the right edge.

## Installation
Extract the ZIP into:

`C:\Dev\nexus-rs`

Allow the included files to overwrite the matching project files.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Open the Remote Sensing Coordinator Current Operations workspace.
- Hover over the map and use the mouse wheel.
- Confirm the map zooms and the page does not scroll.
- Confirm the white center divider and visible center scrollbar are gone.
- Confirm the advisor column remains fixed on the right.
- Confirm no advisor status label appears beside Lt Col Edwards.
- Confirm the avatar, name, and title are aligned cleanly.
- Confirm the bottom row spans under the advisor column.
- Resize the four lower panels using their dividers.
- Open the full Sync Matrix.
- Open View Advisor History.
