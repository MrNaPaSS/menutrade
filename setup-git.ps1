# Скрипт для настройки Git репозитория

Write-Host "Инициализация Git репозитория..." -ForegroundColor Green

# Проверка инициализации git
if (-not (Test-Path .git)) {
    Write-Host "Инициализация нового git репозитория..." -ForegroundColor Yellow
    git init
}

# Добавление remote (удаляем старый если есть)
Write-Host "Настройка remote репозитория..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin git@github.com:MrNaPaSS/menutrade.git

# Показ настроенного remote
Write-Host "`nНастроенный remote:" -ForegroundColor Cyan
git remote -v

# Переключение на main ветку
Write-Host "`nНастройка ветки main..." -ForegroundColor Green
git branch -M main 2>$null

# Добавление всех файлов
Write-Host "`nДобавление файлов..." -ForegroundColor Green
git add .

# Показ статуса
Write-Host "`nСтатус репозитория:" -ForegroundColor Cyan
git status --short | Select-Object -First 30

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Создайте коммит: git commit -m 'Initial commit: Smart Trader Quest'" -ForegroundColor White
Write-Host "2. Отправьте на GitHub: git push -u origin main" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Yellow

