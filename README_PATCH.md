# NEXUS RS — Mission Portal Fix Pass 1

## Summary
Targeted Mission Portal-only refinement.

## Changed
- Replaced the California Wildfire Complex hero background with an incident-driven aerial wildfire image showing active smoke, fireline, and terrain.
- Reduced the selected-scenario hero height from 430px to 380px.
- Compressed the Mission Readiness panel to match the tighter hero height.
- Converted readiness metadata and checklist content to compact two-column layouts on desktop.
- Reduced upper-panel padding, text spacing, metadata-box height, CTA spacing, and the gap below the hero area.
- Preserved the existing two-column portal structure, typography hierarchy, palette, and all in-exercise workspaces.

## Files changed
- `src/styles.css`

## Installation target
`C:\Dev\nexus-rs`

## Replacement instructions
Copy `src/styles.css` from this patch into the matching project path and replace the existing file.

## Verification
This is a CSS-only targeted patch. No component structure or application logic was changed.

## Manual checks
1. Open Mission Portal with California Wildfire Complex selected.
2. Confirm the hero shows an active wildfire incident rather than scenic forest imagery.
3. Confirm both top panels have aligned, reduced height.
4. Confirm more of the role-selection section is visible above the fold.
5. Resize below 760px and confirm readiness content returns to one column.
6. Confirm in-exercise workspaces are unchanged.
