# Ручная настройка Cloudflare Worker

## Если не можете вставить код в редактор:

### Вариант 1: Через клавиатуру

1. В редакторе Cloudflare выделите ВСЁ (Ctrl+A)
2. Удалите (Delete)
3. Скопируйте код из файла `CLOUDFLARE_WORKER_CODE.txt`
4. Вставьте (Ctrl+V)

### Вариант 2: Через файл

1. Скачайте файл `cloudflare-worker-proxy.js` из проекта
2. Откройте его в блокноте
3. Скопируйте весь код
4. Вставьте в редактор Cloudflare

### Вариант 3: Пошагово

Замените код в редакторе на этот:

```javascript
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const API_KEY = env.OPENROUTER_API_KEY;
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const body = await request.json();

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': request.headers.get('origin') || '',
          'X-Title': 'NO MONEY - NO HONEY',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error', message: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
```

## После вставки кода:

1. Нажмите "Deploy"
2. Дождитесь деплоя
3. Скопируйте URL Worker
4. Добавьте секрет `OPENROUTER_API_KEY` в Settings → Variables → Secrets

