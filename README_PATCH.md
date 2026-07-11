# NEXUS RS Navigation Icon Size Patch

## Change
Increases the selected Mission navigation icon from 20px to 24px.

No spacing, colors, selected-state styling, navigation behavior, or other icons are changed.

## Apply

1. Extract this ZIP.
2. Open PowerShell.
3. Run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\APPLY_PATCH.ps1
```

The script targets:

`C:\Dev\nexus-rs\src\components\current-operations\CurrentOperationsRouter.jsx`

It creates a backup before editing:

`CurrentOperationsRouter.jsx.before-nav-icon-size.bak`

## Push

```powershell
git add .
git commit -m "refine RS navigation icon sizing"
git push origin dev
```

## Safety
The script stops without changing anything if it cannot find the exact approved `Mission` icon code using `size={20}`.
