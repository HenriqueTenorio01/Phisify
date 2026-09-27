@echo off
setlocal
cd /d "%~dp0"
if not exist package.json (
  echo ERRO: package.json nao foi encontrado.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando as dependencias do Phisify. Isso pode levar alguns minutos...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)
echo Iniciando o Phisify...
start "Phisify - servidor" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 4 /nobreak >nul
start "" "http://localhost:8080/"
endlocal
