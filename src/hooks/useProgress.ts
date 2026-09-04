import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendCoinEvent } from '@/lib/coins';
import { fetchProgress, resetProgressOnServer, saveProgress } from '@/lib/progressApi';
import { applyCompleted, lessonKey, sameCompleted, startedCourses, unionCompleted } from '@/lib/progressSync';
import { loadLocalCompleted, saveLocalCompleted } from '@/lib/localProgress';
import { courses } from '@/data/courses';
import { Module } from '@/types/lesson';
import { useTelegramContext } from '@/contexts/TelegramContext';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { registerUser } from '@/utils/userStats';

// Модули стратегий лежат в файле курса по бинаркам, но частью обучения
// не являются - у них свой раздел
const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

const getStorageKey = (userId: string | null, suffix = 'progress') =>
  `pepe-trader-${suffix}-${userId || 'anonymous'}`;

const getMasterTestKey = (userId: string | null) => getStorageKey(userId, 'master-test');

/**
 * Прогресс обучения.
 *
 * Единственное, что действительно хранится, - список закрытых уроков.
 * Модули с блокировками из него выводятся: так одно и то же состояние
 * не лежит в двух местах и не расходится.
 *
 * Источник правды - сервер бота, локальная копия работает кэшем.
 * Курсы отдаются только те, что открыты этому человеку: доступ решает
 * бот по подтверждённым счетам на площадках.
 */
export function useProgress() {
  const { userId } = useTelegramContext();
  const { courses: access, loading: accessLoading, offline } = useCourseAccess();

  const storageKey = getStorageKey(userId);
  const masterTestKey = getMasterTestKey(userId);

  const [completed, setCompleted] = useState<string[]>(() => loadLocalCompleted(storageKey));
  const [masterTestPassed, setMasterTestPassed] = useState(
    () => localStorage.getItem(masterTestKey) === 'true'
  );
  const syncedRef = useRef<string[] | null>(null);

  // Уроки открытых курсов.
  //
  // Если бот не ответил, к ответу добавляются курсы, в которых у
  // человека уже есть пройденные уроки. Выдать этим ничего нельзя -
  // только вернуть то, что он и так проходил, - зато перезапуск бота
  // или секунда без сети не обнуляют ему счётчики и не прячут курс.
  // Ровно то же правило бот применяет у себя.
  const openIds = useMemo(() => {
    const ids = new Set(
      courses.filter(course => access[course.id] === 'open').map(course => course.id as string)
    );
    if (offline) {
      startedCourses(completed).forEach(id => ids.add(id));
    }
    return ids;
  }, [access, offline, completed]);

  const openModules = useMemo(
    () => courses
      .filter(course => openIds.has(course.id))
      .flatMap(course => course.modules.filter(m => !STRATEGY_MODULES.has(m.id))),
    [openIds]
  );

  const modules: Module[] = useMemo(
    () => applyCompleted(openModules, completed),
    [openModules, completed]
  );

  // Прогресс с сервера: браузер чистят и телефоны меняют, учёба остаётся
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchProgress().then(remote => {
      if (cancelled || !remote) return;
      syncedRef.current = remote.completed;
      setCompleted(prev => unionCompleted(prev, remote.completed));
      if (remote.master_test) {
        setMasterTestPassed(true);
        localStorage.setItem(masterTestKey, 'true');
      }
    });

    return () => { cancelled = true; };
  }, [userId, masterTestKey]);

  // Сохранение: локально всегда, на сервер - только новое
  useEffect(() => {
    if (!userId) return;

    saveLocalCompleted(getStorageKey(userId), completed);

    if (!syncedRef.current || !sameCompleted(syncedRef.current, completed)) {
      syncedRef.current = completed;
      saveProgress({ completed, master_test: masterTestPassed });
    }
  }, [completed, masterTestPassed, userId]);

  useEffect(() => {
    if (userId) registerUser(userId);
  }, [userId]);

  const completeLesson = useCallback((moduleId: string, lessonId: string) => {
    setCompleted(prev => {
      const key = lessonKey(moduleId, lessonId);
      if (prev.includes(key)) return prev;

      // Монеты отправляем здесь: это единственное место, где урок
      // действительно засчитывается
      sendCoinEvent(`lesson_${moduleId}_${lessonId}`, 'lesson_watched');

      const next = unionCompleted(prev, [key]);

      const module = openModules.find(m => m.id === moduleId);
      if (module && module.lessons.every(l => next.includes(lessonKey(moduleId, l.id)))) {
        sendCoinEvent(`module_${moduleId}`, 'module_completed');
      }

      return next;
    });
  }, [openModules]);

  const completeModule = useCallback((moduleId: string) => {
    const module = openModules.find(m => m.id === moduleId);
    if (!module) return;
    setCompleted(prev => unionCompleted(prev, module.lessons.map(l => lessonKey(moduleId, l.id))));
  }, [openModules]);

  const getProgress = useCallback(() => {
    const total = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (total === 0) return 0;
    const done = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.isCompleted).length, 0);
    return Math.round((done / total) * 100);
  }, [modules]);

  /** Курсы, открытые этому человеку - в порядке реестра. */
  const openCourses = useMemo(
    () => courses.filter(course => access[course.id] === 'open'),
    [access]
  );

  /** Сколько уроков закрыто в каждом курсе - для выбора курса. */
  const completedByCourse = useMemo(() => {
    const done = new Set(completed);
    return Object.fromEntries(
      courses.map(course => [
        course.id,
        course.modules
          .filter(m => !STRATEGY_MODULES.has(m.id))
          .reduce((sum, m) => sum + m.lessons.filter(l => done.has(lessonKey(m.id, l.id))).length, 0),
      ])
    );
  }, [completed]);

  const resetProgress = useCallback(() => {
    setCompleted([]);
    setMasterTestPassed(false);
    // Сброс - единственный способ обнулить прогресс на сервере:
    // обычная запись его только дополняет
    syncedRef.current = [];
    resetProgressOnServer();
    // Осознанный сброс - единственное место, где пустой список
    // разрешено записать поверх накопленного
    saveLocalCompleted(storageKey, [], true);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(masterTestKey);
    if (userId) localStorage.removeItem(`pepe-trader-stats-${userId}`);
  }, [storageKey, masterTestKey, userId]);

  const completeMasterTest = useCallback(() => {
    setMasterTestPassed(true);
    localStorage.setItem(masterTestKey, 'true');
    sendCoinEvent('master_test', 'test_passed');
  }, [masterTestKey]);

  return {
    modules,
    accessLoading,
    openCourses,
    completedByCourse,
    completeLesson,
    completeModule,
    getProgress,
    resetProgress,
    isMasterTestCompleted: () => masterTestPassed,
    completeMasterTest,
    isAllModulesCompleted: () => getProgress() === 100,
  };
}
