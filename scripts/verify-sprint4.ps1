# Sprint 4 Verification Script
# Runs tests, lint, format-check and writes plain-text logs readable after the fact.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\verify-sprint4.ps1
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

$Logs = Join-Path $PWD 'verify-logs'
New-Item -ItemType Directory -Force -Path $Logs | Out-Null

function Run-Step([string]$Name, [string]$Cmd) {
    $out = Join-Path $Logs ($Name + '.log')
    Write-Host "==> $Name"
    # cmd /c redirect (ASCII, flushes as it goes) avoids PowerShell pipe buffering
    cmd /c "$Cmd > `"$out`" 2>&1"
    $code = $LASTEXITCODE
    $code | Out-File -Encoding ascii (Join-Path $Logs ($Name + '.exit'))
}

Run-Step 'test'    'npm test -- --reporter=dot'
Run-Step 'lint'    'npm run lint'
Run-Step 'format-check' 'npx prettier --check src/**/*.{ts,tsx} backend/**/*.js'

Write-Host "DONE. Logs in $Logs"