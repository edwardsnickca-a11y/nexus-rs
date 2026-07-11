param(
    [string]$ProjectRoot = "C:\Dev\nexus-rs"
)

$ErrorActionPreference = "Stop"

$target = Join-Path $ProjectRoot "src\components\current-operations\CurrentOperationsRouter.jsx"

if (-not (Test-Path $target)) {
    throw "Could not find: $target"
}

$content = Get-Content -Path $target -Raw
$pattern = '(<Icon\s+name=["'']mission["'']\s+size=\{)20(\}\s*/>)'

if ($content -notmatch $pattern) {
    throw "The expected Mission icon size={20} code was not found. No files were changed."
}

$backup = "$target.before-nav-icon-size.bak"
Copy-Item -Path $target -Destination $backup -Force

$updated = [regex]::Replace($content, $pattern, '${1}24${2}', 1)
Set-Content -Path $target -Value $updated -Encoding UTF8

Write-Host ""
Write-Host "Updated Mission navigation icon from 20px to 24px." -ForegroundColor Green
Write-Host "Changed file:" -ForegroundColor Cyan
Write-Host "  $target"
Write-Host ""
Write-Host "Backup created:" -ForegroundColor Cyan
Write-Host "  $backup"
Write-Host ""
Write-Host "Next commands:" -ForegroundColor Yellow
Write-Host '  git add .'
Write-Host '  git commit -m "refine RS navigation icon sizing"'
Write-Host '  git push origin dev'
