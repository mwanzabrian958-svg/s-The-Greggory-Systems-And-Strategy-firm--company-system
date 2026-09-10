Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sprint 4 - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""

Write-Host "[2/6] Running tests..." -ForegroundColor Yellow
npm test
Write-Host ""

Write-Host "[3/6] Checking lint..." -ForegroundColor Yellow
npm run lint
Write-Host ""

Write-Host "[4/6] Formatting code..." -ForegroundColor Yellow
npm run format
Write-Host ""

Write-Host "[5/6] Activating Husky..." -ForegroundColor Yellow
npx husky install
Write-Host ""

Write-Host "[6/6] Done! Review output above for any errors." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
