# NEXUS RS Step 2 Patch

Adds connected Current Ops and Tomorrow's Plan workspaces.

## Files
- src/App.jsx
- src/components/CurrentOps.jsx
- src/components/TomorrowPlan.jsx
- src/data/missionState.js
- src/styles.css

## Behavior
- Current Ops and Tomorrow's Plan are separate navigation workspaces.
- Both use one shared mission-state object.
- Changes in one period create visible consequences in the other.
- Role-specific authority controls which actions are available.
- Coordinator can approve the tomorrow plan.
- Collection Manager can mark requirements taskable.
- UPAD LNO can assign production support.
- RS roles can update current mission protection and coordination status.
- All displayed times remain local incident time only.
