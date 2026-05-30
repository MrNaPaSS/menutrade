import { useState, useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { OnboardingSurvey, getSurveyData } from './OnboardingSurvey';
import { TelegramAuthScreen } from './TelegramAuthScreen';
import { RegistrationGate } from './RegistrationGate';
import { useTelegramContext } from '@/contexts/TelegramContext';
import { useUserAccess } from '@/contexts/UserAccessContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isReady, isTelegram, user } = useTelegramContext();
  const { hasFullAccess, isLoading: accessLoading } = useUserAccess();

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

      // Проверяем, прошел ли пользователь опрос
      const surveyData = getSurveyData();

      // Если опрос не пройден, показываем его
      if (!surveyData || !surveyData.completed) {
        setShowSurvey(true);
      } else {
        setIsInitialized(true);
      }
    }
  }, [isLoading, isReady, isTelegram, user]);

  const handleSurveyComplete = () => {
    setShowSurvey(false);
    setIsInitialized(true);
  };

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

  const authorized = (isTelegram && user) || hasDebugUser;

  // Ждём проверку доступа из базы бота, чтобы не мигать гейтом
  if (authorized && accessLoading) {
    return <LoadingScreen message="Проверка доступа..." />;
  }

  // Гейт регистрации: пока нет полного доступа - дальше не пускаем (пропустить нельзя).
  // Показывается при каждом заходе, пока админ не подтвердит доступ в боте.
  if (authorized && !hasFullAccess) {
    return <RegistrationGate />;
  }

  // Показываем опрос для новых пользователей (только если авторизован или есть дебаг-пользователь)
  if (showSurvey && ((isTelegram && user) || hasDebugUser)) {
    return <OnboardingSurvey onComplete={handleSurveyComplete} />;
  }

  // Показываем основное приложение (только если авторизован или есть дебаг-пользователь)
  if (isInitialized && ((isTelegram && user) || hasDebugUser)) {
    return <>{children}</>;
  }

  // Fallback - показываем загрузку
  return <LoadingScreen message="Загрузка..." />;
}
