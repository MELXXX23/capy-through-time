@echo off
chcp 65001 >nul
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0"
echo.
echo  === КРОК 1: встановлення (потрібен інтернет, кілька хвилин) ===
echo.
where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo  !!! Node.js ще не встановлений. Зараз відкриється сторінка nodejs.org:
  echo      натисни зелену кнопку LTS, встанови, потім ЗАКРИЙ це вікно і запусти цей файл знову.
  start https://nodejs.org
  pause
  exit /b
)
call npm install
echo.
echo  Готово! Тепер запускай start-game.bat
pause
