// Cloudflare Worker для проксирования запросов к OpenRouter (УЛУЧШЕННАЯ ВЕРСИЯ)
// Деплой: https://workers.cloudflare.com/

export default {
  async fetch(request, env) {
    // Обработка CORS preflight
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

      // Проксируем запрос к OpenRouter с фиксированными заголовками
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tradeacademy.onrender.com', // Фиксируем реферер
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