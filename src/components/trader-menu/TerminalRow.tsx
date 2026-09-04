import { memo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RowTone = 'green' | 'cyan' | 'amber' | 'violet' | 'muted';

const TONES: Record<RowTone, { chip: string; icon: string }> = {
    green: { chip: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 13%))', icon: 'hsl(142 76% 62%)' },
    cyan: { chip: 'linear-gradient(160deg, hsl(178 50% 20%), hsl(178 45% 12%))', icon: 'hsl(178 70% 62%)' },
    amber: { chip: 'linear-gradient(160deg, hsl(38 55% 21%), hsl(38 50% 13%))', icon: 'hsl(40 85% 65%)' },
    violet: { chip: 'linear-gradient(160deg, hsl(265 42% 23%), hsl(265 38% 14%))', icon: 'hsl(265 75% 74%)' },
    muted: { chip: 'hsl(142 20% 12%)', icon: 'hsl(142 15% 42%)' },
};

interface TerminalRowProps {
    /** Значок из набора либо эмодзи курса */
    icon: ReactNode;
    tone: RowTone;
    title: string;
    /** Подпись под названием: что внутри или что нужно сделать */
    caption: string;
    /** Значение справа: «46%», «23». Длинному тексту здесь не место -
        он съедает ширину заголовка */
    value?: string;
    /** Метка рядом с названием: «Бесплатно», «По приглашению» */
    badge?: { text: string; tone: 'green' | 'amber' | 'sky' };
    /** Значение зелёное, когда оно про прогресс или про доступное сейчас */
    valueLive?: boolean;
    /** Полоса прогресса под строкой, 0-100. Не передан - полосы нет */
    progress?: number;
    locked?: boolean;
    onClick?: () => void;
    index: number;
}

const TITLE_COLOR = 'hsl(150 25% 94%)';
const CAPTION_COLOR = 'hsl(142 16% 50%)';

/**
 * Строка приборной панели.
 *
 * Плотная: значок, название, подпись, значение справа. Плитки в сетке
 * оставляли половину площади пустой - здесь на том же месте помещается
 * вчетверо больше сведений, и экран перестаёт выглядеть незаполненным.
 *
 * Названия набраны обычным Inter, а не фирменным Orbitron: широкий
 * рубленый шрифт на кегле 14 читается как надпись из игры. Orbitron
 * остаётся заголовку экрана, цифры уходят в моноширинный.
 */
export const TerminalRow = memo(function TerminalRow({
    icon,
    tone,
    title,
    caption,
    value,
    valueLive = false,
    badge,
    progress,
    locked = false,
    onClick,
    index,
}: TerminalRowProps) {
    const reduced = useReducedMotion();
    const palette = TONES[locked ? 'muted' : tone];

    return (
        <motion.button
            onClick={onClick}
            disabled={!onClick}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + index * 0.04, duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            whileTap={onClick ? { scale: 0.99 } : undefined}
            className={cn(
                'group w-full text-left px-3.5 py-3 transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
                onClick ? 'hover:bg-white/[0.035] active:bg-white/[0.06]' : 'cursor-default'
            )}
        >
            <div className="flex items-center gap-3">
                <span
                    className={cn(
                        'w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0',
                        'border border-white/[0.07] text-base',
                        locked && 'grayscale opacity-45'
                    )}
                    style={{
                        background: palette.chip,
                        color: palette.icon,
                        boxShadow: locked ? undefined : 'inset 0 1px 0 hsl(0 0% 100% / 0.1)',
                    }}
                >
                    {icon}
                </span>

                <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span
                            className="font-semibold text-[14.5px] tracking-[-0.01em] truncate"
                            style={{ color: locked ? CAPTION_COLOR : TITLE_COLOR }}
                        >
                            {title}
                        </span>
                        {badge && (
                            <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap',
                                badge.tone === 'green' && 'bg-primary/10 text-primary border-primary/25',
                                badge.tone === 'amber' && 'bg-amber-500/10 text-amber-400 border-amber-500/25',
                                badge.tone === 'sky' && 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                            )}>
                                {badge.text}
                            </span>
                        )}
                    </span>
                    <span
                        className="block text-[11.5px] mt-0.5 truncate tabular-nums"
                        style={{ color: CAPTION_COLOR }}
                    >
                        {caption}
                    </span>
                </span>

                {locked ? (
                    <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(142 15% 36%)' }} />
                ) : (
                    <span className="flex items-center gap-1.5 flex-shrink-0">
                        {value && (
                            <span
                                className="font-mono font-bold text-[13.5px] tabular-nums"
                                style={{ color: valueLive ? 'hsl(142 76% 58%)' : CAPTION_COLOR }}
                            >
                                {value}
                            </span>
                        )}
                        {onClick && (
                            <ChevronRight
                                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                style={{ color: 'hsl(142 20% 42%)' }}
                            />
                        )}
                    </span>
                )}
            </div>

            {typeof progress === 'number' && !locked && (
                <div
                    className="h-[3px] rounded-full overflow-hidden mt-2.5 ml-12"
                    style={{ background: 'hsl(142 28% 15%)' }}
                >
                    <motion.div
                        className="h-full rounded-full bg-primary origin-left"
                        style={{ boxShadow: '0 0 8px hsl(142 76% 52% / 0.55)' }}
                        initial={{ scaleX: reduced ? progress / 100 : 0 }}
                        animate={{ scaleX: progress / 100 }}
                        transition={{
                            delay: 0.18 + index * 0.04,
                            duration: reduced ? 0 : 0.6,
                            ease: [0.23, 1, 0.32, 1],
                        }}
                    />
                </div>
            )}
        </motion.button>
    );
});
