# NEXUS RS Mission Portal Redesign Patch

## Module summary
Redesigns the pre-exercise Mission Portal as the new NEXUS RS front door. The patch adds a structured scenario → role → readiness → STARTEX flow while leaving all in-exercise workspaces unchanged.

## Files changed
- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/MissionPortal.jsx`
- `src/components/Sidebar.jsx`
- `src/data/portalScenarios.js` (new)
- `src/styles.css`

## Installation path
`C:\Dev\nexus-rs`

## Replacement instructions
1. Extract this ZIP.
2. Copy the included files into `C:\Dev\nexus-rs`, preserving folder structure.
3. Replace existing files when prompted.
4. Run `npm install` only if your project dependencies are not already installed.
5. Run `npm run build`.

## What changed
- New NEXUS EOC-aligned dark navy / teal portal visual system.
- Simplified Mission Portal navigation: Mission Portal, Resources, Help & Support.
- Selected-scenario hero with responsive imagery and operational metadata.
- Mission readiness summary with scenario, role, assets, partners, status, and checklist.
- Selectable cards for all four NEXUS RS roles.
- Six reusable scenario cards:
  - California Wildfire Complex
  - Hurricane Coastal Impact
  - Major River Flooding
  - Earthquake Urban Response
  - Special Event Support
  - Custom Scenario
- Horizontal exercise lifecycle section.
- Quick-links support area.
- Portal-specific header showing local incident time, exercise status, and selected role.
- In-exercise workspace layout and modules remain unchanged.

## Build verification result
`npm run build` completed successfully with Vite 6.4.3.

## Known limitations
- Scenario selection uses local front-end state and does not yet replace the exercise controller's underlying scenario baseline.
- Scenario imagery is loaded from remote image URLs and requires network access.
- Resources, Help & Support, and several quick links currently open lightweight placeholders or remain non-navigating.
- Scenario Brief continues to use the existing exercise-controller scenario content.
- This is the base visual implementation; spacing, imagery, copy, and card details can be refined in a later patch.

## Manual test checklist
- [ ] Open Mission Portal and confirm no console errors.
- [ ] Confirm left navigation only shows Mission Portal, Resources, and Help & Support.
- [ ] Select each scenario and verify the hero, metadata, readiness summary, and image change.
- [ ] Select each role and verify the selected state is obvious.
- [ ] Confirm the readiness checklist updates after role selection.
- [ ] Confirm `Complexity` is used instead of `Difficulty`.
- [ ] Confirm Start Exercise is disabled until a role is selected.
- [ ] Confirm View Scenario Brief routes to the existing brief flow.
- [ ] Confirm Start Exercise enters the existing exercise flow.
- [ ] Confirm in-exercise workspaces retain their previous design.
- [ ] Test desktop, tablet, and mobile breakpoints.
