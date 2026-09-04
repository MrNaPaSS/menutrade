import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TileTone = 'green' | 'cyan' | 'amber' | 'violet';

interface ToolTileProps {
    title: string;
    /** Что внутри, цифрами: «51 книга», «3 попытки сегодня» */
    figure: string;
    icon: LucideIcon;
    tone: TileTone;
    onClick: () => void;
    index: number;
    /** Подсветить: внутри есть что-то, что ждёт человека прямо сейчас */
    live?: boolean;
}

/**
 * Оттенки значков.
 *
 * Четыре серых значка в ряд читаются как один незаполненный блок.
 * Свой тон делает из каждого раздела отдельный предмет - при этом
 * насыщенность низкая, иначе экран превращается в детскую площадку.
 */
const TONES: Record<TileTone, { chip: string; glow: string; icon: string }> = {
    green: {
        chip: 'linear-gradient(160deg, hsl(142 60% 22%), hsl(142 55% 14%))',
        glow: 'hsl(142 76% 52% / 0.18)',
        icon: 'hsl(142 76% 62%)',
    },
    cyan: {
        chip: 'linear-gradient(160deg, hsl(178 55% 22%), hsl(178 50% 13%))',
        glow: 'hsl(178 70% 50% / 0.16)',
        icon: 'hsl(178 70% 62%)',
    },
    amber: {
        chip: 'linear-gradient(160deg, hsl(38 60% 24%), hsl(38 55% 14%))',
        glow: 'hsl(38 85% 55% / 0.16)',
        icon: 'hsl(40 85% 65%)',
    },
    violet: {
        chip: 'linear-gradient(160deg, hsl(265 45% 26%), hsl(265 40% 15%))',
        glow: 'hsl(265 70% 62% / 0.16)',
        icon: 'hsl(265 75% 74%)',
    },
};

/**
 * Плитка инструмента.
 *
 * Поверхность собрана как предмет, а не как рамка: наклонная подложка
 * от светлого верха к тёмному низу, волосяная светлая линия по кромке,
 * тень под карточкой и мягкое пятно за значком. Заголовок почти белый -
 * в теме всё остальное зеленоватое, и без этого контраста плитки
 * сливаются с фоном.
 */
export const ToolTile = memo(function ToolTile({
    title,
    figure,
    icon: Icon,
    tone,
    onClick,
    index,
    live = false,
}: ToolTileProps) {
    const reduced = useReducedMotion();
    const palette = TONES[tone];

    return (
        <motion.button
            onClick={onClick}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.045, duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            whileTap={{ scale: 0.97 }}
            style={{
                background: 'linear-gradient(162deg, hsl(142 20% 12%) 0%, hsl(140 26% 7%) 62%)',
                boxShadow: '0 10px 28px -16px hsl(0 0% 0% / 0.9), inset 0 1px 0 hsl(142 40% 40% / 0.14)',
            }}
            className={cn(
                'group relative overflow-hidden rounded-[20px] p-4 text-left min-h-[142px]',
                'flex flex-col justify-between border border-[hsl(142_28%_17%)]',
                'transition-[border-color] duration-200 hover:border-[hsl(142_40%_26%)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
        >
            {/* Пятно света за значком - оно даёт плитке объём */}
            <span
                aria-hidden="true"
                className="absolute -top-10 -left-8 w-32 h-32 rounded-full blur-2xl"
                style={{ background: palette.glow }}
            />

            <span className="relative flex items-start justify-between">
                <span
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center
                               border border-white/[0.08]"
                    style={{
                        background: palette.chip,
                        boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.12)',
                    }}
                >
                    <Icon className="w-5 h-5" style={{ color: palette.icon }} strokeWidth={2} />
                </span>

                {/* Точка о том, что раздел ждёт прямо сейчас */}
                {live && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary
                                     shadow-[0_0_8px_hsl(142_76%_52%)]" />
                )}
            </span>

            <span className="relative">
                <span
                    className="block font-display font-bold text-[15px] leading-tight tracking-tight"
                    style={{ color: 'hsl(150 25% 93%)' }}
                >
                    {title}
                </span>
                <span
                    className="block text-[12px] mt-1 tabular-nums"
                    style={{ color: 'hsl(142 18% 55%)' }}
                >
                    {figure}
                </span>
            </span>
        </motion.button>
    );
});
