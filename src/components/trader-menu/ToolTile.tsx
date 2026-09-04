import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolTileProps {
    title: string;
    /** Живая цифра: «23 разбора», «3 попытки сегодня» */
    figure: string;
    icon: LucideIcon;
    onClick: () => void;
    index: number;
    /** Выделяем плитку, когда в ней есть что-то срочное или ценное */
    accent?: boolean;
}

/**
 * Плитка инструмента.
 *
 * Плоская строка со стрелкой честно вела куда надо, но выглядела
 * списком ссылок. Здесь у каждого раздела своя площадь, свет за
 * значком и цифра о том, что внутри: не «библиотека», а «51 книга».
 *
 * Материал собран из трёх слоёв - подложка, светлая линия по верхней
 * кромке и мягкое пятно за значком. Это то, что отличает «карточку с
 * рамкой» от предмета, у которого есть толщина.
 */
export const ToolTile = memo(function ToolTile({
    title,
    figure,
    icon: Icon,
    onClick,
    index,
    accent = false,
}: ToolTileProps) {
    const reduced = useReducedMotion();

    return (
        <motion.button
            onClick={onClick}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + index * 0.04, duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            whileTap={{ scale: 0.975 }}
            className={cn(
                'group relative overflow-hidden rounded-2xl p-4 text-left min-h-[112px]',
                'flex flex-col justify-between border',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                accent
                    ? 'bg-primary/[0.05] border-primary/20 hover:bg-primary/[0.08]'
                    : 'bg-white/[0.025] border-white/[0.08] hover:bg-white/[0.045]'
            )}
        >
            {/* Светлая линия по верхней кромке: даёт краю толщину.
                Без неё плитка читается наклейкой, а не предметом */}
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r
                             from-transparent via-white/[0.14] to-transparent" />

            {/* Свет за значком - мягкое пятно, а не свечение по контуру */}
            <span
                aria-hidden="true"
                className={cn(
                    'absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300',
                    accent ? 'bg-primary/15 opacity-100' : 'bg-white/[0.06] opacity-70 group-hover:opacity-100'
                )}
            />

            <span className={cn(
                'relative w-9 h-9 rounded-xl flex items-center justify-center border',
                'transition-colors duration-200',
                accent
                    ? 'bg-primary/12 border-primary/25 text-primary'
                    : 'bg-white/[0.04] border-white/10 text-muted-foreground group-hover:text-foreground'
            )}>
                <Icon className="w-[18px] h-[18px]" />
            </span>

            <span className="relative">
                <span className="block font-display font-bold text-sm tracking-tight leading-tight">
                    {title}
                </span>
                <span className={cn(
                    'block font-mono text-[11px] tabular-nums mt-1',
                    accent ? 'text-primary/80' : 'text-muted-foreground'
                )}>
                    {figure}
                </span>
            </span>
        </motion.button>
    );
});
