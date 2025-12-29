// Быстрое получение обфусцированного ключа
const key = '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';

// 1. Base64
const b64 = Buffer.from(key).toString('base64');
// 2. Разделяем и переставляем
const mid = Math.floor(b64.length / 2);
const p1 = b64.slice(0, mid);
const p2 = b64.slice(mid);
// 3. Добавляем мусор
const obf = p2 + 'x7k9m2p' + p1;
// 4. Ещё раз base64
const result = Buffer.from(obf).toString('base64');

console.log('VITE_OPENROUTER_API_KEY=' + result);

