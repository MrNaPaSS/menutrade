# 🚀 Быстрый деплой в продакшн

## Автоматическая инициализация

**Windows PowerShell:**
```powershell
.\deploy-init.ps1
```

**Windows CMD:**
```cmd
deploy-init.bat
```

## Ручная инициализация (3 команды)

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/MrNaPaSS/menutrade.git
git branch -M main && git push -u origin main
```

## Настройка GitHub Pages

1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/pages
2. **Source**: выберите `GitHub Actions`
3. Сохраните

## Результат

✅ Сайт будет доступен: **https://MrNaPaSS.github.io/menutrade/**

✅ Автоматический деплой при каждом `git push` в `main`

## Проверка статуса

- **Actions**: https://github.com/MrNaPaSS/menutrade/actions
- **Pages**: https://github.com/MrNaPaSS/menutrade/settings/pages

---

📖 Полная инструкция: [DEPLOY.md](./DEPLOY.md)

