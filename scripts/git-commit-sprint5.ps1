# Git hygiene + commit Sprint 5 work (PS-native calls, output captured as ASCII).
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)
$Logs = Join-Path $PWD 'verify-logs'
$Gates = Join-Path $Logs 'git-gates.txt'
Remove-Item -ErrorAction SilentlyContinue $Gates

function Run-Git([string]$Label, [string[]]$GitArgs) {
  $out = Join-Path $Logs ($Label + '.log')
  $result = (& git @GitArgs 2>&1 | Out-String)
  $result | Out-File -Encoding ascii $out
  "$Label`:$LASTEXITCODE" | Out-File -Encoding ascii -Append $Gates
}

Run-Git 'status-before' @('status', '--short')
Run-Git 'add'           @('add', '-A')
Run-Git 'status-after'  @('status', '--short')
Run-Git 'commit'        @('commit', '-m', 'feat: Sprint 5 - response cache, migration runner, health probe, RBAC tests, swagger deps, auto-updater')
Run-Git 'log'           @('log', '--oneline', '-3')

Write-Host "DONE"