import { useMemo } from 'react';
import { useProgress } from './useProgress';
import { useLocation } from 'react-router-dom';
import type { Module, Lesson } from '@/types/lesson';

export interface TradingContext {
  currentModule?: {
    id: string;
    title: string;
  };
  currentLesson?: {
    id: string;
    title: string;
  };
  progress?: number;
}

export function useTradingContext(): TradingContext {
  const { modules, getProgress } = useProgress();
  const location = useLocation();

  const context = useMemo(() => {
    const progress = getProgress();
    
    // Пытаемся определить текущий модуль и урок из URL или состояния
    // Это можно расширить, если в будущем будут отдельные страницы для уроков
    let currentModule: Module | undefined;
    let currentLesson: Lesson | undefined;

    // Если пользователь на главной странице, берем первый незавершенный модуль
    if (location.pathname === '/') {
      currentModule = modules.find(m => !m.isCompleted);
      if (currentModule) {
        currentLesson = currentModule.lessons.find(l => !l.isCompleted && !l.isLocked);
      }
    }

    return {
      currentModule: currentModule ? {
        id: currentModule.id,
        title: currentModule.title
      } : undefined,
      currentLesson: currentLesson ? {
        id: currentLesson.id,
        title: currentLesson.title
      } : undefined,
      progress
    };
  }, [modules, location, getProgress]);

  return context;
}

