# NEXUS RS — EOC-Style Start Exercise Patch

## Summary

This patch aligns the NEXUS RS Mission Portal / Start Exercise experience with the proven NEXUS EOC structure while preserving NEXUS RS as the functional source of truth.

The updated page now presents a compact setup flow:

1. Select scenario
2. Select role
3. Review mission readiness
4. Start exercise

## EOC elements adapted

- Compact Start Exercise page hierarchy
- Searchable scenario catalog
- Incident-type filter
- Three-column image-led scenario grid on desktop
- Selected scenario border and badge treatment
- Right-side sticky confirmation panel
- Compact card proportions and information density
- Professional dark navy panel system
- Responsive collapse behavior

## RS logic preserved

- Existing RS scenarios and metadata
- RS role options and authority model
- Existing exercise controller and STARTEX action
- Mission-state initialization
- Operational period lifecycle
- Anthropic advisor integration
- Downstream operational workspaces
- AAR behavior
- Local incident time conventions

The patch does not introduce EOC roles, doctrine, difficulty logic, or state management.

## Files changed

- `src/App.jsx`
- `src/components/MissionPortal.jsx`
- `src/styles.css`

## Installation path

`C:\Dev\nexus-rs`

## Installation instructions

1. Extract this ZIP.
2. Copy the included files into `C:\Dev\nexus-rs`.
3. Preserve the folder structure.
4. Replace the existing files when prompted.
5. Run:

```powershell
npm install
npm run build
```

## Build verification result

Verified successfully with:

```text
vite v6.4.3
63 modules transformed
production build completed successfully
```

## Known limitations

- Scenario imagery continues to use the existing RS portal image sources.
- Custom Scenario remains a selectable baseline card; a dedicated custom-scenario editor is outside this patch.
- Scenario Brief content remains based on the current RS brief implementation.
- This patch does not redesign in-exercise workspaces.

## Manual test checklist

- [ ] Mission Portal loads without errors.
- [ ] Scenario search filters cards by title, description, location, and incident type.
- [ ] Incident-type filter works for all configured categories.
- [ ] Scenario cards display in a three-column desktop grid.
- [ ] Selected scenario receives a visible border and Selected badge.
- [ ] Selecting a scenario updates Mission Readiness.
- [ ] Role cards remain disabled until a scenario is selected.
- [ ] Selecting a role updates Mission Readiness.
- [ ] Readiness checklist updates without numeric scoring.
- [ ] View Scenario Brief uses the selected scenario context.
- [ ] Start Exercise remains disabled until scenario and role are selected.
- [ ] Start Exercise invokes the existing RS lifecycle controller.
- [ ] Resume Exercise and Review AAR behavior remain intact.
- [ ] Anthropic advisor remains available after entering the exercise.
- [ ] Existing operational modules continue to load.
- [ ] Responsive layout collapses cleanly at tablet and mobile widths.
