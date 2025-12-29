const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('  СОЗДАНИЕ ФАЙЛА .env');
console.log('========================================');
console.log('');
console.log('ВНИМАНИЕ: API ключ OpenRouter должен быть получен на https://openrouter.ai/');
console.log('');

rl.question('Введите ваш OpenRouter API ключ: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ Ошибка: API ключ не введен');
    rl.close();
    process.exit(1);
  }

  const content = `VITE_OPENROUTER_API_KEY=${apiKey.trim()}\n`;
  fs.writeFileSync(envPath, content, 'utf8');
  
  console.log('');
  console.log('✅ Файл .env создан в корне проекта:');
  console.log(envPath);
  console.log('');
  console.log('========================================');
  console.log('Теперь запустите: npm run dev');
  console.log('========================================');
  
  rl.close();
});

