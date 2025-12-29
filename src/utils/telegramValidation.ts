/**
 * Утилиты для валидации данных Telegram Web App
 * Согласно документации: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */

export interface InitDataParams {
  query_id?: string;
  user?: string;
  receiver?: string;
  chat?: string;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: string;
  auth_date: string;
  hash: string;
}

/**
 * Парсит initData строку в объект параметров
 */
export function parseInitData(initData: string): InitDataParams | null {
  try {
    const params: InitDataParams = {
      auth_date: '',
      hash: ''
    };

    const pairs = initData.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        const decodedValue = decodeURIComponent(value);
        if (key === 'auth_date' || key === 'hash') {
          params[key] = decodedValue;
        } else {
          (params as any)[key] = decodedValue;
        }
      }
    }

    return params;
  } catch (error) {
    console.error('Ошибка парсинга initData:', error);
    return null;
  }
}

/**
 * Проверяет, не истекло ли время авторизации (24 часа)
 */
export function isAuthDateValid(authDate: string | number): boolean {
  try {
    const authTimestamp = typeof authDate === 'string' ? parseInt(authDate, 10) : authDate;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDiff = currentTimestamp - authTimestamp;
    
    // Данные действительны в течение 24 часов (86400 секунд)
    const MAX_AGE = 86400;
    
    if (timeDiff < 0) {
      console.warn('auth_date в будущем, возможно проблема с системным временем');
      return false;
    }
    
    if (timeDiff > MAX_AGE) {
      console.warn(`Данные авторизации устарели: ${Math.floor(timeDiff / 3600)} часов назад`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка проверки auth_date:', error);
    return false;
  }
}

/**
 * Базовая клиентская валидация данных Telegram Web App
 * ВАЖНО: Полная валидация с проверкой hash должна выполняться на сервере!
 * 
 * @param initData - строка initData из Telegram.WebApp.initData
 * @param initDataUnsafe - объект initDataUnsafe из Telegram.WebApp.initDataUnsafe
 * @returns true если данные прошли базовую проверку
 */
export function validateTelegramData(
  initData: string | undefined,
  initDataUnsafe: any
): { isValid: boolean; error?: string } {
  // Если нет initData, это может быть тестовый режим
  if (!initData) {
    console.warn('initData отсутствует - возможно приложение запущено вне Telegram');
    return { isValid: false, error: 'initData отсутствует' };
  }

  // Парсим initData
  const params = parseInitData(initData);
  if (!params) {
    return { isValid: false, error: 'Не удалось распарсить initData' };
  }

  // Проверяем наличие обязательных полей
  if (!params.hash) {
    return { isValid: false, error: 'hash отсутствует в initData' };
  }

  if (!params.auth_date) {
    return { isValid: false, error: 'auth_date отсутствует в initData' };
  }

  // Проверяем время авторизации
  if (!isAuthDateValid(params.auth_date)) {
    return { isValid: false, error: 'Данные авторизации устарели (более 24 часов)' };
  }

  // Проверяем наличие данных пользователя
  if (!initDataUnsafe?.user) {
    console.warn('Данные пользователя отсутствуют в initDataUnsafe');
    // Это не критично, но стоит отметить
  }

  // ВАЖНО: Проверка hash должна выполняться на сервере!
  // Для этого нужно:
  // 1. Получить секретный ключ из bot token: HMAC_SHA256(bot_token, "WebAppData")
  // 2. Вычислить hash: HMAC_SHA256(secret_key, data_check_string)
  // 3. Сравнить с hash из initData
  // 
  // Пример серверной валидации (Node.js):
  // const crypto = require('crypto');
  // const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  // const dataCheckString = // все параметры кроме hash, отсортированные по ключу
  // const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  // const isValid = calculatedHash === params.hash;

  return { isValid: true };
}

/**
 * Создает data_check_string для серверной валидации
 * Используется на сервере для проверки hash
 */
export function createDataCheckString(params: InitDataParams): string {
  const { hash, ...rest } = params;
  const sortedKeys = Object.keys(rest).sort();
  return sortedKeys
    .map(key => `${key}=${(rest as any)[key]}`)
    .join('\n');
}

/**
 * Проверяет, запущено ли приложение в Telegram
 */
export function isTelegramEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         typeof (window as any).Telegram !== 'undefined' && 
         typeof (window as any).Telegram.WebApp !== 'undefined';
}

