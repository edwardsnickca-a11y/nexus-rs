# NEXUS RS Map, Scratchpad, and Panel Alignment Fix

## Summary
Applies a focused Current Operations cleanup without changing mission logic or role authority.

## Changes
- Replaced the fixed decorative map ruler with a scale bar calculated from the current map latitude and zoom level.
- The map scale updates whenever the user zooms or pans.
- Added a draggable horizontal divider below the Coordinator map area so the map and adjacent platform/UPAD stack can be resized vertically.
- Removed the unused map reset/home control. Zoom controls remain.
- Removed the top-header Notes control.
- Added a persistent `MY NOTES` scratchpad inside the advisor column.
- Scratchpad content is stored in browser local storage by scenario and role and survives refreshes and browser restarts.
- Scratchpad text is never submitted to Lt Col Edwards.
- Aligned the lower-row action buttons by using consistent panel heights and bottom anchoring.

## Files changed
- `src/components/current-operations/CurrentOperationsRouter.jsx`
- `src/components/AdvisorPanel.jsx`
- `src/styles.css`

## Installation
Extract this patch into:

`C:\Dev\nexus-rs`

Allow the included files to overwrite the matching project paths.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Open the Coordinator Current Operations workspace.
- Zoom the map with the mouse wheel and confirm the page does not scroll.
- Confirm the scale values and scale width change as map zoom changes.
- Pan the map and confirm the scale remains geographically appropriate.
- Confirm only zoom-in and zoom-out controls remain on the map.
- Drag the horizontal divider below the map to change the map area height.
- Refresh and confirm the selected map height persists.
- Enter text in `MY NOTES`, refresh the page, and confirm the text remains.
- Confirm scratchpad text is not copied into the advisor response field.
- Confirm no Notes control appears in the top header.
- Confirm the four lower-row buttons align along the same baseline.
- Confirm STARTEX, advisor Send, advisor history, and ENDEX remain functional.

## Known limitation
The map uses network-delivered OpenStreetMap tiles. Basemap tiles require an internet connection.
