import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ProgressRingProps {
    percent: number;
    size?: number;
    stroke?: number;
    children?: React.ReactNode;
}

/**
 * Кольцо прогресса.
 *
 * Рисуется один раз при появлении экрана - это единственное движение,
 * которое главная позволяет себе сама, без действия человека. Остальное
 * отвечает на нажатие.
 *
 * При «уменьшить движение» кольцо просто сразу стоит на своём месте.
 */
export const ProgressRing = memo(function ProgressRing({
    percent,
    size = 96,
    stroke = 6,
    children,
}: ProgressRingProps) {
    const reduced = useReducedMotion();
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = Math.min(Math.max(percent, 0), 100) / 100;

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-primary/15"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className="stroke-primary"
                    style={{ filter: 'drop-shadow(0 0 6px hsl(142 76% 52% / 0.5))' }}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: reduced ? circumference * (1 - filled) : circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - filled) }}
                    transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
});
