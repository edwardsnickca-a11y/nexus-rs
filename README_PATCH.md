# NEXUS RS Patch 9 — Exercise Controller and Scenario Flow

## Module summary
Adds an application-wide exercise lifecycle so NEXUS RS behaves as one connected exercise from Mission Portal through Scenario Brief, Role Selection, STARTEX, OP1, transition planning, OP2, ENDEX, and Final AAR.

This patch adds:
- Explicit exercise state in mission state.
- Mission Portal with lifecycle status and primary actions.
- Scenario Brief before role selection.
- Required role selection before STARTEX.
- STARTEX initialization and history recording.
- Controlled turn advancement using local incident time only.
- Deterministic decision-window evaluation and expiration consequences.
- Transition planning recognition and OP2 start.
- Explicit ENDEX confirmation with unresolved item summary.
- Final AAR status after ENDEX using the frozen end-state snapshot where practical.
- Persistent exercise status bar.
- DEV-safe Reset Exercise control.

## Files changed
- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/Sidebar.jsx`
- `src/components/AfterActionReview.jsx` indirectly uses updated AAR engine status behavior
- `src/data/missionState.js`
- `src/engine/aarEngine.js`
- `src/styles.css`

## Files added
- `src/components/MissionPortal.jsx`
- `src/components/ScenarioBrief.jsx`
- `src/components/RoleSelection.jsx`
- `src/components/ExerciseStatusBar.jsx`
- `src/components/EndExModal.jsx`
- `src/engine/exerciseController.js`

## Installation path
Install into:

`C:\Dev\nexus-rs`

## Replacement instructions
1. Unzip `nexus_rs_exercise_controller_step9_patch.zip`.
2. Copy the contained files into `C:\Dev\nexus-rs`.
3. Allow Windows to replace files with matching paths.
4. From the project root, run:

```powershell
npm install
npm run build
```

## Build verification result
Verified successfully in the patch workspace:

```text
npm run build
vite v6.4.3 building for production...
✓ built in 897ms
```

## Known limitations
- The exercise clock is controlled by the `Advance Exercise` action; it is not a continuous real-time clock.
- Decision-window release and expiration are deterministic and intentionally limited to currently modeled state.
- Existing operational modules receive read-only state context after ENDEX, but this patch avoids broad refactoring of every workflow button to keep the patch small and stable.
- PDF export is not included.
- No external API key or AI narrative service is required.

## Manual test checklist
- [ ] Mission Portal loads without errors.
- [ ] Scenario Brief opens from the portal.
- [ ] Role Selection opens and requires selecting one of four roles.
- [ ] STARTEX is unavailable until a role is confirmed.
- [ ] STARTEX starts OP1, sets turn 1, and records lifecycle history.
- [ ] Status bar shows scenario, role, status, OP, turn, and local incident time.
- [ ] Advance Exercise increments turn and local incident time.
- [ ] Decision windows appear in exercise state and expire deterministically.
- [ ] Mission Updates receives lifecycle and consequence updates.
- [ ] Review Transition moves lifecycle to transition planning.
- [ ] OP Transition approval starts OP2 and preserves carry-forward context.
- [ ] ENDEX confirmation shows unresolved requirements, products, dissemination, State J3 requests, and oversight cases.
- [ ] ENDEX allows unresolved items and opens Final AAR.
- [ ] AAR displays PROVISIONAL AAR before ENDEX and FINAL AAR after ENDEX.
- [ ] Decision Log and mission history remain accessible after ENDEX.
- [ ] Reset Exercise returns to Mission Portal.
- [ ] Existing modules continue to render.
- [ ] `npm run build` completes successfully.
