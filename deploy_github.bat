@echo off
echo Running Git Commands for Takamol26...
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/eltaweelactuary/takamol26.git
git push -u origin main
echo Done!
pause
