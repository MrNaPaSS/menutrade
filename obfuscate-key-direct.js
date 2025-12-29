// Прямая обфускация ключа без интерактивного ввода
const key = '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';

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

const obfuscated = obfuscateKey(key);

console.log('========================================');
console.log('  ОБФУСКИРОВАННЫЙ КЛЮЧ');
console.log('========================================');
console.log('');
console.log('Оригинальный ключ:');
console.log(key);
console.log('');
console.log('Обфусцированный ключ:');
console.log(obfuscated);
console.log('');
console.log('========================================');
console.log('Используйте в .env файле:');
console.log(`VITE_OPENROUTER_API_KEY=${obfuscated}`);
console.log('========================================');

