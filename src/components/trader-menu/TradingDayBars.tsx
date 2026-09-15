import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    dayLabel, money, pnlColor, tradeWord, type TradingDay,
} from '@/lib/tradingStats';

interface TradingDayBarsProps {
    days: TradingDay[];
}

/** Половина высоты полосы: столбик растёт вверх или вниз от середины. */
const HALF = 34;

/** Минимальная высота столбика: день с копеечным итогом тоже виден. */
const MIN_BAR = 3;

/**
 * Дни окна столбиками.
 *
 * Цифры сводки говорят, сколько человек заработал, но не говорят как:
 * ровно или одним днём, который вытянул месяц. Столбики показывают
 * ритм и серии - это то, ради чего на статистику вообще смотрят.
 *
 * Отсчёт от середины, а не снизу: полоса ниже нуля читается как потеря
 * сразу, без чтения подписи.
 *
 * Дни календарные и по UTC - так же, как в кабинете. Пересчёт в
 * местное время сдвинул бы вечерние сделки на соседний столбик, и
 * два экрана разошлись бы.
 */
export function TradingDayBars({ days }: TradingDayBarsProps) {
    const reduced = useReducedMotion();
    const [picked, setPicked] = useState<TradingDay | null>(null);

    const scale = useMemo(
        () => Math.max(...days.map(day => Math.abs(day.pnl)), 1),
        [days],
    );

    if (days.length === 0) return null;

    // Выбранный день переживает смену окна, а в новом списке его может
    // не быть - тогда снова показываем последний
    const kept = picked && days.some(day => day.date === picked.date) ? picked : null;
    const shown = kept ?? days[days.length - 1];

    return (
        <div
            className="rounded-[18px] border border-[hsl(142_26%_15%)] p-4"
            style={{ background: 'hsl(140 26% 8%)' }}
        >
            <div className="flex items-baseline justify-between gap-3 mb-3">
                <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                    По дням
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                    дни по UTC
                </p>
            </div>

            <div className="flex items-center gap-[2px]" style={{ height: HALF * 2 }}>
                {days.map((day, index) => {
                    const height = Math.max(MIN_BAR, Math.round((Math.abs(day.pnl) / scale) * HALF));
                    const up = day.pnl >= 0;

                    return (
                        <button
                            key={day.date}
                            onClick={() => setPicked(day)}
                            aria-label={`${dayLabel(day.date)}: ${money(day.pnl)}`}
                            className="flex-1 min-w-0 h-full flex flex-col justify-center
                                       focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                        >
                            {/* Две половины одинаковой высоты: столбик любого
                                знака упирается в общую линию посередине */}
                            <span className="flex-1 flex items-end w-full">
                                {up && (
                                    <motion.span
                                        className="w-full rounded-t-[2px]"
                                        style={{ background: pnlColor(day.pnl), opacity: kept && kept.date !== day.date ? 0.45 : 1 }}
                                        initial={{ height: reduced ? height : 0 }}
                                        animate={{ height }}
                                        transition={{ delay: Math.min(index, 20) * 0.012, duration: 0.3 }}
                                    />
                                )}
                            </span>
                            <span className="flex-1 flex items-start w-full">
                                {!up && (
                                    <motion.span
                                        className="w-full rounded-b-[2px]"
                                        style={{ background: pnlColor(day.pnl), opacity: kept && kept.date !== day.date ? 0.45 : 1 }}
                                        initial={{ height: reduced ? height : 0 }}
                                        animate={{ height }}
                                        transition={{ delay: Math.min(index, 20) * 0.012, duration: 0.3 }}
                                    />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Линия нуля идёт под столбиками, а не сквозь них: так она не
                спорит с их цветом */}
            <div className="h-px mt-[-1px] mb-3" style={{ background: 'hsl(142 22% 16%)' }} />

            <div className="flex items-baseline justify-between gap-3">
                <p className="text-[12.5px] text-foreground tabular-nums">
                    {dayLabel(shown.date)}
                    <span className="text-muted-foreground">
                        {' · '}{shown.trades} {tradeWord(shown.trades)}
                    </span>
                </p>
                <p
                    className="font-mono font-bold text-[13.5px] tabular-nums"
                    style={{ color: pnlColor(shown.pnl) }}
                >
                    {money(shown.pnl)}
                </p>
            </div>
        </div>
    );
}
