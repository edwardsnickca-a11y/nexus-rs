# NEXUS RS Start Exercise Targeted Simplification

## Summary
This patch applies a focused Mission Portal cleanup based on the latest review.

## Files changed
- `src/components/Header.jsx`
- `src/components/MissionPortal.jsx`
- `src/styles.css`

## Changes
- Renamed the pre-exercise page label from **Mission Portal** to **Start Exercise**.
- Removed the large introductory **Start Exercise** panel beneath the product header.
- Removed scenario search.
- Removed the **Scenario Selection** eyebrow label.
- Retained a single **Select Scenario** heading.
- Preserved incident-type filtering, scenario cards, readiness behavior, role selection, STARTEX logic, and all downstream RS workflows.

## Installation
Copy the patch contents into:

`C:\Dev\nexus-rs`

Allow the files to replace their existing counterparts.

## Build verification
Run:

```powershell
npm run build
```

## Manual test checklist
- Confirm the top product bar says **Start Exercise**.
- Confirm the large introductory panel is gone.
- Confirm no scenario search field appears.
- Confirm the scenario section heading reads **Select Scenario**.
- Confirm incident-type filtering still works.
- Confirm scenario selection still updates Mission Readiness.
- Confirm role selection and STARTEX still work.
