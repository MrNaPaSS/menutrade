import { useEffect, useState } from 'react';
import { validateTelegramData, isTelegramEnvironment } from '@/utils/telegramValidation';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text: string }> }, callback?: (id: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean) => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Для тестирования: проверяем localStorage
  const getTestUser = (): TelegramUser | null => {
    if (typeof window === 'undefined') return null;
    const testUser = localStorage.getItem('telegram_test_user');
    if (testUser) {
      try {
        return JSON.parse(testUser);
      } catch {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;
    
    const initTelegram = () => {
      // Проверяем наличие Telegram Web App
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Разворачиваем на весь экран
        tg.expand();
        
        // Скрываем стандартную кнопку Back
        tg.BackButton.hide();
        
        // Настройка высоты через viewport
        const setViewportHeight = () => {
          if (tg.viewportHeight) {
            document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
            document.body.style.height = `${tg.viewportHeight}px`;
          }
        };
        
        setViewportHeight();
        
        // Обновляем высоту при изменении viewport
        tg.onEvent('viewportChanged', () => {
          setViewportHeight();
        });
        
        console.log('Telegram WebApp найден:', {
          version: tg.version,
          platform: tg.platform,
          user: tg.initDataUnsafe?.user,
          initData: tg.initData ? 'present' : 'missing'
        });
        
        // Инициализация
        try {
          tg.ready();
          
          // Разворачиваем на весь экран
          tg.expand();
          
          // Скрываем стандартную кнопку Back
          tg.BackButton.hide();
          
          // Настройка высоты через viewport
          const setViewportHeight = () => {
            if (tg.viewportHeight) {
              document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
              document.body.style.height = `${tg.viewportHeight}px`;
            }
          };
          
          setViewportHeight();
          
          // Обновляем высоту при изменении viewport
          tg.onEvent('viewportChanged', () => {
            setViewportHeight();
          });
          
          // Валидация данных Telegram
          const validation = validateTelegramData(tg.initData, tg.initDataUnsafe);
          
          if (!validation.isValid) {
            console.warn('Валидация данных Telegram не прошла:', validation.error);
            // В production блокируем доступ, если валидация не прошла
            if (import.meta.env.PROD) {
              console.error('❌ В production режиме доступ заблокирован из-за ошибки валидации');
              setIsReady(true);
              return;
            }
            // В development продолжаем работу с предупреждением
          } else {
            console.log('✅ Данные Telegram прошли базовую валидацию');
            // ВАЖНО: Для полной безопасности нужно проверить hash на сервере!
          }
          
          setWebApp(tg);
          
          // Получаем данные пользователя только если валидация прошла
          if (validation.isValid && tg.initDataUnsafe?.user) {
            const telegramUser = tg.initDataUnsafe.user;
            console.log('Пользователь Telegram авторизован:', {
              id: telegramUser.id,
              name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`,
              username: telegramUser.username,
              auth_date: tg.initDataUnsafe.auth_date
            });
            setUser(telegramUser);
          } else {
            if (!validation.isValid) {
              console.warn('Пользователь не установлен из-за ошибки валидации');
            } else {
              console.warn('Данные пользователя не найдены в initDataUnsafe');
              console.log('initDataUnsafe:', tg.initDataUnsafe);
            }
          }
          
          // Настройка темы
          if (tg.colorScheme === 'dark') {
            document.documentElement.classList.add('dark');
          }
          
          setIsReady(true);
        } catch (error) {
          console.error('Ошибка инициализации Telegram WebApp:', error);
          setIsReady(true);
        }
      } else {
        // Ждем загрузки скрипта (максимум 3 секунды)
        let attempts = 0;
        const maxAttempts = 30; // 30 попыток по 100мс = 3 секунды
        
        checkInterval = setInterval(() => {
          attempts++;
          
          if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            if (checkInterval) clearInterval(checkInterval);
            initTelegram();
          } else if (attempts >= maxAttempts) {
            if (checkInterval) clearInterval(checkInterval);
            console.log('Telegram WebApp не найден после ожидания');
            
            // Для тестирования в режиме разработки: используем тестового пользователя из localStorage
            // ВАЖНО: В продакшене это не работает, так как проверка isTelegram все равно будет false
            if (import.meta.env.DEV) {
              const testUser = getTestUser();
              if (testUser) {
                console.log('⚠️ РЕЖИМ РАЗРАБОТКИ: Используется тестовый пользователь:', testUser);
                console.warn('⚠️ В продакшене доступ будет заблокирован, так как isTelegram = false');
                setUser(testUser);
              }
            }
            
            setIsReady(true);
          }
        }, 100);
      }
    };

    // Запускаем инициализацию
    initTelegram();
    
    // Cleanup
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  // Проверка на админ-обход (только для development режима)
  const isAdminBypass = () => {
    // В production режиме обход запрещен
    if (import.meta.env.PROD) {
      return false;
    }
    if (typeof window === 'undefined') return false;
    const bypass = localStorage.getItem('admin_bypass');
    if (bypass === '511442168') {
      console.log('⚠️ АДМИН-ОБХОД АКТИВЕН (только для разработки)');
      return true;
    }
    return false;
  };

  const adminBypassActive = isAdminBypass();
  // В production строго требуем Telegram WebApp
  const finalIsTelegram = import.meta.env.PROD ? !!webApp : (!!webApp || adminBypassActive);
  const finalUser = user || (adminBypassActive && !import.meta.env.PROD ? {
    id: 511442168,
    first_name: 'Admin',
    last_name: 'Bypass',
    username: 'admin_bypass'
  } as TelegramUser : null);

  return {
    webApp,
    user: finalUser,
    isReady,
    isTelegram: finalIsTelegram,
    userId: finalUser?.id?.toString() || null,
    isAdmin: finalUser?.id?.toString() === '511442168'
  };
}

