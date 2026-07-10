# NEXUS RS Scenario Graphics Patch

## Summary
Crops the supplied six-panel scenario contact sheet into six consistent web image assets and maps them to the existing NEXUS RS scenario catalog. The same scenario image property now drives scenario-card thumbnails and the Mission Readiness preview.

## Source contact sheet used
`Urban landscapes in disaster aftermath.png`

## Crop mapping
- Top left → California Wildfire Complex
- Top right → Hurricane Coastal Impact
- Middle left → Major River Flooding
- Middle right → Earthquake Urban Response
- Bottom left → Special Event Support
- Bottom right → Custom Scenario

## Image output paths
All assets are stored in `public/images/scenarios/`:
- `rs-california-wildfire-complex.png`
- `rs-hurricane-coastal-impact.png`
- `rs-major-river-flooding.png`
- `rs-earthquake-urban-response.png`
- `rs-special-event-support.png`
- `rs-custom-scenario.png`

Each image is 1200 × 675 pixels with a consistent 16:9 landscape ratio.

## Files changed
- `src/data/portalScenarios.js`
- `src/components/MissionPortal.jsx`
- `src/styles.css`
- six new files under `public/images/scenarios/`

## Installation
Extract this patch into `C:\Dev\nexus-rs` and allow the included paths to merge with the existing project.

## Build verification result
`npm run build` completed successfully with Vite 6.4.3.

## Manual test checklist
- Open Start Exercise.
- Verify all six cards show the correct scenario image.
- Select each scenario and verify Mission Readiness shows the matching image.
- Confirm selected-state badges remain visible.
- Confirm images are not stretched or squashed.
- Confirm scenario selection and incident-type filtering still work.
- Confirm Start Exercise behavior is unchanged.
