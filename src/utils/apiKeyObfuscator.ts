// Обфускация API ключа - делает его неочевидным, но функциональным

/**
 * Обфускация ключа - скрывает его структуру
 */
export function obfuscateKey(key: string): string {
  if (!key) return '';
  
  // 1. Кодируем в base64
  const base64 = btoa(key);
  
  // 2. Разделяем на части и переставляем
  const mid = Math.floor(base64.length / 2);
  const part1 = base64.slice(0, mid);
  const part2 = base64.slice(mid);
  
  // 3. Добавляем мусорные символы между частями
  const garbage = 'x7k9m2p';
  const obfuscated = part2 + garbage + part1;
  
  // 4. Ещё раз кодируем в base64
  return btoa(obfuscated);
}

/**
 * Деобфускация ключа - восстанавливает оригинал
 */
export function deobfuscateKey(obfuscated: string): string {
  if (!obfuscated) return '';
  
  try {
    // 1. Декодируем первый base64
    const decoded = atob(obfuscated);
    
    // 2. Убираем мусор
    const garbage = 'x7k9m2p';
    const cleaned = decoded.replace(garbage, '');
    
    // 3. Восстанавливаем порядок частей
    const mid = Math.floor(cleaned.length / 2);
    const part2 = cleaned.slice(0, mid);
    const part1 = cleaned.slice(mid);
    const restored = part1 + part2;
    
    // 4. Декодируем финальный base64
    return atob(restored);
  } catch (error) {
    console.error('Ошибка деобфускации ключа:', error);
    return '';
  }
}

/**
 * Получение ключа из обфусцированного значения
 * Если значение не обфусцировано, возвращает как есть
 */
export function getApiKey(obfuscatedValue: string): string {
  if (!obfuscatedValue) return '';
  
  // Проверяем, обфусцирован ли ключ (начинается с определённого паттерна)
  // Если это обычный ключ OpenRouter (начинается с sk-or-v1), возвращаем как есть
  if (obfuscatedValue.startsWith('sk-or-v1-')) {
    return obfuscatedValue;
  }
  
  // Иначе пытаемся деобфусцировать
  return deobfuscateKey(obfuscatedValue);
}

