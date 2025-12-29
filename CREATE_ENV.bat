@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo VITE_OPENROUTER_API_KEY=RTFNekV3TkRJME16STFaVEF4TVdFNE5qSTVObUprTVdRNE9USXlORGc1TW1FMVpRPT14N2s5bTJwYzJzdGIzSXRkakV0TURVM1pXVXdOREZqWVdGbVlUaGhNVFZrWWpnM1pHSTBNR0kzTW0= > .env

echo.
echo ========================================
echo   ФАЙЛ .env СОЗДАН
echo ========================================
echo.
echo Содержимое файла .env:
type .env
echo.
echo ========================================
echo Теперь перезапустите dev сервер:
echo   npm run dev
echo ========================================
echo.
pause

