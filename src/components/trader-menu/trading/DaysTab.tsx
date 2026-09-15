import { useMemo, useState } from 'react';
import { TradingDayBars } from '@/components/trader-menu/trading/TradingDayBars';
import { Num, Tile } from '@/components/trader-menu/trading/TradingPanels';
import { PANEL, PANEL_BG, LIST } from '@/lib/tradingUi';
import { pnlByDay, type Trade } from '@/lib/tradeJournal';
import {
    dayLabel, money, pnlColor, tradeWord, type TradingStats,
} from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

interface DaysTabProps {
    /** null - сводки терминала нет: не торговал или связи не было */
    stats: TradingStats | null;
    /** null - записи дневника ещё читаются */
    trades: Trade[] | null;
}

type Source = 'terminal' | 'journal';

const SOURCES: Array<[Source, string]> = [
    ['terminal', 'Терминал'],
    ['journal', 'Мой дневник'],
];

/**
 * Дни: ритм торговли.
 *
 * Два источника в одном разделе и с одним переключателем. Терминал
 * знает каждую сделку точно, дневник - то, что человек записал сам;
 * это два взгляда на один и тот же вопрос «как шли дни», и разводить
 * их по разным разделам значило бы прятать расхождение между ними.
 * А расхождение как раз и есть самое полезное, что тут видно.
 */
export function DaysTab({ stats, trades }: DaysTabProps) {
    const [source, setSource] = useState<Source>('terminal');

    const journalDays = useMemo(() => {
        const days = [...pnlByDay(trades ?? []).entries()];
        return days.sort((a, b) => b[0].localeCompare(a[0]));
    }, [trades]);

    const terminalDays = useMemo(() => stats?.byDay ?? [], [stats]);

    const best = useMemo(
        () => terminalDays.reduce<number | null>(
            (top, day) => (top === null || day.pnl > top ? day.pnl : top), null),
        [terminalDays],
    );
    const worst = useMemo(
        () => terminalDays.reduce<number | null>(
            (low, day) => (low === null || day.pnl < low ? day.pnl : low), null),
        [terminalDays],
    );
    const green = terminalDays.filter(day => day.pnl > 0).length;

    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                {SOURCES.map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setSource(id)}
                        className={cn(
                            'h-9 rounded-xl text-[12.5px] font-medium border transition-colors',
                            source === id
                                ? 'bg-primary/12 border-primary/35 text-primary'
                                : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {source === 'terminal' && terminalDays.length === 0 && (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    За это окно терминал сделок не записал.
                </div>
            )}

            {source === 'terminal' && terminalDays.length > 0 && (
                <>
                    <TradingDayBars days={terminalDays} />

                    <div className="grid grid-cols-2 gap-2">
                        <Tile
                            label="Лучший день"
                            value={best === null ? '--' : money(best)}
                            tone={best === null ? undefined : pnlColor(best)}
                        />
                        <Tile
                            label="Худший день"
                            value={worst === null ? '--' : money(worst)}
                            tone={worst === null ? undefined : pnlColor(worst)}
                        />
                        <Tile
                            label="Дней в плюс"
                            value={`${green} из ${terminalDays.length}`}
                            caption="в окне"
                        />
                        <Tile
                            label="Средний день"
                            value={money(terminalDays.reduce((sum, day) => sum + day.pnl, 0) / terminalDays.length)}
                            caption="по торговым дням"
                        />
                    </div>
                </>
            )}

            {source === 'journal' && trades === null && (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Читаем дневник...
                </div>
            )}

            {source === 'journal' && trades !== null && journalDays.length === 0 && (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    В дневнике пока нет записей. Календарь соберётся из них сам.
                </div>
            )}

            {source === 'journal' && journalDays.length > 0 && (
                <div className={LIST} style={PANEL_BG}>
                    {journalDays.map(([day, sum]) => {
                        const count = (trades ?? []).filter(trade => trade.date === day).length;
                        return (
                            <div key={day} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                                <div className="min-w-0">
                                    <p className="text-[14px] text-foreground tabular-nums truncate">
                                        {dayLabel(day)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground tabular-nums">
                                        {count} {tradeWord(count)}
                                    </p>
                                </div>
                                <Num
                                    text={money(sum)}
                                    sizes={[14, 13, 11.5]}
                                    tone={pnlColor(sum)}
                                    className="flex-shrink-0"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
