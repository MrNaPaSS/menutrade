@echo off
chcp 65001 >nul
echo Starting dev server...
cd /d "%~dp0"
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Starting Vite dev server on http://localhost:8080
call npm run dev

