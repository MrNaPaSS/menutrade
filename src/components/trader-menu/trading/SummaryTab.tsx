import { Num, Tile } from '@/components/trader-menu/trading/TradingPanels';
import { PANEL, PANEL_BG } from '@/lib/tradingUi';
import {
    holdTime, maybeNumber, money, percent, pnlColor, shortAmount, tradeWord,
    FLAT_COLOR, LOSS_COLOR, WIN_COLOR, type TradingStats,
} from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

/**
 * Итог окна: то, ради чего экран открывают.
 *
 * Крупно - заработок и доля прибыльных, следом шесть плиток о качестве
 * торговли. Всё помещается без прокрутки: разрезы и списки живут на
 * соседних вкладках, и длинного полотна, по которому нужно ехать до
 * нужного числа, здесь больше нет.
 */
export function SummaryTab({ stats }: { stats: TradingStats }) {
    const { summary } = stats;
    const decided = summary.wins + summary.losses;

    return (
        <>
            <div
                className="rounded-[20px] border border-[hsl(142_34%_22%)] p-4"
                style={{ background: 'linear-gradient(168deg, hsl(142 26% 12%), hsl(140 28% 8%))' }}
            >
                <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                        <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                            Итог
                        </p>
                        <Num
                            text={money(summary.net)}
                            sizes={[26, 21, 17]}
                            tone={pnlColor(summary.net)}
                            className="mt-1.5"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                            Прибыльных
                        </p>
                        <Num
                            text={decided > 0 ? percent(summary.win_rate) : '--'}
                            sizes={[26, 21, 17]}
                            tone={decided > 0 ? WIN_COLOR : FLAT_COLOR}
                            className="mt-1.5"
                        />
                    </div>
                </div>

                <p className="text-[11.5px] text-muted-foreground mt-3 tabular-nums">
                    {summary.trades} {tradeWord(summary.trades)} за {stats.days} дней
                    {` · ${summary.wins} в плюс, ${summary.losses} в минус`}
                    {summary.flat > 0 && `, ${summary.flat} в ноль`}
                </p>
            </div>

            {/* Подпись обязательна: в журнал попадает то, что вёл терминал.
                Торговля руками в приложении биржи сюда не доходит, и без
                строки человек сочтёт цифры сломанными */}
            <p className="text-[10.5px] text-muted-foreground/80 px-1 leading-relaxed">
                По сделкам через терминал NMNH. Торговлю руками в приложении биржи журнал не видит.
                {stats.truncated && ' Показаны самые свежие сделки окна.'}
            </p>

            <div className="grid grid-cols-2 gap-2">
                <Tile
                    label="Профит-фактор"
                    value={maybeNumber(summary.profit_factor)}
                    caption={summary.profit_factor === null ? 'убытков не было' : 'прибыль к убытку'}
                    tone={summary.profit_factor !== null && summary.profit_factor >= 1 ? WIN_COLOR : undefined}
                />
                <Tile
                    label="Средняя сделка"
                    value={money(summary.expectancy)}
                    caption={`лучшая ${money(summary.best)}`}
                    tone={pnlColor(summary.expectancy)}
                />
                <Tile
                    label="Просадка"
                    value={shortAmount(summary.drawdown)}
                    caption={`${percent(summary.drawdown_pct)} от пика`}
                    tone={summary.drawdown > 0 ? LOSS_COLOR : undefined}
                />
                <Tile
                    label="Средний R"
                    value={maybeNumber(summary.avg_r, 2, 'R')}
                    caption={summary.avg_r === null ? 'стопы не проставлены' : 'на единицу риска'}
                    tone={summary.avg_r !== null ? pnlColor(summary.avg_r) : undefined}
                />
                <Tile
                    label="В сделке"
                    value={holdTime(summary.hold_minutes)}
                    caption="в среднем"
                />
                <Tile
                    label="Оборот"
                    value={shortAmount(summary.volume)}
                    caption={`комиссия ${shortAmount(summary.fees)}`}
                />
            </div>

            {summary.worst < 0 && (
                <div className={cn(PANEL, 'px-3.5 py-2.5 flex items-center justify-between gap-3')} style={PANEL_BG}>
                    <p className="text-[12px] text-muted-foreground">Худшая сделка окна</p>
                    <Num text={money(summary.worst)} sizes={[14, 13, 11.5]} tone={LOSS_COLOR} />
                </div>
            )}
        </>
    );
}
