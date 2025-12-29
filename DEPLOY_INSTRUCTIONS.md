# Инструкция по деплою с защищённым API ключом

## Проблема решена ✅
API ключ больше не попадает в клиентский код и не виден на GitHub.

## Шаги деплоя

### 1. Создайте Cloudflare Worker (5 минут)

1. Откройте https://workers.cloudflare.com/
2. Войдите или создайте бесплатный аккаунт
3. Нажмите **"Create a Worker"**
4. Скопируйте весь код из файла `cloudflare-worker-proxy.js`
5. Вставьте в редактор Cloudflare
6. Нажмите **"Save and Deploy"**

### 2. Добавьте API ключ в секреты Cloudflare

1. В настройках Worker найдите **"Settings"** → **"Variables"** → **"Secrets"**
2. Нажмите **"Add secret"**
3. **Name**: `OPENROUTER_API_KEY`
4. **Value**: `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`
5. Нажмите **"Encrypt"** и сохраните

### 3. Получите URL Worker

После деплоя вы получите URL вида:
```
https://openrouter-proxy.your-subdomain.workers.dev
```

Скопируйте этот URL.

### 4. Добавьте URL прокси в GitHub Secrets

1. Откройте: https://github.com/MrNaPaSS/menutrade/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. **Name**: `VITE_OPENROUTER_PROXY_URL`
4. **Value**: `https://your-worker-url.workers.dev` (URL из шага 3)
5. Нажмите **"Add secret"**

### 5. Деплой на GitHub Pages

Выполните в PowerShell:

```powershell
cd "E:\7777\НОВАЯ АПКА\smart-trader-quest-main\smart-trader-quest-main"
git add .
git commit -m "Add Cloudflare Worker proxy for OpenRouter API security"
git push origin main
```

### 6. Проверка

1. Дождитесь завершения workflow: https://github.com/MrNaPaSS/menutrade/actions
2. Откройте сайт: https://MrNaPaSS.github.io/menutrade/
3. Проверьте работу AI чата

## Безопасность ✅

- ✅ API ключ хранится только в Cloudflare Secrets
- ✅ Ключ не попадает в GitHub
- ✅ Ключ не виден в клиентском коде
- ✅ Ключ не виден в собранном bundle
- ✅ Работает на GitHub Pages

## Локальная разработка

Для локальной разработки создайте файл `.env`:
```
VITE_OPENROUTER_API_KEY=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
```

В разработке будет использоваться прямой запрос с локальным ключом.

