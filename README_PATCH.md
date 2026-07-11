# NEXUS RS Header Logo and View Control Cleanup

## Summary
Applies the requested visual cleanup to the active Current Operations workspace without changing exercise logic.

## Changes
- Replaces the generated top-left NEXUS RS mark with a cropped brand asset from the supplied `RS logo sheet.png`.
- Aligns the three top-row View buttons by anchoring them to the bottom of their panels.
- Standardizes all `.rx-outline-button` controls to one shared teal style across the role workspace.
- Adds a simple EOC-style 0 / 10 NM / 20 NM scale bar to the operational map.
- Removes the empty advisor summary container that created the unexplained rounded blank element.

## Files changed
- `src/components/current-operations/CurrentOperationsRouter.jsx`
- `src/components/AdvisorPanel.jsx`
- `src/styles.css`
- `public/images/brand/nexus-rs-header-logo.png`

## Installation
Extract the patch into:

`C:\Dev\nexus-rs`

Allow the included paths to overwrite matching files.

## Logic preserved
- Role-specific Current Operations layouts
- Shared mission state
- Map pan and zoom
- Advisor messaging, history, Anthropic integration, and deterministic fallback
- STARTEX and ENDEX
- Role authority and downstream workflows

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Confirm the supplied NEXUS RS brand appears at the top left.
- Confirm all three top-row View buttons share the same baseline.
- Confirm View buttons across the workspace share the same style.
- Confirm the map shows the 0 / 10 NM / 20 NM scale.
- Confirm the unexplained empty rounded advisor element is gone.
- Confirm advisor history and response submission still work.
- Confirm map pan and zoom still work.
