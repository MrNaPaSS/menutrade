@echo off
chcp 65001 >nul
echo 🚀 Инициализация Git репозитория для деплоя...
echo.

REM Проверка наличия Git
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git не установлен. Установите Git и повторите попытку.
    pause
    exit /b 1
)

REM Проверка, не инициализирован ли уже репозиторий
if exist .git (
    echo ⚠️  Git репозиторий уже инициализирован.
    set /p continue="Продолжить? (y/n): "
    if /i not "%continue%"=="y" exit /b 0
) else (
    echo 📦 Инициализация Git репозитория...
    git init
)

REM Добавление remote репозитория
echo 🔗 Настройка remote репозитория...
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Remote 'origin' уже настроен
    set /p change="Изменить на https://github.com/MrNaPaSS/menutrade.git? (y/n): "
    if /i "%change%"=="y" (
        git remote set-url origin https://github.com/MrNaPaSS/menutrade.git
    )
) else (
    git remote add origin https://github.com/MrNaPaSS/menutrade.git
)

REM Переименование ветки в main
echo 🌿 Настройка ветки main...
git branch --show-current >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git branch -M main
) else (
    for /f "tokens=*" %%i in ('git branch --show-current') do set currentBranch=%%i
    if not "%currentBranch%"=="main" (
        git branch -M main
    )
)

REM Добавление всех файлов
echo 📝 Добавление файлов...
git add .

REM Проверка наличия коммитов
git rev-parse --verify HEAD >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 💾 Создание первого коммита...
    git commit -m "Initial commit: Smart Trader Quest production deployment"
) else (
    echo 💾 Создание коммита для деплоя...
    git commit -m "Deploy: Production build configuration"
)

REM Отправка на GitHub
echo ☁️  Отправка кода на GitHub...
echo ⚠️  Если репозиторий на GitHub не пустой, используйте:
echo    git pull origin main --allow-unrelated-histories
echo    git push -u origin main
echo.
set /p push="Отправить код на GitHub сейчас? (y/n): "
if /i "%push%"=="y" (
    git push -u origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Код успешно отправлен на GitHub!
        echo.
        echo 📋 Следующие шаги:
        echo 1. Перейдите на https://github.com/MrNaPaSS/menutrade/settings/pages
        echo 2. В разделе 'Source' выберите 'GitHub Actions'
        echo 3. Дождитесь завершения workflow (Actions tab)
        echo 4. Сайт будет доступен по адресу: https://MrNaPaSS.github.io/menutrade/
    ) else (
        echo ❌ Ошибка при отправке кода. Проверьте настройки репозитория.
    )
) else (
    echo.
    echo 📋 Для ручной отправки выполните:
    echo    git push -u origin main
)

echo.
echo ✨ Готово!
pause

