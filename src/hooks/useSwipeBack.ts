import { useEffect, useRef } from 'react';

interface UseSwipeBackOptions {
  onSwipeBack: () => void;
  threshold?: number; // Минимальное расстояние свайпа в пикселях
  velocityThreshold?: number; // Минимальная скорость свайпа
  enabled?: boolean; // Включен ли свайп
}

export function useSwipeBack({ 
  onSwipeBack, 
  threshold = 50,
  velocityThreshold = 0.3,
  enabled = true 
}: UseSwipeBackOptions) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const edgeThreshold = 50; // Пиксели от края для активации
      
      // Проверяем, что касание началось с левого края (первые 50px)
      if (startX < edgeThreshold) {
        touchStartRef.current = {
          x: startX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      
      // Предотвращаем стандартное поведение для свайпа слева направо (deltaX положительный)
      if (deltaX > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Проверяем условия для свайпа назад слева направо:
      // 1. Свайп слева направо (deltaX положительный)
      // 2. Достаточное расстояние
      // 3. Преимущественно горизонтальный свайп (deltaY меньше deltaX)
      // 4. Достаточная скорость или расстояние
      if (
        deltaX > threshold && 
        deltaY < Math.abs(deltaX) * 0.5 &&
        (deltaX > threshold * 2 || velocity > velocityThreshold)
      ) {
        onSwipeBack();
      }

      touchStartRef.current = null;
    };

    const element = containerRef.current || document.body;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', () => {
      touchStartRef.current = null;
    }, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', () => {
        touchStartRef.current = null;
      });
    };
  }, [onSwipeBack, threshold, velocityThreshold, enabled]);

  return containerRef;
}

