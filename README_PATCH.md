# NEXUS RS Coordinator Workspace Fix Pass 2

## Summary
Fixes the Coordinator Current Operations layout without expanding scope into a shared COP. The patch adds continuous resizing, a real interactive incident map, a wider mini Sync Matrix, simplified advisor status language, and removes the sidebar role card and UPAD map markers.

## Files changed
- `src/components/current-operations/CurrentOperationsRouter.jsx`
- `src/components/AdvisorIdentity.jsx`
- `src/components/AdvisorPanel.jsx`
- `src/styles.css`

## What changed

### Continuous resizable dividers
- Sidebar / workspace divider
- Workspace / advisor divider
- Three top operational panels
- Regional map / platform-production column
- Platform / UPAD vertical stack
- Four lower Coordinator panels

Divider positions persist in browser local storage.

### Coordinator lower row
The mini Sync Matrix now receives the largest share of the lower row. Airspace, Intelligence Oversight, and Key Decision Windows are positioned to its right and the row uses the full available workspace width.

### Operational map
The static map picture was replaced with a dependency-free interactive slippy map:
- OpenStreetMap basemap tiles
- Mouse/touch pan
- Wheel and button zoom
- Reset-view control
- Three incident markers
- Aircraft markers
- TFR/airspace rings
- Clickable operational markers

UPAD locations are not displayed on the map.

### Advisor status
The visible `LOCAL FALLBACK` wording was replaced by `ADVISOR ACTIVE`.

When Anthropic is unavailable, the existing deterministic advisor still responds. The status tooltip explains this without exposing provider implementation language in the normal interface. Advisor history remains available.

### Sidebar
Removed the bottom `Your Role` / `Role Guide` card from the role workspace sidebar.

## Logic preserved
- Role authority
- Exercise lifecycle
- Shared mission state
- Anthropic advisor integration
- Deterministic advisor fallback
- Advisor history
- Confirmation flow
- Sync Matrix navigation
- STARTEX and ENDEX behavior
- Other role workspaces

## Installation
Extract the patch into:

`C:\Dev\nexus-rs`

Allow the included paths to replace the matching files.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Known limitation
The operational map loads OpenStreetMap tiles over the network. The rest of the workspace remains functional if tile access is unavailable, but the basemap will not render until connectivity returns.

## Manual test checklist
- Open the Coordinator Current Operations workspace.
- Drag the sidebar divider slowly across multiple positions.
- Drag the advisor divider slowly across multiple positions.
- Resize each top panel.
- Resize the map and right-side platform/UPAD column.
- Resize the Platform and UPAD panels vertically.
- Resize every lower-row panel.
- Refresh and confirm divider positions persist.
- Confirm the mini Sync Matrix is wider and the lower row fills the workspace.
- Pan and zoom the operational map.
- Click incident and aircraft markers.
- Confirm no UPAD markers appear on the map.
- Confirm `ADVISOR ACTIVE` appears instead of `LOCAL FALLBACK`.
- Open View Advisor History.
- Confirm the bottom sidebar role card is absent.
- Open the full Sync Matrix from the sidebar and mini panel.
