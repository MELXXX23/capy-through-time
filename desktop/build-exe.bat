@echo off
chcp 65001 >nul
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0"
echo.
echo  === Збирання .exe (кілька хвилин, не закривай вікно) ===
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
if not exist node_modules (
  echo  Спершу запусти install.bat (кроку 1 ще не було).
  pause
  exit /b
)
call npm run dist
echo.
echo  Готово! Відкриваю папку dist з готовими .exe
if exist dist start dist
pause
