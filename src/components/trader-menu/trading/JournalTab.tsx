import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Num } from '@/components/trader-menu/trading/TradingPanels';
import { PANEL, PANEL_BG, LIST } from '@/lib/tradingUi';
import {
    calcStats, newTradeId, todayKey,
    type Trade, type TradeDirection, type TradeOutcome,
} from '@/lib/tradeJournal';
import { dayLabel, money, pnlColor, tradeWord, FLAT_COLOR, LOSS_COLOR, WIN_COLOR } from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

interface JournalTabProps {
    /** null - записи ещё читаются из облака Telegram */
    trades: Trade[] | null;
    add: (trade: Trade) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

const INPUT =
    'w-full h-11 rounded-xl px-3 text-[15px] ' +
    'bg-[hsl(140_26%_7%)] border border-[hsl(142_26%_15%)] text-foreground ' +
    'outline-none focus:border-primary/50 transition-colors';

const OUTCOMES: Array<[TradeOutcome, string, string]> = [
    ['win', 'Плюс', WIN_COLOR],
    ['loss', 'Минус', LOSS_COLOR],
    ['breakeven', 'В ноль', FLAT_COLOR],
];

function parseNumber(raw: string): number {
    const value = Number(raw.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
}

/**
 * Дневник сделок: то, что человек ведёт сам.
 *
 * Рядом со статистикой терминала не случайно: терминал знает сделку
 * точно, а дневник помнит, почему в неё вошли. Ответ на «что я делаю
 * не так» лежит на пересечении этих двух, и разносить их по разным
 * окнам значило заставлять человека держать одно в голове, пока он
 * смотрит на другое.
 *
 * Записи лежат в облаке Telegram: память телефона чистится вместе с
 * кэшем, а дневник без сохранности бессмыслен.
 */
export function JournalTab({ trades, add, remove }: JournalTabProps) {
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState(false);

    const [date, setDate] = useState(todayKey());
    const [instrument, setInstrument] = useState('');
    const [direction, setDirection] = useState<TradeDirection>('long');
    const [outcome, setOutcome] = useState<TradeOutcome>('win');
    const [pnl, setPnl] = useState('');
    const [r, setR] = useState('');
    const [note, setNote] = useState('');

    const stats = useMemo(() => calcStats(trades ?? []), [trades]);

    const resetForm = useCallback(() => {
        setDate(todayKey());
        setInstrument('');
        setDirection('long');
        setOutcome('win');
        setPnl('');
        setR('');
        setNote('');
    }, []);

    const submit = async () => {
        const value = Math.abs(parseNumber(pnl));
        setSaving(true);
        await add({
            id: newTradeId(),
            date,
            instrument: instrument.trim() || 'Без инструмента',
            direction,
            outcome,
            // Знак ставим по исходу, а не просим человека помнить минус:
            // на вводе руками его забывают, и статистика врёт
            pnl: outcome === 'loss' ? -value : outcome === 'breakeven' ? 0 : value,
            r: parseNumber(r),
            note: note.trim().slice(0, 200),
        });
        setSaving(false);
        resetForm();
        setAdding(false);
    };

    if (adding) {
        return (
            <>
                <div className={cn(PANEL, 'p-4 space-y-3')} style={PANEL_BG}>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block min-w-0">
                            <span className="block text-[12px] text-muted-foreground mb-1.5">Дата</span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={cn(INPUT, 'font-mono tabular-nums')}
                            />
                        </label>
                        <label className="block min-w-0">
                            <span className="block text-[12px] text-muted-foreground mb-1.5">Инструмент</span>
                            <input
                                value={instrument}
                                onChange={(e) => setInstrument(e.target.value)}
                                placeholder="BTCUSDT"
                                autoComplete="off"
                                className={INPUT}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {([['long', 'Покупка'], ['short', 'Продажа']] as const).map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setDirection(id)}
                                className={cn(
                                    'h-10 rounded-xl text-[13px] font-medium border transition-colors',
                                    direction === id
                                        ? 'bg-primary/12 border-primary/35 text-primary'
                                        : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {OUTCOMES.map(([id, label, tone]) => (
                            <button
                                key={id}
                                onClick={() => setOutcome(id)}
                                className={cn(
                                    'h-10 rounded-xl text-[13px] font-medium border transition-colors',
                                    outcome === id
                                        ? 'bg-white/[0.06] border-white/[0.16]'
                                        : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground'
                                )}
                                style={outcome === id ? { color: tone } : undefined}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block min-w-0">
                            <span className="block text-[12px] text-muted-foreground mb-1.5">Результат</span>
                            <div className="relative">
                                <input
                                    value={pnl}
                                    onChange={(e) => setPnl(e.target.value)}
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder="0"
                                    disabled={outcome === 'breakeven'}
                                    className={cn(INPUT, 'pr-9 font-mono tabular-nums disabled:opacity-40')}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                                    $
                                </span>
                            </div>
                        </label>
                        <label className="block min-w-0">
                            <span className="flex items-baseline gap-1.5 mb-1.5">
                                <span className="text-[12px] text-muted-foreground">В риске</span>
                                <span className="text-[10.5px] text-muted-foreground/60">можно позже</span>
                            </span>
                            <div className="relative">
                                <input
                                    value={r}
                                    onChange={(e) => setR(e.target.value)}
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder="2"
                                    className={cn(INPUT, 'pr-9 font-mono tabular-nums')}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                                    R
                                </span>
                            </div>
                        </label>
                    </div>

                    <label className="block">
                        <span className="block text-[12px] text-muted-foreground mb-1.5">Почему вошли</span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            maxLength={200}
                            placeholder="Отбой от уровня, объём подтвердил"
                            className={cn(INPUT, 'h-auto py-2.5 resize-none text-[14px]')}
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-11" onClick={() => setAdding(false)}>
                        Отмена
                    </Button>
                    <Button className="h-11 font-semibold" disabled={saving} onClick={submit}>
                        {saving ? 'Сохраняем...' : 'Записать'}
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            {trades !== null && trades.length > 0 && (
                <div className={cn(PANEL, 'px-4 py-3 flex items-center justify-between gap-3')} style={PANEL_BG}>
                    <div className="min-w-0">
                        <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                            Итог по записям
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 tabular-nums truncate">
                            {stats.total} {tradeWord(stats.total)} · {Math.round(stats.winrate)}% в плюс
                            {stats.streak !== 0 && ` · серия ${Math.abs(stats.streak)} ${stats.streak > 0 ? 'в плюс' : 'в минус'}`}
                        </p>
                    </div>
                    <Num
                        text={money(stats.pnl)}
                        sizes={[20, 17, 14]}
                        tone={pnlColor(stats.pnl)}
                        className="flex-shrink-0"
                    />
                </div>
            )}

            <Button className="w-full h-11 font-semibold" onClick={() => setAdding(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Записать сделку
            </Button>

            {trades === null && (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Читаем дневник...
                </div>
            )}

            {trades !== null && trades.length === 0 && (
                <div className={cn(PANEL, 'p-6 text-center')} style={PANEL_BG}>
                    <NotebookPen className="w-7 h-7 mx-auto mb-2.5" style={{ color: 'hsl(142 20% 34%)' }} />
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Пусто. Первая запись занимает полминуты, а через месяц по ним видно,
                        что у вас работает, а что кажется работающим.
                    </p>
                </div>
            )}

            {trades !== null && trades.length > 0 && (
                <div className={LIST} style={PANEL_BG}>
                    {trades.map((trade, index) => (
                        <motion.div
                            key={trade.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.22 }}
                            className="flex items-start gap-3 px-3.5 py-2.5"
                        >
                            <span
                                className="w-1 self-stretch rounded-full flex-shrink-0"
                                style={{ background: pnlColor(trade.pnl) }}
                            />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[14px] font-medium text-foreground truncate">
                                        {trade.instrument}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground flex-shrink-0">
                                        {trade.direction === 'long' ? 'покупка' : 'продажа'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground tabular-nums truncate">
                                    {dayLabel(trade.date)}
                                    {trade.r !== 0 && ` · ${trade.r > 0 ? '+' : ''}${trade.r}R`}
                                </p>
                                {trade.note && (
                                    <p className="text-[11.5px] text-muted-foreground/80 mt-1 line-clamp-2">
                                        {trade.note}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Num text={money(trade.pnl)} sizes={[14, 13, 11.5]} tone={pnlColor(trade.pnl)} />
                                <button
                                    onClick={() => remove(trade.id)}
                                    aria-label="Удалить запись"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center
                                               text-muted-foreground transition-colors
                                               hover:bg-destructive/10 hover:text-destructive
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </>
    );
}
