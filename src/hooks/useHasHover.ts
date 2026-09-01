import { useEffect, useState } from 'react';

/**
 * Есть ли у устройства настоящий курсор.
 *
 * На тач-экранах браузер эмулирует ховер при тапе: эффект залипает
 * до следующего касания в другом месте. Поэтому ховер-анимации
 * включаем только там, где мышь реальна.
 */
export function useHasHover(): boolean {
  const [hasHover, setHasHover] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasHover(query.matches);

    const onChange = (e: MediaQueryListEvent) => setHasHover(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return hasHover;
}
