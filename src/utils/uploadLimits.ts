// Утилита для отслеживания лимитов загрузки фото

const STORAGE_KEY = 'photo-uploads-daily';
const MAX_PHOTOS_PER_DAY = 3;
const ADMIN_ID = import.meta.env.VITE_ADMIN_ID || 'admin'; // ID админа из переменных окружения

interface DailyUploads {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * Получить текущую дату в формате YYYY-MM-DD
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Проверить, является ли пользователь админом
 */
export function isAdmin(): boolean {
  // Проверка через localStorage или переменную окружения
  const adminFlag = localStorage.getItem('isAdmin');
  return adminFlag === 'true' || import.meta.env.VITE_ADMIN_MODE === 'true';
}

/**
 * Установить режим админа
 * Для активации: вызовите setAdminMode(true) в консоли браузера
 */
export function setAdminMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem('isAdmin', 'true');
  } else {
    localStorage.removeItem('isAdmin');
  }
}

/**
 * Получить количество загруженных фото сегодня
 */
export function getTodayPhotoCount(): number {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 0;

  try {
    const uploads: DailyUploads = JSON.parse(data);
    const today = getTodayDate();
    
    // Если данные за сегодня, возвращаем count
    if (uploads.date === today) {
      return uploads.count;
    }
    
    // Если данные за другой день, сбрасываем
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Увеличить счетчик загруженных фото на сегодня
 */
export function incrementPhotoCount(): void {
  const today = getTodayDate();
  const currentCount = getTodayPhotoCount();
  
  const uploads: DailyUploads = {
    date: today,
    count: currentCount + 1
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
}

/**
 * Проверить, можно ли загрузить еще фото
 */
export function canUploadPhoto(): boolean {
  // Админ может загружать без ограничений
  if (isAdmin()) {
    return true;
  }
  
  // Обычные пользователи ограничены лимитом
  return getTodayPhotoCount() < MAX_PHOTOS_PER_DAY;
}

/**
 * Получить оставшееся количество фото на сегодня
 */
export function getRemainingPhotos(): number {
  if (isAdmin()) {
    return Infinity; // Админ без ограничений
  }
  
  return Math.max(0, MAX_PHOTOS_PER_DAY - getTodayPhotoCount());
}

/**
 * Получить сообщение об ошибке при превышении лимита
 */
export function getLimitErrorMessage(): string {
  const remaining = getRemainingPhotos();
  const today = getTodayDate();
  
  if (remaining === 0) {
    return `Достигнут дневной лимит загрузки фото (${MAX_PHOTOS_PER_DAY} фото в день). Попробуйте завтра (${new Date(Date.now() + 86400000).toLocaleDateString('ru-RU')}).`;
  }
  
  return `Осталось загрузок фото на сегодня: ${remaining} из ${MAX_PHOTOS_PER_DAY}`;
}

