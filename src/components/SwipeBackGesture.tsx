import { useEffect, useRef } from 'react';
import { useBackNavigation } from '@/contexts/BackNavigationContext';

/** Ширина полосы у левого края, с которой начинается жест. */
const EDGE = 28;

/** Дальше этого жест считается выполненным даже без броска. */
const COMMIT_DISTANCE = 80;

/** Бросок: точек в миллисекунду. Быстрое короткое движение тоже засчитываем. */
const COMMIT_VELOCITY = 0.11;

/** До этого расстояния не решаем, жест это или прокрутка. */
const DIRECTION_LOCK = 12;

function haptic(): void {
    const tg = (window as {
        Telegram?: { WebApp?: { HapticFeedback?: { impactOccurred?: (s: string) => void } } };
    }).Telegram?.WebApp;
    try {
        tg?.HapticFeedback?.impactOccurred?.('light');
    } catch {
        /* вне Telegram отклика нет, это не повод падать */
    }
}

/**
 * Возврат назад свайпом от левого края.
 *
 * Один слушатель на всё приложение вместо своего на каждом экране:
 * раньше на уроке их было три сразу, и какой сработает, зависело от
 * порядка монтирования. Куда вести, решает стопка обработчиков, а не
 * сам жест.
 *
 * Пока палец идёт, у края растёт стрелка - человек должен видеть, что
 * жест распознан, и успеть передумать, вернув палец назад. Засчитываем
 * либо по расстоянию, либо по скорости: короткий бросок от края - тоже
 * намерение уйти.
 */
export function SwipeBackGesture() {
    const { run } = useBackNavigation();
    const hintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const start = { x: 0, y: 0, time: 0 };
        let tracking = false;
        let locked: 'none' | 'horizontal' | 'vertical' = 'none';

        const paint = (progress: number) => {
            const el = hintRef.current;
            if (!el) return;
            const clamped = Math.min(Math.max(progress, 0), 1);
            // Пишем стиль напрямую: состояние React на каждый кадр пальца
            // перерисовывало бы всё приложение
            el.style.opacity = String(clamped);
            el.style.transform = `translate3d(${-24 + clamped * 40}px, -50%, 0) scale(${0.8 + clamped * 0.2})`;
        };

        const reset = () => {
            tracking = false;
            locked = 'none';
            const el = hintRef.current;
            if (el) {
                el.style.transition = 'opacity 160ms cubic-bezier(0.23, 1, 0.32, 1)';
                el.style.opacity = '0';
                window.setTimeout(() => {
                    if (el) el.style.transition = '';
                }, 180);
            }
        };

        const onStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch || touch.clientX > EDGE) return;
            start.x = touch.clientX;
            start.y = touch.clientY;
            start.time = Date.now();
            tracking = true;
            locked = 'none';
            const el = hintRef.current;
            if (el) el.style.transition = '';
        };

        const onMove = (e: TouchEvent) => {
            if (!tracking) return;
            const touch = e.touches[0];
            if (!touch) return;

            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;

            if (locked === 'none') {
                if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return;
                // Вертикальное движение от края - это прокрутка, не жест
                locked = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
                if (locked === 'vertical') {
                    reset();
                    return;
                }
            }

            if (dx <= 0) {
                paint(0);
                return;
            }

            // Гасим прокрутку по горизонтали, пока ведём жест
            if (e.cancelable) e.preventDefault();
            paint(dx / COMMIT_DISTANCE);
        };

        const onEnd = (e: TouchEvent) => {
            if (!tracking) return;
            const touch = e.changedTouches[0];
            const dx = touch ? touch.clientX - start.x : 0;
            const dy = touch ? Math.abs(touch.clientY - start.y) : 0;
            const elapsed = Math.max(Date.now() - start.time, 1);
            const velocity = dx / elapsed;

            const horizontal = dy < Math.abs(dx);
            const committed = horizontal && locked === 'horizontal' &&
                (dx > COMMIT_DISTANCE || (dx > 30 && velocity > COMMIT_VELOCITY));

            reset();

            if (committed) {
                haptic();
                run();
            }
        };

        document.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd, { passive: true });
        document.addEventListener('touchcancel', reset, { passive: true });

        return () => {
            document.removeEventListener('touchstart', onStart);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', reset);
        };
    }, [run]);

    return (
        <div
            ref={hintRef}
            aria-hidden="true"
            style={{ opacity: 0, transform: 'translate3d(-24px, -50%, 0) scale(0.8)' }}
            className="fixed left-0 top-1/2 z-[95] pointer-events-none
                       w-11 h-11 rounded-full flex items-center justify-center
                       bg-background/90 backdrop-blur-sm border border-primary/40
                       shadow-[0_0_16px_-4px_hsl(142_76%_52%_/_0.6)]"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}
