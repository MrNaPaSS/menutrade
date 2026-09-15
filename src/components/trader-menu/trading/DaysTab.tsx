import { useMemo } from 'react';
import { TradingDayBars } from '@/components/trader-menu/trading/TradingDayBars';
import { Tile } from '@/components/trader-menu/trading/TradingPanels';
import { PANEL, PANEL_BG } from '@/lib/tradingUi';
import { money, pnlColor, type TradingStats } from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

/**
 * Дни: ритм торговли.
 *
 * Цифры сводки говорят, сколько человек заработал, но не говорят как:
 * ровно или одним днём, который вытянул месяц. Столбики показывают
 * серии и провалы - за этим на статистику и смотрят.
 *
 * Дни календарные и по UTC, как в кабинете: пересчёт в местное время
 * сдвинул бы вечерние сделки на соседний столбик, и два экрана
 * разошлись бы.
 */
export function DaysTab({ stats }: { stats: TradingStats | null }) {
    const days = useMemo(() => stats?.byDay ?? [], [stats]);

    const best = useMemo(
        () => days.reduce<number | null>(
            (top, day) => (top === null || day.pnl > top ? day.pnl : top), null),
        [days],
    );
    const worst = useMemo(
        () => days.reduce<number | null>(
            (low, day) => (low === null || day.pnl < low ? day.pnl : low), null),
        [days],
    );
    const green = days.filter(day => day.pnl > 0).length;

    if (days.length === 0) {
        return (
            <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                За это окно терминал сделок не записал.
            </div>
        );
    }

    return (
        <>
            <TradingDayBars days={days} />

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
                    value={`${green} из ${days.length}`}
                    caption="в окне"
                />
                <Tile
                    label="Средний день"
                    value={money(days.reduce((sum, day) => sum + day.pnl, 0) / days.length)}
                    caption="по торговым дням"
                />
            </div>
        </>
    );
}
