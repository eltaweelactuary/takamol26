@echo off
echo ========================================
echo    Deploying Takamol26 to GitHub
echo ========================================
cd /d "C:\Users\Ahmed\OneDrive\takamol26"

echo [1/3] Adding changes...
git add .

echo [2/3] Committing changes...
git commit -m "Final Premium Version with Wow Effects"
git branch -M main

echo [3/3] Setting remote and Pushing...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/eltaweelactuary/takamol26.git
git push -u origin main

echo.
echo ========================================
echo    SUCCESS! Takamol26 is now LIVE!
echo ========================================
pause
