@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   СОЗДАНИЕ ФАЙЛА .env
echo ========================================
echo.
echo ВНИМАНИЕ: API ключ OpenRouter должен быть получен на https://openrouter.ai/
echo.
set /p API_KEY="Введите ваш OpenRouter API ключ: "
if "%API_KEY%"=="" (
    echo Ошибка: API ключ не введен
    pause
    exit /b 1
)
echo VITE_OPENROUTER_API_KEY=%API_KEY% > .env
echo.
echo ========================================
echo Файл .env создан в корне проекта
echo ========================================
echo.
echo Текущая директория:
cd
echo.
echo ========================================
echo Теперь запустите RUN-SERVER.bat
echo ========================================
pause

