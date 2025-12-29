import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GestureHintProps {
  onDismiss?: () => void;
}

export function GestureHint({ onDismiss }: GestureHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');

  useEffect(() => {
    // Появляемся через небольшую задержку
    const appearTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    // Меняем направление анимации (свайп вверх/вниз)
    const interval = setInterval(() => {
      setScrollDirection(prev => prev === 'down' ? 'up' : 'down');
    }, 1500);

    // Начинаем исчезновение через 3.5 секунды
    const fadeTimeout = setTimeout(() => {
      setIsFading(true);
    }, 3500);

    // Полностью скрываем через 4 секунды
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 4000);

    return () => {
      clearTimeout(appearTimeout);
      clearInterval(interval);
      clearTimeout(fadeTimeout);
      clearTimeout(hideTimeout);
    };
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-opacity duration-500 ${
      isFading ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="relative flex flex-col items-center justify-center gap-6">
        {/* Анимированный прозрачный палец */}
        <div className="relative">
          {/* Внешнее свечение */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse scale-150" />
          
          {/* Прозрачный палец (иконка жеста) */}
          <div 
            className={`relative w-20 h-20 rounded-full bg-primary/40 backdrop-blur-md border-2 border-primary/60 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.8)] transition-transform duration-1000 ease-in-out ${
              scrollDirection === 'down' ? 'translate-y-12' : '-translate-y-12'
            }`}
          >
            {scrollDirection === 'down' ? (
              <ChevronDown className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            ) : (
              <ChevronUp className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            )}
          </div>
        </div>

        {/* Текст подсказки */}
        <div className="bg-black/70 backdrop-blur-lg px-5 py-3 rounded-xl border border-primary/40 shadow-xl">
          <p className="text-sm font-medium text-primary neon-text-subtle">
            Листайте для чтения
          </p>
        </div>

        {/* Траектория движения (линия) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 rounded-full opacity-50">
          <div 
            className={`absolute left-0 right-0 bg-primary rounded-full transition-all duration-1000 ease-in-out ${
              scrollDirection === 'down' 
                ? 'top-0 h-1/3 animate-pulse' 
                : 'bottom-0 h-1/3 animate-pulse'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
