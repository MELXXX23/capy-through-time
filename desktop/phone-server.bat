@echo off
chcp 65001 >nul
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js не знайдено. Встанови його з nodejs.org і спробуй знову.
  pause
  exit /b
)
node serve.js
pause
