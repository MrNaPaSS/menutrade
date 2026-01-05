// Cloudflare Worker для агента (основано на реализации Академии)
// Деплой: https://workers.cloudflare.com/

export default {
    async fetch(request, env) {
        // 1. Обработка CORS (разрешаем запросы с любого домена)
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Title, HTTP-Referer',
                },
            });
        }

        // 2. Разрешаем только POST
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        // 3. Получаем API ключ из переменных окружения Cloudflare
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

            // 4. Проксируем запрос к OpenRouter
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://t.me/moneyhoney7_bot', // Ссылка на бота агента
                    'X-Title': 'AI Agent Assistant',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            // 5. Возвращаем ответ
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
