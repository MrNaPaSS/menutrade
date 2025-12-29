// Тестовый скрипт для проверки OpenRouter API
const fs = require('fs');
const path = require('path');

// Чтение API ключа из .env файла
const envPath = path.join(__dirname, '.env');
let API_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_OPENROUTER_API_KEY=(.+)/);
  if (match) {
    API_KEY = match[1].trim();
  }
}

if (!API_KEY) {
  console.error('❌ Ошибка: API ключ не найден в файле .env');
  console.error('Создайте файл .env с содержимым: VITE_OPENROUTER_API_KEY=ваш_ключ');
  process.exit(1);
}

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testAPI() {
  console.log('🧪 Тестирование OpenRouter API...\n');
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  console.log('URL:', API_URL);
  console.log('\nОтправка тестового запроса...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:8080',
        'X-Title': 'PEPE TRADER Test'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Привет! Ответь одним словом: работает?'
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    console.log('Статус ответа:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Ошибка API:');
      console.error(JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    console.log('✅ Успешный ответ!');
    console.log('\nОтвет AI:', data.choices[0].message.content);
    console.log('\nПолный ответ:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Ошибка при запросе:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

testAPI();
