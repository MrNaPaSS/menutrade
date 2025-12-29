// Скрипт для обфускации API ключа
// Использование: node scripts/obfuscate-key.js "ваш-ключ"

const readline = require('readline');

function obfuscateKey(key) {
  if (!key) return '';
  
  // 1. Кодируем в base64
  const base64 = Buffer.from(key).toString('base64');
  
  // 2. Разделяем на части и переставляем
  const mid = Math.floor(base64.length / 2);
  const part1 = base64.slice(0, mid);
  const part2 = base64.slice(mid);
  
  // 3. Добавляем мусорные символы между частями
  const garbage = 'x7k9m2p';
  const obfuscated = part2 + garbage + part1;
  
  // 4. Ещё раз кодируем в base64
  return Buffer.from(obfuscated).toString('base64');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('  ОБФУСКАЦИЯ API КЛЮЧА OPENROUTER');
console.log('========================================');
console.log('');

rl.question('Введите ваш API ключ OpenRouter: ', (key) => {
  if (!key || key.trim() === '') {
    console.error('❌ Ошибка: ключ не введен');
    rl.close();
    process.exit(1);
  }

  const obfuscated = obfuscateKey(key.trim());
  
  console.log('');
  console.log('✅ Обфусцированный ключ:');
  console.log(obfuscated);
  console.log('');
  console.log('========================================');
  console.log('Используйте это значение в .env файле:');
  console.log(`VITE_OPENROUTER_API_KEY=${obfuscated}`);
  console.log('========================================');
  console.log('');
  console.log('⚠️  ВАЖНО: Этот ключ не похож на API ключ,');
  console.log('   но будет работать после деобфускации.');
  console.log('');
  
  rl.close();
});

