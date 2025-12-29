/**
 * ПРИМЕР серверной валидации данных Telegram Web App
 * 
 * ВАЖНО: Этот файл должен быть на сервере (Node.js/Backend), а не в клиентском коде!
 * Bot token должен храниться только на сервере и никогда не попадать в клиентский код.
 * 
 * Использование:
 * 1. Скопируйте этот код на ваш сервер
 * 2. Установите зависимости: npm install crypto
 * 3. Используйте функцию validateTelegramHash для проверки данных
 */

import * as crypto from 'crypto';

/**
 * Валидирует hash из initData Telegram Web App
 * 
 * @param initData - строка initData из Telegram.WebApp.initData
 * @param botToken - токен бота (должен храниться на сервере!)
 * @returns true если hash валиден
 */
export function validateTelegramHash(initData: string, botToken: string): boolean {
  try {
    // Парсим параметры из initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }
    
    // Удаляем hash из параметров для создания data_check_string
    urlParams.delete('hash');
    
    // Создаем data_check_string: все параметры кроме hash, отсортированные по ключу
    const dataCheckArray: string[] = [];
    urlParams.sort();
    urlParams.forEach((value, key) => {
      dataCheckArray.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArray.join('\n');
    
    // Вычисляем секретный ключ: HMAC_SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычисляем hash: HMAC_SHA256(secret_key, data_check_string)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Сравниваем вычисленный hash с полученным
    return calculatedHash === hash;
  } catch (error) {
    console.error('Ошибка валидации hash:', error);
    return false;
  }
}

/**
 * Полная валидация данных Telegram Web App на сервере
 * 
 * @param initData - строка initData из Telegram.WebApp.initData
 * @param botToken - токен бота
 * @returns объект с результатом валидации
 */
export function validateTelegramDataOnServer(
  initData: string,
  botToken: string
): { isValid: boolean; user?: any; error?: string } {
  // Проверяем hash
  if (!validateTelegramHash(initData, botToken)) {
    return { isValid: false, error: 'Hash не валиден - данные могли быть подделаны' };
  }
  
  // Парсим данные пользователя
  const urlParams = new URLSearchParams(initData);
  const userParam = urlParams.get('user');
  
  if (!userParam) {
    return { isValid: false, error: 'Данные пользователя отсутствуют' };
  }
  
  try {
    const user = JSON.parse(userParam);
    
    // Проверяем время авторизации (не старше 24 часов)
    const authDate = urlParams.get('auth_date');
    if (authDate) {
      const authTimestamp = parseInt(authDate, 10);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeDiff = currentTimestamp - authTimestamp;
      
      if (timeDiff > 86400) { // 24 часа
        return { isValid: false, error: 'Данные авторизации устарели' };
      }
    }
    
    return { isValid: true, user };
  } catch (error) {
    return { isValid: false, error: 'Ошибка парсинга данных пользователя' };
  }
}

/**
 * Пример использования в Express.js endpoint:
 * 
 * app.post('/api/validate-telegram', (req, res) => {
 *   const { initData } = req.body;
 *   const botToken = process.env.TELEGRAM_BOT_TOKEN; // из переменных окружения
 *   
 *   const validation = validateTelegramDataOnServer(initData, botToken);
 *   
 *   if (validation.isValid) {
 *     // Данные валидны, можно доверять user
 *     res.json({ success: true, user: validation.user });
 *   } else {
 *     res.status(401).json({ success: false, error: validation.error });
 *   }
 * });
 */

