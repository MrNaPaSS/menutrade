@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   DEPLOY TO GITHUB PAGES
echo ========================================
echo.

REM Инициализация Git
if not exist .git (
    echo [1/5] Инициализация Git репозитория...
    git init
) else (
    echo [1/5] Git репозиторий уже инициализирован
)

REM Настройка remote
echo [2/5] Настройка remote репозитория...
git remote remove origin 2>nul
git remote add origin https://github.com/MrNaPaSS/menutrade.git

REM Настройка ветки
echo [3/5] Настройка ветки main...
git branch -M main 2>nul

REM Добавление файлов
echo [4/5] Добавление файлов...
git add .

REM Коммит
echo [5/5] Создание коммита...
git commit -m "Deploy: Production build" 2>nul
if %ERRORLEVEL% NEQ 0 (
    git commit -m "Deploy: Production build"
)

echo.
echo ========================================
echo   ГОТОВО К ОТПРАВКЕ
echo ========================================
echo.
echo Выполните команду:
echo   git push -u origin main
echo.
echo После push:
echo 1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/pages
echo 2. Выберите Source: GitHub Actions
echo 3. Сайт: https://MrNaPaSS.github.io/menutrade/
echo.
pause

