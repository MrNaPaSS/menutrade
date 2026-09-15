import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, KeyRound, LineChart, PlugZap, WifiOff } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { Button } from '@/components/ui/button';
import { TradingDayBars } from '@/components/trader-menu/TradingDayBars';
import { TradingBreakdown } from '@/components/trader-menu/TradingBreakdown';
import { useTradingStats } from '@/hooks/useTradingStats';
import {
    amount, holdTime, maybeNumber, money, percent, pnlColor, tradeWord,
    TRADING_WINDOWS, WIN_COLOR, LOSS_COLOR, FLAT_COLOR, type TradingStats,
} from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

interface TradingStatsModalProps {
    open: boolean;
    onClose: () => void;
    /** Шаг назад в профиль трейдера: экран открывается оттуда */
    onBack: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

function openLink(url: string): void {
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

/** Плитка сводки: подпись, число, пояснение под ним. */
function Tile({ label, value, caption, tone }: {
    label: string;
    value: string;
    caption?: string;
    tone?: string;
}) {
    return (
        <div className={cn(PANEL, 'px-3.5 py-3')} style={PANEL_BG}>
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                {label}
            </p>
            <p
                className="font-mono font-bold text-[18px] leading-none tabular-nums mt-1.5"
                style={{ color: tone ?? 'hsl(var(--foreground))' }}
            >
                {value}
            </p>
            {caption && (
                <p className="text-[11px] text-muted-foreground mt-1 tabular-nums truncate">
                    {caption}
                </p>
            )}
        </div>
    );
}

/** Экран без цифр: почему их нет и что с этим сделать. */
function Empty({ icon, title, text, action, onAction }: {
    icon: ReactNode;
    title: string;
    text: string;
    action?: string;
    onAction?: () => void;
}) {
    return (
        <div className={cn(PANEL, 'p-6 text-center')} style={PANEL_BG}>
            <span className="inline-flex w-10 h-10 rounded-[13px] items-center justify-center mb-3"
                style={{ background: 'hsl(142 30% 14%)', color: 'hsl(142 55% 55%)' }}>
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

/** Крупно то, ради чего экран открывают: итог за окно и доля прибыльных. */
function Hero({ stats }: { stats: TradingStats }) {
    const { summary } = stats;

    return (
        <div
            className="rounded-[20px] border border-[hsl(142_34%_22%)] p-4"
            style={{ background: 'linear-gradient(168deg, hsl(142 26% 12%), hsl(140 28% 8%))' }}
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                        Итог
                    </p>
                    <p
                        className="font-mono font-bold text-[26px] leading-none tabular-nums mt-1"
                        style={{ color: pnlColor(summary.net) }}
                    >
                        {money(summary.net)}
                    </p>
                </div>
                <div>
                    <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                        Прибыльных
                    </p>
                    <p
                        className="font-mono font-bold text-[26px] leading-none tabular-nums mt-1"
                        style={{ color: summary.wins + summary.losses > 0 ? WIN_COLOR : FLAT_COLOR }}
                    >
                        {summary.wins + summary.losses > 0 ? percent(summary.win_rate) : '--'}
                    </p>
                </div>
            </div>

            <p className="text-[11.5px] text-muted-foreground mt-3 tabular-nums">
                {summary.trades} {tradeWord(summary.trades)} за {stats.days} дней
                {summary.flat > 0 && ` · ${summary.flat} в ноль`}
                {` · ${summary.wins} в плюс, ${summary.losses} в минус`}
            </p>
        </div>
    );
}

/**
 * Статистика торговли через терминал NMNH.
 *
 * Считает её платформа - теми же формулами, что и раздел аналитики в
 * кабинете: одни и те же цифры на двух экранах, иначе разный винрейт
 * читался бы как поломка.
 *
 * Здесь показывается торговля через терминал, а не вся торговля на
 * бирже: сделки, сделанные руками в приложении биржи, в журнал не
 * попадают. Это подписано под итогом - без подписи человек, который
 * торгует и там и там, решит, что цифры врут.
 */
export function TradingStatsModal({ open, onClose, onBack }: TradingStatsModalProps) {
    const { days, setDays, stats, loading, offline, reload } = useTradingStats(open);

    const summary = stats?.summary;
    const cabinet = stats?.cabinetUrl ?? 'https://www.nmnh.trade/app/journal';

    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            onBack={onBack}
            title="Статистика терминала"
            subtitle="Ваши сделки через NMNH за выбранный период"
        >
            {/* Окно выбирается всегда, даже когда цифр нет: «за неделю
                пусто» и «пусто вообще» - разные ответы */}
            <div className="grid grid-cols-3 gap-2">
                {TRADING_WINDOWS.map(window => (
                    <button
                        key={window}
                        onClick={() => setDays(window)}
                        className={cn(
                            'h-10 rounded-xl text-[13px] font-medium border transition-colors',
                            days === window
                                ? 'bg-primary/12 border-primary/35 text-primary'
                                : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground'
                        )}
                    >
                        {window} дней
                    </button>
                ))}
            </div>

            {offline && (
                <Empty
                    icon={<WifiOff className="w-5 h-5" />}
                    title="Терминал не ответил"
                    text="Связи с платформой нет. Цифры целы, попробуйте ещё раз через минуту."
                    action="Повторить"
                    onAction={reload}
                />
            )}

            {!offline && !stats && loading && (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Считаем вашу торговлю...
                </div>
            )}

            {stats?.state === 'no_account' && (
                <Empty
                    icon={<LineChart className="w-5 h-5" />}
                    title="Торговли пока не видно"
                    text="Статистика собирается по сделкам через терминал NMNH. Откройте кабинет, подключите счёт биржи - и цифры появятся здесь сами."
                    action="Открыть кабинет"
                    onAction={() => openLink(cabinet)}
                />
            )}

            {stats?.state === 'no_keys' && (
                <Empty
                    icon={<KeyRound className="w-5 h-5" />}
                    title="Счёт не подключён"
                    text="Терминал торгует через ключи вашей биржи. Подключите счёт в кабинете - и каждая сделка начнёт попадать сюда."
                    action="Подключить счёт"
                    onAction={() => openLink(cabinet)}
                />
            )}

            {stats?.state === 'no_trades' && (
                <Empty
                    icon={<PlugZap className="w-5 h-5" />}
                    title={`За ${stats.days} дней сделок нет`}
                    text="Счёт подключён, но закрытых сделок в этом окне не было. Выберите период шире или откройте сделку в терминале."
                    action="Открыть терминал"
                    onAction={() => openLink(cabinet)}
                />
            )}

            {stats?.state === 'ok' && summary && (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    /* На время запроса цифры гаснут, но остаются на месте:
                       убрать их - значит схлопнуть экран на каждом
                       переключении окна */
                    className={cn('space-y-3 transition-opacity', loading && 'opacity-50')}
                >
                    <Hero stats={stats} />

                    {/* Подпись обязательна: в журнал попадает то, что вёл
                        терминал. Ручные сделки в приложении биржи сюда не
                        доходят, и без строки человек сочтёт цифры сломанными */}
                    <p className="text-[11px] text-muted-foreground/80 px-1 leading-relaxed">
                        По сделкам через терминал NMNH. Торговлю руками в приложении биржи
                        журнал не видит.
                        {stats.truncated && ' Показаны самые свежие сделки окна.'}
                    </p>

                    <TradingDayBars days={stats.byDay} />

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
                            value={amount(summary.drawdown, 2)}
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
                            value={amount(summary.volume)}
                            caption={`комиссия ${amount(summary.fees, 2)}`}
                        />
                    </div>

                    <TradingBreakdown
                        byExchange={stats.byExchange}
                        topSymbols={stats.topSymbols}
                        lastTrades={stats.lastTrades}
                    />

                    <Button
                        variant="outline"
                        className="w-full h-11 font-semibold"
                        onClick={() => openLink(cabinet)}
                    >
                        Вся история в кабинете
                        <ArrowUpRight className="w-4 h-4 ml-1.5" />
                    </Button>
                </motion.div>
            )}
        </ModalWindow>
    );
}
