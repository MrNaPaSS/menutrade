import { useState, useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { OnboardingSurvey, getSurveyData } from './OnboardingSurvey';
import { TelegramAuthScreen } from './TelegramAuthScreen';
import { useTelegramContext } from '@/contexts/TelegramContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
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
      // Если не в Telegram или пользователь не авторизован - не показываем приложение
      if (!isTelegram || !user) {
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

  // Показываем экран авторизации, если не авторизован
  if (isReady && (!isTelegram || !user)) {
    return <TelegramAuthScreen />;
  }

  // Показываем загрузочный экран
  if (isLoading || !isReady) {
    return <LoadingScreen message="Инициализация приложения..." />;
  }

  // Показываем опрос для новых пользователей (только если авторизован)
  if (showSurvey && isTelegram && user) {
    return <OnboardingSurvey onComplete={handleSurveyComplete} />;
  }

  // Показываем основное приложение (только если авторизован)
  if (isInitialized && isTelegram && user) {
    return <>{children}</>;
  }

  // Fallback - показываем загрузку
  return <LoadingScreen message="Загрузка..." />;
}

