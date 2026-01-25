@echo off
title Install Dependencies
echo.
echo ==========================================
echo   Smart Trader Bot - Auto Installer
echo ==========================================
echo.
echo Step 1: Checking Node.js...
node -v
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is NOT working!
    echo Please install Node.js manually from https://nodejs.org/
    echo.
    pause
    exit
) else (
    echo [OK] Node.js is installed.
)

echo.
echo Step 2: Checking package.json...
if not exist "package.json" (
    echo.
    echo [ERROR] package.json NOT FOUND!
    echo Make sure you copied ALL files from the TGBOT folder to your Desktop.
    echo specifically: package.json
    echo.
    pause
    exit
) else (
    echo [OK] package.json found.
)

echo.
echo Step 3: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo Check your internet connection or try running 'npm install' manually.
    pause
    exit
)

echo.
echo ==========================================
echo   SUCCESS! Dependencies installed.
echo   You can now start the bot using run_bot.bat
echo ==========================================
pause
