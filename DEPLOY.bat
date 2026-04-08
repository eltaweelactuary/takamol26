@echo off
echo ========================================
echo    Deploying Takamol26 to GitHub
echo ========================================
cd /d "C:\Users\Ahmed\OneDrive\takamol26"

git add .
git commit -m "update: Takamol26 premium platform"
git branch -M main

echo.
echo If this is the first time, enter your GitHub repo URL below.
echo If not, just press Enter to skip:
set /p REPO_URL="GitHub URL (or Enter to skip): "
if not "%REPO_URL%"=="" (
    git remote remove origin >nul 2>&1
    git remote add origin %REPO_URL%
)

echo.
echo Pushing to GitHub... (a login window may appear)
git push -u origin main

echo.
echo ========================================
echo    DONE! Takamol26 deployed!
echo ========================================
pause
