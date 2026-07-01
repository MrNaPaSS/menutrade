import { useState, useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { TelegramAuthScreen } from './TelegramAuthScreen';
import { useTelegramContext } from '@/contexts/TelegramContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isReady, isTelegram, user } = useTelegramContext();

  useEffect(() => {
    // Имитация загрузки приложения
    const loadApp = async () => {
      // Минимальная задержка для показа загрузочного экрана
      const minLoadTime = 1500;
      const startTime = Date.now();

      // Инициализация Telegram WebApp API происходит в useTelegram hook
      // Здесь только минимальная проверка для совместимости

      // Ждем минимум minLoadTime
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
      }

      setIsLoading(false);
    };

    loadApp();
  }, []);

  // Проверяем авторизацию после загрузки
  useEffect(() => {
    if (!isLoading && isReady) {
      // В режиме разработки проверяем наличие дебаг-пользователя
      const hasDebugUser = import.meta.env.DEV && typeof window !== 'undefined' && !!localStorage.getItem('debug_user');

      // Если не в Telegram или пользователь не авторизован - не показываем приложение
      // ИСКЛЮЧЕНИЕ: в dev режиме с дебаг-пользователем разрешаем доступ
      if ((!isTelegram || !user) && !hasDebugUser) {
        return;
      }

      // Опрос убран: сразу пускаем в приложение (каждый лишний экран режет конверсию)
      setIsInitialized(true);
    }
  }, [isLoading, isReady, isTelegram, user]);

  // В режиме разработки проверяем дебаг-пользователя
  const hasDebugUser = import.meta.env.DEV && typeof window !== 'undefined' && !!localStorage.getItem('debug_user');

  // Показываем экран авторизации, если не авторизован (и нет дебаг-пользователя)
  if (isReady && (!isTelegram || !user) && !hasDebugUser) {
    return <TelegramAuthScreen />;
  }

  // Показываем загрузочный экран
  if (isLoading || !isReady) {
    return <LoadingScreen message="Инициализация приложения..." />;
  }

  // Глобальной стены больше нет: приложение открыто всем из Telegram.
  // Доступ к урокам и стратегиям проверяется на самих страницах
  // (Index.tsx / Strategies.tsx показывают AccessDeniedScreen без депозита).

  // Показываем основное приложение (только если авторизован или есть дебаг-пользователь)
  if (isInitialized && ((isTelegram && user) || hasDebugUser)) {
    return <>{children}</>;
  }

  // Fallback - показываем загрузку
  return <LoadingScreen message="Загрузка..." />;
}
