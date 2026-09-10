# Activate husky git hooks + clean up temp verify logs.
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

# 1) Ensure git uses .husky as the hooks directory (husky v9 mechanism)
git config core.hooksPath .husky
Write-Host "core.hooksPath -> $(git config core.hooksPath)"

# 2) Verify pre-commit runs
Write-Host "==> npx husky (activation)"
cmd /c "npx husky > verify-logs\husky.log 2>&1"
Write-Host "husky exit: $LASTEXITCODE"

# 3) Clean up temp logs (gitignored anyway)
Remove-Item -Force -ErrorAction SilentlyContinue 'npm-test.log', 'npmtest2.log'
Write-Host "cleanup done"