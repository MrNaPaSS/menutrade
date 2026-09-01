import { useCallback, useState } from 'react';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function storageKey(userId: string | null, feature: string): string {
  return `attempts_${feature}_${userId ?? 'anon'}_${todayKey()}`;
}

function readUsed(userId: string | null, feature: string): number {
  try {
    const raw = localStorage.getItem(storageKey(userId, feature));
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Счётчик попыток на сутки, живёт в localStorage.
 *
 * Читаем синхронно при первом рендере: если тянуть через useEffect,
 * первый кадр покажет доступную попытку, которой уже нет.
 *
 * Ключ включает дату, поэтому новый день начинается с чистого листа,
 * а вчерашние записи просто перестают читаться.
 */
export function useDailyAttempts(userId: string | null, feature: string, limit: number) {
  const [used, setUsed] = useState(() => readUsed(userId, feature));

  const spend = useCallback(() => {
    setUsed(() => {
      const next = readUsed(userId, feature) + 1;
      try {
        localStorage.setItem(storageKey(userId, feature), String(next));
      } catch {
        /* приватный режим - лимит просто не сохранится */
      }
      return next;
    });
  }, [userId, feature]);

  return {
    used,
    left: Math.max(0, limit - used),
    exhausted: used >= limit,
    spend,
  };
}
