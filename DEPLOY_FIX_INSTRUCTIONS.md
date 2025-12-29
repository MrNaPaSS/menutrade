# Инструкция по финализации деплоя 🚀

Чтобы всё заработало (Заставка + AI Чат + Перезагрузка страниц), выполни эти 3 шага.

## 1. Исправление "Падения" сайта при перезагрузке (404 Error)
Render не знает, что у нас одностраничное приложение (SPA), и пытается искать файлы по ссылкам. Нужно научить его всегда отдавать `index.html`.

1. Зайди в [Render Dashboard](https://dashboard.render.com).
2. Выбери проект **TradeAcademy**.
3. В меню слева нажми **Redirects/Rewrites**.
4. Нажми кнопку **Add Rule**.
5. Заполни поля **ТОЧНО** так:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
6. Нажми **Save Changes**.

## 2. Исправление AI Чата (Ошибка "User not found")
Мы обновили код прокси, чтобы заголовки (Referer) передавались правильно. Это нужно обновить и на Cloudflare.

1. Зайди в [Cloudflare Workers](https://workers.cloudflare.com).
2. Выбери своего воркера (`long-rice-ed1`).
3. Нажми **Edit Code** (синяя кнопка справа вверху).
4. **Удали весь старый код** и вставь этот (он обновлён для работы с Telegram):

```javascript
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Title, HTTP-Referer',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const API_KEY = env.OPENROUTER_API_KEY;
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Worker: API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const body = await request.json();

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tradeacademy.onrender.com',
          'X-Title': 'Trade Academy Mini App',
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Worker Error', message: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
```
5. Нажми **Deploy** (справа вверху).

## 3. Исправление заставки "NO MONEY - NO HONEY"
Мы переименовали файл в `ultra_trader_logo.gif` и запушили изменения.

1. Если Render не начал сборку сам, зайди в **Deployments** на Render.
2. Нажми **Manual Deploy** -> **Clear build cache & deploy**.
3. **ВАЖНО:** Подожди пока статус сменится с "In Progress" на "Live" (зелёный). Это занимает 2-3 минуты.
4. После этого очисти кэш в Telegram (Настройки -> Данные и память -> Использование памяти -> Очистить кэш) или просто переустанови приложение, если не получается.

---
**Если после этого всё равно показывает старую картинку — значит Render всё ещё собирает проект. Подожди пару минут.**
