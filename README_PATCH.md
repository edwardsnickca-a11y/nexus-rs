# NEXUS RS Participant Identity and Advisor Standardization Patch

## Summary
Adds consistent participant identity display and standardizes Lt Col Edwards as a shared advisor identity throughout NEXUS RS using the provided avatar.

## Identity behavior
- When `participantName` exists, the participant name is shown as the primary identity and the selected role is shown beneath it.
- When no participant name exists, the selected role is shown once with no duplicated secondary role.
- The same identity rule is used in the live header, Current Operations header, Mission Readiness, advisor context, and AAR summary.

## Advisor standardization
- Adds a reusable `AdvisorIdentity` component.
- Uses one permanent avatar asset for Lt Col Edwards.
- Standardizes the identity as:
  - LT COL EDWARDS
  - Senior Remote Sensing Mission Advisor
  - ONLINE or LOCAL FALLBACK
- Adds a compact dark navy identity header, avatar, status indicator, message area, and local incident timestamp.
- Preserves Anthropic-connected mode, deterministic fallback, history, free-text input, confirmation, authority validation, and state updates.

## Files changed
- `src/App.jsx`
- `src/components/AdvisorPanel.jsx`
- `src/components/AdvisorIdentity.jsx` — new
- `src/components/CurrentOps.jsx`
- `src/components/Header.jsx`
- `src/components/MissionPortal.jsx`
- `src/components/AfterActionReview.jsx`
- `src/data/missionState.js`
- `src/engine/advisorPromptBuilder.js`
- `src/engine/aarEngine.js`
- `src/utils/participantIdentity.js` — new
- `src/styles.css`
- `public/images/advisor/lt-col-edwards.png` — new

## Installation
Extract the ZIP into:

`C:\Dev\nexus-rs`

Allow the included paths to merge with and overwrite the matching files.

## Build verification
`npm run build` completed successfully with Vite 6.4.3.

## Logic intentionally preserved
- Role authority
- Exercise lifecycle and STARTEX behavior
- Anthropic API integration
- Deterministic fallback
- Advisor history and confirmation flow
- Mission-state updates
- Readiness logic
- Downstream operational workspaces
- AAR evidence logic

## Known limitations
- The shared advisor identity component standardizes all current Lt Col Edwards presentation points in the accumulated codebase. Future advisor placements should reuse the same component and avatar path.
- The avatar image is presentation-only and does not affect advisor behavior.

## Manual test checklist
- Start an exercise with a participant name and verify the name appears above the selected role.
- Start an exercise without a participant name and verify only the selected role appears.
- Confirm no duplicate role text appears.
- Verify Current Operations uses the same identity behavior.
- Verify Mission Readiness updates participant and role correctly.
- Verify the AAR shows participant name when provided and role when not provided.
- Verify Lt Col Edwards uses the same avatar in Current Operations and the shared Advisor Panel.
- Verify Connected and Local fallback status treatments.
- Submit advisor free text and confirm Send, history, interpretation, confirmation, and cancellation still work.
- Run through STARTEX and confirm exercise logic remains unchanged.
