# NEXUS RS Coordinator Workspace Refinement

## Summary
Targeted Current Operations refinement for the Remote Sensing Coordinator workspace.

## Changes
- Corrected Lt Col Edwards avatar sizing, alignment, and crop.
- Removed the avatar status-dot overlay from the portrait.
- Preserved the compact ONLINE / LOCAL FALLBACK status treatment.
- Added an always-available View Advisor History control.
- Added draggable EOC-style dividers between the navigation, main workspace, and advisor column.
- Added a draggable divider between the regional map and platform/UPAD stack.
- Divider positions persist in browser local storage.
- Replaced the decorative regional background with a real mission-map image derived from the approved Coordinator mockup.
- Replaced the Coordinator Customer Requirements & EEIs block with a compact Sync Matrix.
- Added Sync Matrix to the Current Operations left navigation.
- Rebalanced the lower Coordinator row to use the released space.

## Files changed
- `src/components/current-operations/CurrentOperationsRouter.jsx`
- `src/components/AdvisorIdentity.jsx`
- `src/components/AdvisorPanel.jsx`
- `src/styles.css`
- `public/images/maps/regional-mission-picture.jpg`

## Installation
Extract this ZIP into:

`C:\Dev\nexus-rs`

Allow the included folders to merge and replace matching files.

## Preserved
- Shared mission state
- Role authority
- Anthropic advisor integration
- Deterministic fallback
- Advisor input and confirmation flow
- Exercise lifecycle and ENDEX behavior
- Other role-specific Current Operations layouts

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Known limitations
- The regional mission picture is a local static operational map asset rather than a network tile service, avoiding a new runtime dependency and external map availability risk.
- Resizable divider positions are stored per browser through local storage.

## Manual test checklist
- Open Current Operations as Remote Sensing Coordinator.
- Confirm Sync Matrix appears in the left navigation.
- Confirm the lower-left panel is the compact Sync Matrix rather than Customer Requirements & EEIs.
- Open the full Sync Matrix using the panel button.
- Drag the navigation/main divider.
- Drag the main/advisor divider.
- Drag the map/platform-stack divider.
- Refresh and confirm divider positions persist.
- Confirm the regional mission picture displays geographic map detail.
- Confirm Lt Col Edwards' avatar is centered without a dot over the face.
- Confirm ONLINE or LOCAL FALLBACK remains visible beside the advisor identity.
- Open View Advisor History.
- Submit an advisor message and confirm existing behavior remains functional.
