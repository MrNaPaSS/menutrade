import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Число, которое досчитывает до значения при появлении.
 *
 * Нужно ровно там, где цифра - главное на экране: она успевает
 * привлечь взгляд, пока человек ещё смотрит на верх страницы. Считаем
 * по времени, а не по кадрам, чтобы на слабом телефоне длительность
 * оставалась той же.
 */
export function useCountUp(target: number, duration = 700): number {
    const reduced = useReducedMotion();
    const [value, setValue] = useState(reduced ? target : 0);
    const frame = useRef<number>();

    useEffect(() => {
        if (reduced || target === 0) {
            setValue(target);
            return;
        }

        const start = performance.now();
        const from = 0;

        const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // Замедление к концу: резкая остановка на числе выглядит поломкой
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(from + (target - from) * eased));
            if (progress < 1) frame.current = requestAnimationFrame(step);
        };

        frame.current = requestAnimationFrame(step);
        return () => {
            if (frame.current) cancelAnimationFrame(frame.current);
        };
    }, [target, duration, reduced]);

    return value;
}
