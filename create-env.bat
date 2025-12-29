@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo VITE_OPENROUTER_API_KEY=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 > .env
echo.
echo ========================================
echo Файл .env создан в корне проекта
echo ========================================
echo.
echo Текущая директория:
cd
echo.
echo Содержимое файла .env:
type .env
echo.
echo ========================================
echo Теперь запустите RUN-SERVER.bat
echo ========================================
pause

