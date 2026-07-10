# NEXUS RS Current Operations Rebuild Patch

## Summary
Rebuilds the NEXUS RS Current Operations workspace to closely match the supplied Current Operations screenshot. The patch is limited to Current Operations presentation and its app-level routing integration.

## Visual reference
Primary reference: `Mission management dashboard interface.png`

## What changed
- Added a full-viewport Current Operations application shell.
- Added the compact NEXUS RS header with scenario, role, operational period, turn, local incident time, and exercise status.
- Added the narrow operational navigation and quick actions.
- Added the six-part summary strip.
- Rebuilt the dense mission board with filters, row selection, protected-mission markers, status chips, and risk treatments.
- Added a CSS-positioned execution timeline with current-time and decision-deadline markers.
- Added Asset Status, Requirements at Risk, and Products Pending panels.
- Added Lt Col Edwards attention alerts, turn changes, decision window, and near-term panels.
- Added the local-incident-time utility footer.
- Added desktop-first responsive behavior without converting operational data into generic cards.

## Files changed
- `src/App.jsx`
- `src/components/CurrentOps.jsx`
- `src/styles.css`

## Installation
Extract this patch into:

`C:\Dev\nexus-rs`

Allow the included paths to overwrite the matching project files.

## Logic preserved
- Existing exercise lifecycle and active role state
- Existing mission-state object
- Existing mission-protection callback
- Navigation to existing operational workspaces
- Mission Portal and all non-Current Operations workspace implementations
- Local incident time conventions
- Existing Anthropic advisor and downstream workflows

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Known limitations
- The screenshot data is represented as structured Current Operations display data to achieve the requested reference composition.
- Aircraft and utility symbols use dependency-free interface glyphs so the patch does not add an icon-library dependency.
- Mobile is not a priority; the desktop and laptop layouts preserve dense operational presentation.

## Manual test checklist
- Enter or resume an exercise and open Current Operations.
- Confirm the full viewport shell matches the reference silhouette.
- Confirm all six summary values appear.
- Test All, Active, Near-Term, and Changes filters.
- Select mission rows and confirm the selected row treatment.
- Hover mission rows and right-column alerts.
- Verify protected mission tooltips and controls.
- Open Tomorrow's Plan, Requirements, UPAD / Dissemination, Mission Updates, OP Transition, and AAR from navigation.
- Confirm the mission table scrolls horizontally at constrained widths.
- Confirm the right column stacks below the main workspace at narrower laptop widths.
