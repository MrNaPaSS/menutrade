# Настройка Cloudflare Worker для проксирования OpenRouter API

## Проблема
API ключ OpenRouter не должен попадать в клиентский код (GitHub Pages), так как он виден всем в bundle.

## Решение
Используем Cloudflare Worker как прокси-сервер. Ключ хранится только в секретах Cloudflare.

## Шаги настройки

### 1. Создайте Cloudflare Worker

1. Зайдите на https://workers.cloudflare.com/
2. Войдите в аккаунт (или создайте бесплатный)
3. Нажмите **"Create a Worker"**
4. Скопируйте код из файла `cloudflare-worker-proxy.js`
5. Вставьте в редактор Cloudflare
6. Нажмите **"Save and Deploy"**

### 2. Настройте секрет (API ключ)

1. В настройках Worker найдите раздел **"Settings"** → **"Variables"**
2. Нажмите **"Add variable"**
3. Выберите **"Secret"**
4. **Name**: `OPENROUTER_API_KEY`
5. **Value**: `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`
6. Сохраните

### 3. Получите URL Worker

После деплоя вы получите URL вида:
```
https://your-worker-name.your-subdomain.workers.dev
```

### 4. Обновите код приложения

В файле `src/services/openRouterService.ts` обновите URL:

```typescript
const OPENROUTER_API_URL = import.meta.env.PROD 
  ? 'https://your-worker-name.your-subdomain.workers.dev'  // URL вашего Cloudflare Worker
  : 'https://openrouter.ai/api/v1/chat/completions';
```

### 5. Деплой

После обновления кода:
```bash
git add .
git commit -m "Use Cloudflare Worker proxy for OpenRouter API"
git push origin main
```

## Безопасность

✅ API ключ хранится только в секретах Cloudflare
✅ Ключ не попадает в клиентский код
✅ Ключ не виден в GitHub
✅ Работает на GitHub Pages

## Альтернатива: Netlify/Vercel Functions

Если не хотите использовать Cloudflare, можно использовать:
- **Netlify Functions**: https://docs.netlify.com/functions/overview/
- **Vercel Edge Functions**: https://vercel.com/docs/functions/edge-functions

Но Cloudflare Workers - самый простой и бесплатный вариант.

