import { Panel, Row } from '@/components/trader-menu/trading/TradingPanels';
import { PANEL, PANEL_BG } from '@/lib/tradingUi';
import {
    amount, exchangeLabel, percent, tradeWord, type TradingStats,
} from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

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
 * Где и чем торгует: биржи и пары.
 *
 * Итоги бирж намеренно не складываются в одну строку: у каждой свой
 * счёт, и сумма по ним - это не число, а каша. Общий итог уже посчитан
 * платформой и стоит в разделе «Итог».
 *
 * Сами сделки списком лежат в дневнике: здесь вопрос «где и чем», там
 * «что именно было».
 */
export function MarketsTab({ stats }: { stats: TradingStats }) {
    const empty = stats.byExchange.length === 0 && stats.topSymbols.length === 0;

    return (
        <>
            {empty && (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    За это окно сделок нет.
                </div>
            )}

            {stats.byExchange.length > 0 && (
                <Panel title="Биржи" note="итог по каждой отдельно">
                    {stats.byExchange.map(item => (
                        <Row
                            key={item.exchange}
                            title={exchangeLabel(item.exchange)}
                            caption={cellCaption(item)}
                            value={item.pnl}
                        />
                    ))}
                </Panel>
            )}

            {stats.topSymbols.length > 0 && (
                <Panel title="Пары" note="сверху самые оборотистые">
                    {stats.topSymbols.map(item => (
                        <Row
                            key={item.symbol}
                            title={item.symbol}
                            caption={cellCaption(item)}
                            value={item.pnl}
                        />
                    ))}
                </Panel>
            )}

        </>
    );
}
