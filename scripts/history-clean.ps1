# History cleanup: purge the leaked Aiven password from commit 7b33aa3.
# Strategy: rebase -i with an "edit" stop at 7b33aa3, replace check-defaultdb.cjs
# with the already-clean version from d97df47, amend, continue, force-push.
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)
$Logs = Join-Path $PWD 'verify-logs'
New-Item -ItemType Directory -Force -Path $Logs | Out-Null
$Gates = Join-Path $Logs 'history-clean.txt'
Remove-Item -ErrorAction SilentlyContinue $Gates

function Log([string]$Label, [string[]]$GitArgs) {
  $out = Join-Path $Logs ('hc-' + $Label + '.log')
  (& git @GitArgs 2>&1 | Out-String) | Out-File -Encoding ascii $out
  "$Label`:$LASTEXITCODE" | Out-File -Encoding ascii -Append $Gates
}

# 1) Editor script that flips "pick 7b33aa3" -> "edit 7b33aa3" in the todo file.
$editorScript = Join-Path $PSScriptRoot 'rebase-editor.ps1'
@'
param([string]$File)
(Get-Content $File) -replace '^pick 7b33aa3', 'edit 7b33aa3' | Set-Content $File
'@ | Out-File -Encoding ascii $editorScript

$env:GIT_SEQUENCE_EDITOR = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$editorScript`""
$env:GIT_EDITOR = 'true'

# 2) Start the interactive rebase one commit before the offending one.
Log 'rebase-start' @('rebase', '-i', 'ac085b2')

# 3) If the rebase stopped at 7b33aa3 as planned, swap in the clean file.
$rebaseInProgress = (Test-Path '.git\rebase-merge') -or (Test-Path '.git\rebase-apply')
"stoppedForEdit`:$rebaseInProgress" | Out-File -Encoding ascii -Append $Gates

if ($rebaseInProgress) {
  Log 'stopped-at' @('status', '--short')
  # Take the sanitized version straight from the future commit.
  Log 'checkout-clean' @('checkout', 'd97df47', '--', 'check-defaultdb.cjs')
  Log 'stage-clean'   @('add', 'check-defaultdb.cjs')
  Log 'amend'         @('commit', '--amend', '--no-edit')
  Log 'rebase-continue' @('rebase', '--continue')

  # 4) Verify the result.
  Log 'verify-log'    @('log', '--oneline', '-5')
  Log 'verify-file'   @('show', 'HEAD:check-defaultdb.cjs')
  # Any history version still containing a hard-coded password line?
  $allVersions = (& git log --all -p -- check-defaultdb.cjs 2>&1 | Out-String)
  $leaked = ($allVersions -split "`n" | Select-String -Pattern "password:\s*'[^']" | Out-String)
  ("leakedLines`:" + [string]::IsNullOrEmpty($leaked.Trim())) | Out-File -Encoding ascii -Append $Gates
}

Write-Host "DONE"