import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Num } from '@/components/trader-menu/trading/TradingPanels';
import { PANEL, PANEL_BG, LIST, openLink } from '@/lib/tradingUi';
import {
    closedLabel, dayLabel, exchangeLabel, money, OUTCOME_LABEL, pnlColor, SIDE_LABEL, tradeWord,
    type TradingStats, type TradingTrade,
} from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

/** Час и минута закрытия: день уже написан в заголовке. */
function timeLabel(iso: string | null): string {
    const full = closedLabel(iso);
    const parts = full.split(', ');
    return parts.length > 1 ? parts[parts.length - 1] : full;
}

/** Сделки по дням, свежий день сверху. */
function byDay(trades: TradingTrade[]): Array<[string, TradingTrade[]]> {
    const days = new Map<string, TradingTrade[]>();
    for (const trade of trades) {
        // День берём из отметки закрытия по UTC - так же, как считает
        // платформа. Местное время сдвинуло бы вечерние сделки на сутки
        const day = (trade.closed_at ?? '').slice(0, 10) || 'без даты';
        days.set(day, [...(days.get(day) ?? []), trade]);
    }
    return [...days.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

/**
 * Дневник сделок - то, что записал терминал.
 *
 * Раньше здесь человек вёл записи руками. Ручной дневник проигрывает
 * по всем статьям: половину сделок забывают внести, суммы ставят по
 * памяти, а числа расходятся с терминалом настолько, что верить нельзя
 * ни тем, ни другим. Терминал знает каждую закрытую сделку точно -
 * пару, сторону, чем закончилась, когда и на сколько.
 *
 * Сгруппировано по дням: дневник читают днями, а не сплошной лентой.
 */
export function JournalTab({ stats }: { stats: TradingStats }) {
    const days = useMemo(() => byDay(stats.lastTrades), [stats.lastTrades]);

    if (days.length === 0) {
        return (
            <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                За это окно терминал сделок не записал.
            </div>
        );
    }

    return (
        <>
            {days.map(([day, trades]) => {
                const total = trades.reduce((sum, trade) => sum + trade.pnl, 0);

                return (
                    <div key={day}>
                        <div className="flex items-baseline justify-between gap-3 mb-2 px-1">
                            <h3 className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                                {day === 'без даты' ? 'Без даты' : dayLabel(day)}
                            </h3>
                            <p className="text-[11px] text-muted-foreground/70 tabular-nums">
                                {trades.length} {tradeWord(trades.length)} · {money(total)}
                            </p>
                        </div>

                        <div className={LIST} style={PANEL_BG}>
                            {trades.map((trade, index) => (
                                <div
                                    key={`${trade.closed_at}-${trade.symbol}-${index}`}
                                    className="flex items-center gap-3 px-3.5 py-2.5"
                                >
                                    <span
                                        className="w-1 self-stretch rounded-full flex-shrink-0"
                                        style={{ background: pnlColor(trade.pnl) }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[14px] font-medium text-foreground truncate">
                                                {trade.symbol}
                                            </span>
                                            {trade.side && (
                                                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                                                    {SIDE_LABEL[trade.side]}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                                            {[
                                                timeLabel(trade.closed_at),
                                                trade.exchange ? exchangeLabel(trade.exchange) : '',
                                                trade.outcome ? OUTCOME_LABEL[trade.outcome] : '',
                                            ].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>
                                    <Num
                                        text={money(trade.pnl)}
                                        sizes={[14, 13, 11.5]}
                                        tone={pnlColor(trade.pnl)}
                                        className="flex-shrink-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Список не бесконечный: глубже окна и глубже последних
                сделок живёт кабинет, туда и отправляем */}
            <Button
                variant="outline"
                className="w-full h-11 font-semibold"
                onClick={() => openLink(stats.cabinetUrl)}
            >
                Вся история в кабинете
                <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Button>
        </>
    );
}
