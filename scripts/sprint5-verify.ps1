# Sprint 5 verification: install new deps, format, test, lint, build.
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

function Run-Step([string]$Label, [string]$Cmd, [string]$LogName) {
  $out = Join-Path $PWD ("verify-logs\" + $LogName)
  cmd /c "$Cmd > `"$out`" 2>&1"
  $code = $LASTEXITCODE
  "$Label`:$code" | Out-File -Encoding ascii -Append (Join-Path $PWD 'verify-logs\sprint5-gates.txt')
}

Remove-Item -ErrorAction SilentlyContinue (Join-Path $PWD 'verify-logs\sprint5-gates.txt')

Run-Step 'install'   'npm install swagger-jsdoc swagger-ui-express electron-updater electron-log --save' 's5.install.log'
Run-Step 'format'    'npm run format'                                         's5.format.log'
Run-Step 'test'      'npm test -- --reporter=dot'                             's5.test.log'
Run-Step 'lint'      'npm run lint'                                           's5.lint.log'
Run-Step 'build'     'npm run build'                                          's5.build.log'

Write-Host "DONE"