import { useEffect, useState } from 'react';
import { Hand } from 'lucide-react';

interface GestureHintProps {
  onDismiss?: () => void;
}

// Полупрозрачная подсказка-палец: показывает, что карточку нужно листать (скролл).
// Появляется на ~2 секунды при открытии карточки с прокручиваемым контентом.
export function GestureHint({ onDismiss }: GestureHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => {
    const appear = setTimeout(() => setIsVisible(true), 200);
    const swipe = setInterval(() => setUp(prev => !prev), 750);
    const fade = setTimeout(() => setIsFading(true), 2100);
    const hide = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 2600);

    return () => {
      clearTimeout(appear);
      clearInterval(swipe);
      clearTimeout(fade);
      clearTimeout(hide);
    };
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* мягкое свечение */}
          <div className="absolute inset-0 bg-primary/25 rounded-full blur-2xl scale-150" />
          {/* полупрозрачный палец, двигается вверх/вниз = свайп */}
          <div
            className={`relative w-16 h-16 rounded-full bg-primary/30 backdrop-blur-md border border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-transform duration-700 ease-in-out ${
              up ? '-translate-y-8' : 'translate-y-8'
            }`}
          >
            <Hand className="w-8 h-8 text-primary/90 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg px-4 py-2 rounded-xl border border-primary/40">
          <p className="text-xs sm:text-sm font-medium text-primary neon-text-subtle">
            Листайте для чтения
          </p>
        </div>
      </div>
    </div>
  );
}
