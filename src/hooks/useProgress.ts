import { useState, useEffect } from 'react';
import { modules as allModules } from '@/data/lessons';
import { Module, Lesson } from '@/types/lesson';
import { useTelegramContext } from '@/contexts/TelegramContext';
import { registerUser } from '@/utils/userStats';

// Исключаем модули стратегий (3, 4, 5) из основного обучения
const initialModules = allModules.filter(m => 
  m.id !== 'module-3' && m.id !== 'module-4' && m.id !== 'module-5'
);

// Функция для получения ключа хранилища с привязкой к пользователю
const getStorageKey = (userId: string | null, suffix: string = 'progress') => {
  if (userId) {
    return `pepe-trader-${suffix}-${userId}`;
  }
  // Fallback для случаев без авторизации (только для разработки)
  return `pepe-trader-${suffix}-anonymous`;
};

const getMasterTestKey = (userId: string | null) => {
  return getStorageKey(userId, 'master-test');
};

export function useProgress() {
  const { userId } = useTelegramContext();
  const storageKey = getStorageKey(userId);
  const masterTestKey = getMasterTestKey(userId);

  const [modules, setModules] = useState<Module[]>(() => {
    const saved = localStorage.getItem(storageKey);
    let loadedModules: Module[];
    
    if (saved) {
      const savedModules = JSON.parse(saved);
      // Фильтруем модули стратегий из сохраненного прогресса
      const filteredSavedModules = savedModules.filter((m: Module) => 
        m.id !== 'module-3' && m.id !== 'module-4' && m.id !== 'module-5'
      );
      // Объединяем сохраненный прогресс с актуальным контентом из initialModules
      loadedModules = filteredSavedModules.map((savedModule: Module) => {
        const initialModule = initialModules.find(m => m.id === savedModule.id);
        if (!initialModule) return null;
        
        return {
          ...savedModule,
          lessons: savedModule.lessons.map((savedLesson: Lesson, lessonIndex: number) => {
            const initialLesson = initialModule.lessons.find(l => l.id === savedLesson.id);
            if (!initialLesson) return savedLesson;
            
            // Нормальная логика блокировки: первый урок открыт, остальные открываются после завершения предыдущего
            let isLocked = lessonIndex > 0;
            if (lessonIndex > 0) {
              const previousLesson = savedModule.lessons[lessonIndex - 1];
              isLocked = !previousLesson.isCompleted;
            }
            
            // Сохраняем прогресс, но используем актуальный контент и правильный isLocked
            return {
              ...savedLesson,
              content: initialLesson.content,
              quiz: initialLesson.quiz,
              isLocked,
            };
          })
        };
      }).filter((module): module is Module => module !== null);
      
      // Добавляем новые модули, которых нет в сохраненном прогрессе
      const savedModuleIds = new Set(loadedModules.map(m => m.id));
      const newModules = initialModules
        .filter(m => !savedModuleIds.has(m.id))
        .map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson, index) => ({ 
            ...lesson, 
            isLocked: index > 0,
            isCompleted: false 
          }))
        }));
      
      loadedModules = [...loadedModules, ...newModules];
    } else {
      // Нормальная логика: первый урок каждого модуля открыт, остальные заблокированы
      loadedModules = initialModules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson, index) => ({ 
          ...lesson, 
          isLocked: index > 0,
          isCompleted: false
        }))
      }));
    }
    
    return loadedModules;
  });

  // Сохраняем прогресс при изменении
  useEffect(() => {
    if (userId) {
      const currentStorageKey = getStorageKey(userId);
      localStorage.setItem(currentStorageKey, JSON.stringify(modules));
      
      // Сохраняем метаданные пользователя для статистики
      // Вычисляем прогресс напрямую из modules, без вызова функции getProgress
      const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const completedLessons = modules.reduce(
        (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length,
        0
      );
      const progressValue = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const userStats = {
        userId,
        lastActivity: new Date().toISOString(),
        progress: progressValue,
        completedLessons,
        totalLessons
      };
      localStorage.setItem(`pepe-trader-stats-${userId}`, JSON.stringify(userStats));
    }
  }, [modules, userId]); // Убрали storageKey из зависимостей, так как он вычисляется из userId

  const completeLesson = (moduleId: string, lessonId: string) => {
    setModules(prevModules => {
      const newModules = prevModules.map(module => {
        if (module.id !== moduleId) return module;

        const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
        const updatedLessons = module.lessons.map((lesson, index) => {
          if (lesson.id === lessonId) {
            return { ...lesson, isCompleted: true, isLocked: false };
          }
          // Нормальная логика: следующий урок открывается после завершения текущего
          if (index === lessonIndex + 1 && lesson.isLocked) {
            return { ...lesson, isLocked: false };
          }
          return lesson;
        });

        return { ...module, lessons: updatedLessons };
      });

      return newModules;
    });
  };

  const getProgress = () => {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length,
      0
    );
    const progress = Math.round((completedLessons / totalLessons) * 100);
    return progress;
  };

  const resetProgress = () => {
    // Нормальная логика: при сбросе только первый урок каждого модуля открыт
    const resetModules = initialModules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson, index) => ({ 
        ...lesson, 
        isLocked: index > 0,
        isCompleted: false
      }))
    }));
    setModules(resetModules);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(masterTestKey);
    if (userId) {
      localStorage.removeItem(`pepe-trader-stats-${userId}`);
    }
  };

  const isMasterTestCompleted = () => {
    return localStorage.getItem(masterTestKey) === 'true';
  };

  const completeMasterTest = () => {
    localStorage.setItem(masterTestKey, 'true');
  };

  const isAllModulesCompleted = () => {
    return getProgress() === 100;
  };

  const completeModule = (moduleId: string) => {
    setModules(prevModules => {
      const newModules = prevModules.map(module => {
        if (module.id !== moduleId) return module;
        
        // Помечаем все уроки модуля как завершенные
        const updatedLessons = module.lessons.map(lesson => ({
          ...lesson,
          isCompleted: true,
          isLocked: false
        }));
        
        return { ...module, lessons: updatedLessons, isCompleted: true };
      });

      // Нормальная логика: разблокируем первый урок следующего модуля, если текущий завершен
      return newModules.map((module, moduleIndex) => {
        // Если это не первый модуль, проверяем, завершен ли предыдущий
        if (moduleIndex > 0) {
          const previousModule = newModules[moduleIndex - 1];
          if (previousModule.isCompleted && module.lessons.length > 0) {
            // Разблокируем первый урок следующего модуля
            const updatedLessons = module.lessons.map((lesson, lessonIndex) => {
              if (lessonIndex === 0) {
                return { ...lesson, isLocked: false };
              }
              // Остальные уроки открываются после завершения предыдущего
              const previousLesson = module.lessons[lessonIndex - 1];
              return { ...lesson, isLocked: !previousLesson.isCompleted };
            });
            return { ...module, lessons: updatedLessons };
          }
        }
        // Для остальных модулей применяем нормальную логику блокировки
        const updatedLessons = module.lessons.map((lesson, lessonIndex) => {
          if (lessonIndex === 0) {
            return { ...lesson, isLocked: false };
          }
          const previousLesson = module.lessons[lessonIndex - 1];
          return { ...lesson, isLocked: !previousLesson.isCompleted };
        });
        return { ...module, lessons: updatedLessons };
      });
    });
  };

  // Регистрируем пользователя при первом использовании
  useEffect(() => {
    if (userId) {
      registerUser(userId);
    }
  }, [userId]);

  return {
    modules,
    completeLesson,
    completeModule,
    getProgress,
    resetProgress,
    isMasterTestCompleted,
    completeMasterTest,
    isAllModulesCompleted
  };
}
