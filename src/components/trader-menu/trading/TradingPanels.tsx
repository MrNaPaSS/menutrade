import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { fitSize, money, pnlColor } from '@/lib/tradingStats';
import { PANEL, PANEL_BG, LIST } from '@/lib/tradingUi';
import { cn } from '@/lib/utils';

/**
 * Общие кирпичи экрана статистики: рамка, плитка, строка списка,
 * пустое состояние.
 *
 * Вынесены отдельно, потому что четыре вкладки собираются из одних и
 * тех же деталей, а рамка и отступы у них обязаны совпадать: разъехавшийся
 * на вкладке скругление читается как другой экран.
 */

/** Раздел с заголовком: название слева, пояснение справа. */
export function Panel({ title, note, children }: {
    title: string;
    note?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-3 mb-2 px-1">
                <h3 className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                    {title}
                </h3>
                {note && <p className="text-[11px] text-muted-foreground/70 truncate">{note}</p>}
            </div>
            <div className={LIST} style={PANEL_BG}>
                {children}
            </div>
        </div>
    );
}

/**
 * Число, которое не переносится.
 *
 * Кегль подбирается под длину: «+8 723,7 $» на крупном шрифте рвалось
 * по пробелу, и знак доллара уезжал на вторую строку.
 */
export function Num({ text, sizes, tone, className }: {
    text: string;
    /** Крупный, средний и мелкий кегль - по длине числа */
    sizes: [number, number, number];
    tone?: string;
    className?: string;
}) {
    return (
        <span
            className={cn('font-mono font-bold tabular-nums whitespace-nowrap block', className)}
            style={{
                fontSize: fitSize(text, sizes[0], sizes[1], sizes[2]),
                lineHeight: 1.05,
                color: tone ?? 'hsl(var(--foreground))',
            }}
        >
            {text}
        </span>
    );
}

/** Плитка сводки: подпись, число, пояснение под ним. */
export function Tile({ label, value, caption, tone }: {
    label: string;
    value: string;
    caption?: string;
    tone?: string;
}) {
    return (
        <div className={cn(PANEL, 'px-3 py-2.5 min-w-0')} style={PANEL_BG}>
            <p className="text-[10px] uppercase tracking-[0.07em] text-muted-foreground truncate">
                {label}
            </p>
            <Num text={value} sizes={[19, 16, 14]} tone={tone} className="mt-1.5" />
            {caption && (
                <p className="text-[10.5px] text-muted-foreground mt-1 tabular-nums truncate">
                    {caption}
                </p>
            )}
        </div>
    );
}

/** Строка списка: название, подпись с составом и итог справа. */
export function Row({ title, caption, value, mark }: {
    title: string;
    caption: string;
    value: number;
    /** Цветная полоска слева - у списка сделок */
    mark?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 px-3.5 py-2.5">
            {mark && (
                <span
                    className="w-1 self-stretch rounded-full flex-shrink-0"
                    style={{ background: pnlColor(value) }}
                />
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[14px] text-foreground truncate">{title}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums truncate">{caption}</p>
            </div>
            <Num
                text={money(value)}
                sizes={[14, 13, 11.5]}
                tone={pnlColor(value)}
                className="flex-shrink-0 text-right"
            />
        </div>
    );
}

/** Экран без цифр: почему их нет и что с этим сделать. */
export function Empty({ icon, title, text, action, onAction }: {
    icon: ReactNode;
    title: string;
    text: string;
    action?: string;
    onAction?: () => void;
}) {
    return (
        <div className={cn(PANEL, 'p-6 text-center')} style={PANEL_BG}>
            <span
                className="inline-flex w-10 h-10 rounded-[13px] items-center justify-center mb-3"
                style={{ background: 'hsl(142 30% 14%)', color: 'hsl(142 55% 55%)' }}
            >
                {icon}
            </span>
            <p className="text-[15px] font-semibold text-foreground">{title}</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5">{text}</p>
            {action && onAction && (
                <Button className="w-full h-11 font-semibold mt-4" onClick={onAction}>
                    {action}
                </Button>
            )}
        </div>
    );
}
