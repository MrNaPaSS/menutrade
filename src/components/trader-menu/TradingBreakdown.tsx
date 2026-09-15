import type { ReactNode } from 'react';
import {
    amount, closedLabel, exchangeLabel, money, OUTCOME_LABEL, percent, pnlColor,
    SIDE_LABEL, tradeWord,
    type TradingExchange, type TradingSymbol, type TradingTrade,
} from '@/lib/tradingStats';

interface TradingBreakdownProps {
    byExchange: TradingExchange[];
    topSymbols: TradingSymbol[];
    lastTrades: TradingTrade[];
}

const PANEL =
    'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden ' +
    'divide-y divide-[hsl(142_22%_13%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-3 mb-2 px-1">
                <h3 className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                    {title}
                </h3>
                {note && <p className="text-[11px] text-muted-foreground/70">{note}</p>}
            </div>
            <div className={PANEL} style={PANEL_BG}>
                {children}
            </div>
        </div>
    );
}

/** Строка разреза: название, подпись с составом и итог справа. */
function Row({ title, caption, value }: { title: string; caption: string; value: number }) {
    return (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <div className="min-w-0">
                <p className="text-[14px] text-foreground truncate">{title}</p>
                <p className="text-[11.5px] text-muted-foreground tabular-nums">{caption}</p>
            </div>
            <span
                className="font-mono font-bold text-[13.5px] tabular-nums flex-shrink-0"
                style={{ color: pnlColor(value) }}
            >
                {money(value)}
            </span>
        </div>
    );
}

/**
 * «2 сделки · 50% в плюс · оборот 1 224 $»
 *
 * Доля считается от решённых сделок, как и общий винрейт на платформе:
 * выход в ноль не победа и не поражение, и в знаменателе он занижал бы
 * долю. Иначе на одном экране было бы два разных винрейта.
 */
function cellCaption(cell: { trades: number; wins: number; losses: number; volume: number }): string {
    const decided = cell.wins + cell.losses;
    const parts = [`${cell.trades} ${tradeWord(cell.trades)}`];
    if (decided > 0) parts.push(`${percent(cell.wins / decided)} в плюс`);
    if (cell.volume > 0) parts.push(`оборот ${amount(cell.volume)}`);
    return parts.join(' · ');
}

/**
 * Разрезы сводки: где торгует, чем торгует и что было последним.
 *
 * Итоги бирж намеренно не складываются в одну строку: у каждой свой
 * счёт, и сумма по ним - это не число, а каша. Общий итог уже посчитан
 * платформой и стоит наверху экрана.
 */
export function TradingBreakdown({ byExchange, topSymbols, lastTrades }: TradingBreakdownProps) {
    return (
        <>
            {byExchange.length > 0 && (
                <Panel title="Биржи" note="итог по каждой отдельно">
                    {byExchange.map(item => (
                        <Row
                            key={item.exchange}
                            title={exchangeLabel(item.exchange)}
                            caption={cellCaption(item)}
                            value={item.pnl}
                        />
                    ))}
                </Panel>
            )}

            {topSymbols.length > 0 && (
                <Panel title="Пары">
                    {topSymbols.map(item => (
                        <Row
                            key={item.symbol}
                            title={item.symbol}
                            caption={cellCaption(item)}
                            value={item.pnl}
                        />
                    ))}
                </Panel>
            )}

            {lastTrades.length > 0 && (
                <Panel title="Последние сделки">
                    {lastTrades.map((trade, index) => (
                        <div
                            key={`${trade.closed_at}-${trade.symbol}-${index}`}
                            className="flex items-start gap-3 px-3.5 py-2.5"
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
                                <p className="text-[11.5px] text-muted-foreground tabular-nums">
                                    {[
                                        closedLabel(trade.closed_at),
                                        trade.exchange ? exchangeLabel(trade.exchange) : '',
                                        trade.outcome ? OUTCOME_LABEL[trade.outcome] : '',
                                    ].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                            <span
                                className="font-mono font-bold text-[13.5px] tabular-nums flex-shrink-0"
                                style={{ color: pnlColor(trade.pnl) }}
                            >
                                {money(trade.pnl)}
                            </span>
                        </div>
                    ))}
                </Panel>
            )}
        </>
    );
}
