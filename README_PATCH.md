# NEXUS RS Start Exercise Spacing Cleanup

## Summary
Targeted visual cleanup for the Start Exercise page. Incident-type image badges were removed, the scenario grid was pulled closer to the Select Scenario heading and filter controls, and the separate Confirmation / Mission Readiness / Briefing header block was removed.

## Files changed
- `src/components/MissionPortal.jsx`
- `src/styles.css`

## Installation
Extract the patch into `C:\Dev\nexus-rs` and allow the included files to replace the matching project files.

## Visual changes
- Removed Wildfire, Hurricane, Flood, Earthquake, Planned Event, and Custom labels from scenario images.
- Preserved the selected-state badge.
- Reduced spacing beneath Select Scenario and around the incident-type filter.
- Reduced excess top padding before the scenario grid.
- Removed the separate readiness header container and Briefing chip.
- Mission Readiness content now begins directly with the selected-scenario preview.

## Logic preserved
Scenario selection, incident-type filtering, role selection, readiness calculations, STARTEX, exercise-controller behavior, and downstream RS workflows were not changed.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Confirm no incident-type labels appear over any scenario image.
- Confirm the selected badge still appears on the active card.
- Confirm the first card row is closer to Select Scenario and the filter.
- Confirm the readiness panel starts directly with scenario content.
- Select all six scenarios and verify readiness content updates.
- Confirm role selection and readiness checklist behavior.
- Confirm Start Exercise still launches through the existing controller.
