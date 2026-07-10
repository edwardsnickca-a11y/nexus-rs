# NEXUS RS Incident Type Filter Removal

## Summary
Removes the Incident Type label and dropdown from the pre-exercise Start Exercise page. The scenario grid now follows the Select Scenario heading directly and uses the available content width without a reserved filter column.

## Files changed
- `src/components/MissionPortal.jsx`
- `src/styles.css`

## Installation
Extract the ZIP into:

`C:\Dev\nexus-rs`

Allow the included paths to overwrite the matching project files.

## Behavior preserved
- Scenario cards and metadata
- Scenario selection and selected-state behavior
- Mission Readiness updates
- Role selection
- Readiness logic
- STARTEX and exercise-controller behavior
- Existing RS state and downstream workflows

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Open the Start Exercise page.
- Confirm the Incident Type label is absent.
- Confirm the `All` dropdown is absent.
- Confirm no empty filter column or reserved gap remains.
- Confirm all scenario cards remain visible and evenly spaced.
- Select each scenario and confirm Mission Readiness updates.
- Confirm role selection and Start Exercise still work.
