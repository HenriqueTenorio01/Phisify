@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias do Phisify...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
echo.
echo Iniciando Phisify PRO em http://localhost:8090
start "" http://localhost:8090
call npm run dev -- --port 8090 --host 127.0.0.1
pause
