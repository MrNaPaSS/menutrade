# Скрипт для инициализации Git репозитория и первого деплоя

Write-Host "🚀 Инициализация Git репозитория для деплоя..." -ForegroundColor Cyan

# Проверка наличия Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен. Установите Git и повторите попытку." -ForegroundColor Red
    exit 1
}

# Проверка, не инициализирован ли уже репозиторий
if (Test-Path .git) {
    Write-Host "⚠️  Git репозиторий уже инициализирован." -ForegroundColor Yellow
    $continue = Read-Host "Продолжить? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
} else {
    Write-Host "📦 Инициализация Git репозитория..." -ForegroundColor Green
    git init
}

# Добавление remote репозитория
Write-Host "🔗 Настройка remote репозитория..." -ForegroundColor Green
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' уже настроен: $remoteExists" -ForegroundColor Yellow
    $change = Read-Host "Изменить на https://github.com/MrNaPaSS/menutrade.git? (y/n)"
    if ($change -eq "y") {
        git remote set-url origin https://github.com/MrNaPaSS/menutrade.git
    }
} else {
    git remote add origin https://github.com/MrNaPaSS/menutrade.git
}

# Переименование ветки в main (если нужно)
Write-Host "🌿 Настройка ветки main..." -ForegroundColor Green
$currentBranch = git branch --show-current 2>$null
if (-not $currentBranch) {
    git branch -M main
} elseif ($currentBranch -ne "main") {
    git branch -M main
}

# Добавление всех файлов
Write-Host "📝 Добавление файлов..." -ForegroundColor Green
git add .

# Проверка наличия коммитов
$hasCommits = git rev-parse --verify HEAD 2>$null
if (-not $hasCommits) {
    Write-Host "💾 Создание первого коммита..." -ForegroundColor Green
    git commit -m "Initial commit: Smart Trader Quest production deployment"
} else {
    Write-Host "💾 Создание коммита для деплоя..." -ForegroundColor Green
    git commit -m "Deploy: Production build configuration"
}

# Отправка на GitHub
Write-Host "☁️  Отправка кода на GitHub..." -ForegroundColor Green
Write-Host "⚠️  Если репозиторий на GitHub не пустой, используйте:" -ForegroundColor Yellow
Write-Host "   git pull origin main --allow-unrelated-histories" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""

$push = Read-Host "Отправить код на GitHub сейчас? (y/n)"
if ($push -eq "y") {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Код успешно отправлен на GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
        Write-Host "1. Перейдите на https://github.com/MrNaPaSS/menutrade/settings/pages" -ForegroundColor White
        Write-Host "2. В разделе 'Source' выберите 'GitHub Actions'" -ForegroundColor White
        Write-Host "3. Дождитесь завершения workflow (Actions tab)" -ForegroundColor White
        Write-Host "4. Сайт будет доступен по адресу: https://MrNaPaSS.github.io/menutrade/" -ForegroundColor White
    } else {
        Write-Host "❌ Ошибка при отправке кода. Проверьте настройки репозитория." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "📋 Для ручной отправки выполните:" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Готово!" -ForegroundColor Green

