# NEXUS RS Coordinator Workspace Fix Pass 4

## Summary
Returns Key Decision Windows to the original lower-row size and reunifies the Coordinator page into one continuous scrolling workspace. The advisor column remains fixed while the operational content—including the lower Matrix / Airspace / Intelligence Oversight / Key Decision Windows row—scrolls together.

## Files changed
- `src/components/current-operations/CurrentOperationsRouter.jsx`
- `src/styles.css`

## What changed
- Moved the lower four-panel row back inside the main Coordinator workspace.
- Restored Key Decision Windows to the same lower-row sizing as the other panels.
- Removed the separate bottom-page grid region.
- Main operational content now scrolls as one continuous column.
- Advisor column remains stationary and independently scrollable.
- Preserved continuous divider resizing across the lower row.
- Preserved the non-passive map wheel handler so map zoom does not scroll the page.

## Installation
Extract the ZIP into:

`C:\Dev\nexus-rs`

Allow the included files to overwrite the matching project files.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Open the Coordinator Current Operations workspace.
- Scroll the main workspace and confirm the top, middle, and lower panels move together.
- Confirm the advisor column remains stationary.
- Confirm Key Decision Windows has returned to its original lower-row size.
- Confirm Matrix, Airspace, Intelligence Oversight, and Key Decision Windows remain on one row.
- Drag each lower-row divider and confirm continuous resizing.
- Zoom the map with the mouse wheel and confirm the page does not scroll.
- Confirm advisor history and input remain usable.
