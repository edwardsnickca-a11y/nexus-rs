# NEXUS RS Start Exercise Fix Pass 2

## Summary

This patch simplifies the pre-exercise Mission Portal and aligns it more closely with the NEXUS EOC setup and confirmation pattern.

## Files changed

- `src/App.jsx`
- `src/components/Header.jsx`
- `src/components/MissionPortal.jsx`
- `src/styles.css`
- `README_PATCH.md`

## Installation

Target path:

`C:\Dev\nexus-rs`

Extract the ZIP over the repository root and allow the listed files to replace the existing versions.

## EOC interaction patterns adapted

- Full-width pre-exercise setup page
- Scenario selection first
- Searchable and filterable scenario grid
- Compact two-column setup form
- Sticky right-side confirmation panel
- Immediate confirmation-panel updates
- One primary Start Exercise action

## RS logic preserved

- Existing scenario IDs and records
- Existing selected-role state and role authority
- Existing exercise lifecycle and STARTEX controller
- Existing mission initialization
- Existing asset packages and operational periods
- Existing Anthropic advisor context
- Existing downstream operational workspaces
- Existing AAR behavior

## Build verification

`npm run build` completed successfully with Vite.

## Known limitations

- Participant name, operational context, and exercise focus are currently portal configuration metadata only. They do not alter scenario doctrine or module visibility.
- The optional real-location control was omitted to avoid introducing incomplete scenario-generation behavior.
- Scenario brief readiness continues to use the existing application readiness behavior.

## Manual test checklist

- Confirm the pre-exercise sidebar is absent.
- Confirm only the compact product identity appears in the pre-exercise header.
- Confirm Local Time, Exercise Status, and User / Role are absent from the pre-exercise header.
- Confirm the four workflow badges are absent.
- Search scenarios by title, location, and incident type.
- Filter scenarios by incident type.
- Confirm role selection remains disabled until a scenario is selected.
- Enter an optional participant name.
- Select each RS role and confirm the role functional focus updates.
- Change operational context and exercise focus.
- Select multiple scenarios and confirm image, title, description, location, periods, asset package, and partner agencies update.
- Confirm no difficulty input appears.
- Confirm Start Exercise remains disabled until scenario and role are selected.
- Confirm View Scenario Brief uses the existing action.
- Confirm Start Exercise uses the existing lifecycle controller.
- Confirm live exercise navigation and workspaces remain unchanged.
