# Быстрая настройка прокси для OpenRouter API

## Проблема
API ключ не должен попадать в клиентский код на GitHub Pages.

## Решение: Cloudflare Worker (5 минут)

### Шаг 1: Создайте Worker
1. Откройте https://workers.cloudflare.com/
2. Войдите/зарегистрируйтесь
3. **"Create a Worker"**
4. Скопируйте код из `cloudflare-worker-proxy.js`
5. Вставьте в редактор
6. **"Deploy"**

### Шаг 2: Добавьте секрет
1. В Worker: **Settings** → **Variables** → **Secrets**
2. **"Add secret"**
3. **Name**: `OPENROUTER_API_KEY`
4. **Value**: `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`
5. Сохраните

### Шаг 3: Получите URL
После деплоя получите URL вида:
```
https://openrouter-proxy.your-subdomain.workers.dev
```

### Шаг 4: Обновите код
В `.github/workflows/deploy.yml` добавьте в секцию Build:

```yaml
env:
  VITE_PUBLIC_PATH: /menutrade/
  VITE_OPENROUTER_PROXY_URL: https://your-worker-url.workers.dev
```

Или создайте файл `.env.production` (НЕ коммитьте его!):
```
VITE_OPENROUTER_PROXY_URL=https://your-worker-url.workers.dev
```

Но лучше через GitHub Secrets:
1. https://github.com/MrNaPaSS/menutrade/settings/secrets/actions
2. **New repository secret**
3. **Name**: `VITE_OPENROUTER_PROXY_URL`
4. **Value**: `https://your-worker-url.workers.dev`
5. В workflow используйте: `VITE_OPENROUTER_PROXY_URL: ${{ secrets.VITE_OPENROUTER_PROXY_URL }}`

## Результат
✅ Ключ только в Cloudflare Secrets
✅ Ключ не в GitHub
✅ Ключ не в клиентском коде
✅ Работает на GitHub Pages

