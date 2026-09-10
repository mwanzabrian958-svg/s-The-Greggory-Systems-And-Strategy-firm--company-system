@echo off
echo ========================================
echo Sprint 4 - Setup Script
echo ========================================
echo.

echo [1/6] Installing dependencies...
npm install
echo.

echo [2/6] Running tests...
npm test
echo.

echo [3/6] Checking lint...
npm run lint
echo.

echo [4/6] Formatting code...
npm run format
echo.

echo [5/6] Activating Husky...
npx husky install
echo.

echo [6/6] Done! Review output above for any errors.
echo.
pause
