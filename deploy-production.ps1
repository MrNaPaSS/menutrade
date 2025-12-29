# Скрипт для деплоя в продакшн
$ErrorActionPreference = "Stop"

Write-Host "🚀 Деплой в продакшн..." -ForegroundColor Cyan

# Переход в директорию проекта
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# Инициализация Git
if (-not (Test-Path .git)) {
    Write-Host "📦 Инициализация Git репозитория..." -ForegroundColor Green
    git init
}

# Настройка remote
Write-Host "🔗 Настройка remote репозитория..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/MrNaPaSS/menutrade.git

# Настройка ветки
Write-Host "🌿 Настройка ветки main..." -ForegroundColor Green
git branch -M main 2>$null

# Добавление файлов
Write-Host "📝 Добавление файлов..." -ForegroundColor Green
git add .

# Коммит
Write-Host "💾 Создание коммита..." -ForegroundColor Green
$hasChanges = git diff --cached --quiet
if (-not $hasChanges) {
    git commit -m "Deploy: Production build with fixes"
} else {
    Write-Host "⚠️  Нет изменений для коммита" -ForegroundColor Yellow
}

# Отправка на GitHub
Write-Host "☁️  Отправка на GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Деплой успешен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
    Write-Host "1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/pages" -ForegroundColor White
    Write-Host "2. Выберите Source: GitHub Actions" -ForegroundColor White
    Write-Host "3. Сайт будет доступен: https://MrNaPaSS.github.io/menutrade/" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при отправке" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Готово!" -ForegroundColor Green

