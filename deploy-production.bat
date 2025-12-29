@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   DEPLOY TO PRODUCTION
echo ========================================
echo.

echo [1/5] Инициализация Git репозитория...
if not exist .git (
    git init
)

echo [2/5] Настройка remote репозитория...
git remote remove origin 2>nul
git remote add origin https://github.com/MrNaPaSS/menutrade.git

echo [3/5] Настройка ветки main...
git branch -M main 2>nul

echo [4/5] Добавление файлов...
git add .

echo [5/5] Создание коммита...
git commit -m "Deploy: Production build with fixes" 2>nul
if %ERRORLEVEL% NEQ 0 (
    git commit -m "Deploy: Production build with fixes"
)

echo.
echo ========================================
echo   ОТПРАВКА НА GITHUB
echo ========================================
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ДЕПЛОЙ УСПЕШЕН
    echo ========================================
    echo.
    echo Следующие шаги:
    echo 1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/pages
    echo 2. Выберите Source: GitHub Actions
    echo 3. Сайт будет доступен: https://MrNaPaSS.github.io/menutrade/
    echo.
) else (
    echo.
    echo ========================================
    echo   ОШИБКА ПРИ ОТПРАВКЕ
    echo ========================================
    echo.
    echo Проверьте настройки репозитория и повторите попытку.
    echo.
)

pause

