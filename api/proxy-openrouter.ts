// Vercel Edge Function для проксирования запросов к OpenRouter
// Ключ хранится только на сервере, не попадает в клиентский код

export const config = {
  runtime: 'edge',
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || '';

export default async function handler(req: Request) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Проверяем наличие API ключа
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
    // Получаем тело запроса от клиента
    const body = await req.json();

    // Проксируем запрос к OpenRouter
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.get('origin') || '',
        'X-Title': 'NO MONEY - NO HONEY',
      },
      body: JSON.stringify(body),
    });

    // Получаем ответ от OpenRouter
    const data = await response.json();

    // Возвращаем ответ клиенту
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
      JSON.stringify({ error: 'Internal server error', message: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

