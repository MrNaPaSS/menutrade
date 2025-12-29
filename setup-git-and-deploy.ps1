# Скрипт для настройки Git и деплоя

Write-Host "Настройка Git..." -ForegroundColor Cyan

# Настройка Git (замените на свои данные)
git config user.name "MrNaPaSS"
git config user.email "MrNaPaSS@users.noreply.github.com"

Write-Host "Git настроен" -ForegroundColor Green

Write-Host "Создание коммита..." -ForegroundColor Cyan
git commit -m "Deploy: Production build with fixes"

Write-Host "Отправка на GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Деплой успешен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Cyan
    Write-Host "1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/pages" -ForegroundColor White
    Write-Host "2. Выберите Source: GitHub Actions" -ForegroundColor White
    Write-Host "3. Сайт будет доступен: https://MrNaPaSS.github.io/menutrade/" -ForegroundColor White
} else {
    Write-Host "Ошибка при отправке" -ForegroundColor Red
}

