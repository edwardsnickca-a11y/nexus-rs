# NEXUS RS Role-Specific Current Operations Pixel-Match Patch

## Pixel-match summary
Implements four visually distinct Current Operations views mapped to the supplied RS Coordinator, RS Manager, Collection Manager, and UPAD LNO mockups. All four views share one live-exercise shell, one mission state, one map component, and the existing Lt Col Edwards advisor flow.

## Mockup mapping
- Remote Sensing Coordinator → `RS Coord mockup.png`
- Remote Sensing Manager → `RS Man mockup.png`
- Collection Manager → `CM Mockup.png`
- UPAD LNO → `UPAD LNO mockup.png`
- Advisor identity → approved `Military portrait in U.S. Air Force uniform.png`

## Authority matrix usage
The implementation follows `NEXUS_RS_Role_Workspace_Authority_Matrix.xlsx`:
- Coordinator controls approved regional allocation and release actions.
- RS Manager controls mission execution status.
- Collection Manager controls requirement drafting, validation, and send-forward actions.
- UPAD LNO controls production-status updates through the existing dissemination callback.
- Shared awareness remains visible across roles even when controls are read-only.

## Files changed
- `src/App.jsx`
- `src/styles.css`
- `public/images/advisor/lt-col-edwards.png`

## Files added
- `src/components/current-operations/CurrentOperationsRouter.jsx`

## Shared components
The router includes reusable live-exercise components for:
- Header
- Sidebar and role card
- Current Operational Period
- Tomorrow's Plan
- Deadlines
- Regional Mission Picture
- Platform Availability
- Requirements Summary
- UPAD Production
- Airspace
- Intelligence Oversight
- Decision Windows
- Shared Lt Col Edwards advisor column

## Role-specific components
- Coordinator Current Operations
- RS Manager Current Operations
- Collection Manager Current Operations
- UPAD LNO Current Operations

## State binding notes
The views read from existing connected records:
- `exercise`
- `currentOps`
- `tomorrowPlan`
- `assetControl`
- `requirements`
- `dissemination`
- `oversight`
- `simulation.advisorHistory`

Role actions use existing application callbacks or a shared mission-execution update callback added in `App.jsx`. No second state store was introduced.

## Known placeholders
- The regional map is a shared CSS operational map treatment because no live GIS basemap service is present in the supplied repository.
- Airspace rows, countdown values, and some workload indicators use the approved mockup structure where the current mission state does not yet expose a dedicated record.
- These placeholders are presentation-only and do not replace authoritative mission records.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Role-by-role test results
- Coordinator: renders allocation-focused layout; approved asset release callback remains connected.
- RS Manager: renders execution-focused layout; compact mission-status control updates shared `currentOps.missions`.
- Collection Manager: renders requirement-development workspace; draft update, validation, and send-forward callbacks remain connected.
- UPAD LNO: renders production-focused layout; delivery status update callback remains connected.
- All roles: shared advisor history, free-text input, Anthropic/local fallback, participant identity, and ENDEX modal remain connected.

## Screenshot comparison notes
One visual refinement pass was applied against all four mockups. The implementation matches the supplied desktop composition in:
- compact header and sidebar proportions
- persistent right advisor column
- role-specific panel order
- dense panel and table spacing
- teal, amber, red, purple, and green status hierarchy
- large shared regional mission picture
- compact role-specific forms and operational tables

The implementation intentionally omits difficulty, performance scoring, suggested-action buttons, Zulu time, and silhouette avatars.

## Installation
Extract the ZIP into:

`C:\Dev\nexus-rs`

Allow the included files to overwrite or merge into the matching paths.

Then run:

```powershell
npm install
npm run build
```

## Manual test checklist
1. Start an exercise as Remote Sensing Coordinator and open Current Operations.
2. Confirm the Coordinator layout and asset-release control.
3. Repeat with Remote Sensing Manager and update a mission status.
4. Repeat with Collection Manager and edit/validate a requirement.
5. Repeat with UPAD LNO and update production status.
6. Confirm the same advisor avatar appears in every role.
7. Confirm advisor text submission and confirmation flow still work.
8. Confirm participant name displays above the role when entered.
9. Confirm local incident time only.
10. Confirm ENDEX opens the existing unresolved-item confirmation modal.
11. Confirm Mission Portal and other workspaces still open.
12. Run `npm run build`.

## Rollback
Restore the previous versions of:
- `src/App.jsx`
- `src/styles.css`
- `public/images/advisor/lt-col-edwards.png`

Then remove:
- `src/components/current-operations/`
