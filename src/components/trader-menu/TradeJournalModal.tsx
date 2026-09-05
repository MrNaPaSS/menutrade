import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, LineChart, Plus, Trash2 } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { Button } from '@/components/ui/button';
import {
    calcStats, deleteTrade, loadTrades, newTradeId, pnlByDay, saveTrade, todayKey,
    type Trade, type TradeDirection, type TradeOutcome,
} from '@/lib/tradeJournal';
import { cn } from '@/lib/utils';

interface TradeJournalModalProps {
    open: boolean;
    onClose: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

const WIN = 'hsl(142 76% 58%)';
const LOSS = 'hsl(0 72% 62%)';

const INPUT =
    'w-full h-11 rounded-xl px-3 text-[15px] ' +
    'bg-[hsl(140_26%_7%)] border border-[hsl(142_26%_15%)] text-foreground ' +
    'outline-none focus:border-primary/50 transition-colors';

const OUTCOMES: Array<[TradeOutcome, string, string]> = [
    ['win', 'Плюс', WIN],
    ['loss', 'Минус', LOSS],
    ['breakeven', 'В ноль', 'hsl(var(--muted-foreground))'],
];

type View = 'list' | 'add' | 'calendar';

function money(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} $`;
}

function parseNumber(raw: string): number {
    const value = Number(raw.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
}

/**
 * Дневник сделок.
 *
 * Три вида одного и того же: список, добавление и календарь. Разделены
 * шагами внутри окна, а не вкладками - на телефоне вкладки съедают
 * высоту, которой и так мало.
 *
 * Записи лежат в облаке Telegram: дневник без сохранности бессмыслен,
 * а память телефона чистится вместе с кэшем.
 */
export function TradeJournalModal({ open, onClose }: TradeJournalModalProps) {
    const [view, setView] = useState<View>('list');
    const [trades, setTrades] = useState<Trade[] | null>(null);

    const [date, setDate] = useState(todayKey());
    const [instrument, setInstrument] = useState('');
    const [direction, setDirection] = useState<TradeDirection>('long');
    const [outcome, setOutcome] = useState<TradeOutcome>('win');
    const [pnl, setPnl] = useState('');
    const [r, setR] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        loadTrades().then(setTrades);
    }, [open]);

    const stats = useMemo(() => calcStats(trades ?? []), [trades]);
    const byDay = useMemo(() => pnlByDay(trades ?? []), [trades]);

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
        const trade: Trade = {
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
        };

        setSaving(true);
        await saveTrade(trade);
        setSaving(false);

        setTrades(prev => [trade, ...(prev ?? [])]);
        resetForm();
        setView('list');
    };

    const remove = async (id: string) => {
        await deleteTrade(id);
        setTrades(prev => (prev ?? []).filter(t => t.id !== id));
    };

    /* ── Добавление ──────────────────────────────────────────────── */
    if (view === 'add') {
        return (
            <ModalWindow
                open={open}
                onClose={onClose}
                onBack={() => setView('list')}
                title="Новая сделка"
                subtitle="Заполните столько, сколько помните"
            >
                <div className={cn(PANEL, 'p-4 space-y-3')} style={PANEL_BG}>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="block text-[12px] text-muted-foreground mb-1.5">Дата</span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={cn(INPUT, 'font-mono tabular-nums')}
                            />
                        </label>
                        <label className="block">
                            <span className="block text-[12px] text-muted-foreground mb-1.5">Инструмент</span>
                            <input
                                value={instrument}
                                onChange={(e) => setInstrument(e.target.value)}
                                placeholder="EUR/USD"
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
                        <label className="block">
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
                        <label className="block">
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

                <Button className="w-full h-12 font-semibold" disabled={saving} onClick={submit}>
                    {saving ? 'Сохраняем...' : 'Записать сделку'}
                </Button>

                <p className="text-[11.5px] text-muted-foreground leading-relaxed px-1 pb-1">
                    Строка «почему вошли» важнее цифр: через месяц по ней видно, повторяете вы
                    решение или случайность.
                </p>
            </ModalWindow>
        );
    }

    /* ── Календарь сделок ────────────────────────────────────────── */
    if (view === 'calendar') {
        const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));

        return (
            <ModalWindow
                open={open}
                onClose={onClose}
                onBack={() => setView('list')}
                title="Календарь сделок"
                subtitle="Итог каждого дня, а не отдельной сделки"
            >
                {days.length === 0 ? (
                    <div className={cn(PANEL, 'p-6 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                        Пока нет ни одной записи
                    </div>
                ) : (
                    <div className={cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)]')} style={PANEL_BG}>
                        {days.map(([day, sum]) => {
                            const count = (trades ?? []).filter(t => t.date === day).length;
                            return (
                                <div key={day} className="flex items-center justify-between gap-3 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-[14px] text-foreground tabular-nums">
                                            {new Date(day).toLocaleDateString('ru-RU', {
                                                day: 'numeric', month: 'long', weekday: 'short',
                                            })}
                                        </p>
                                        <p className="text-[11.5px] text-muted-foreground">
                                            {count} {count === 1 ? 'сделка' : count < 5 ? 'сделки' : 'сделок'}
                                        </p>
                                    </div>
                                    <span
                                        className="font-mono font-bold text-[15px] tabular-nums flex-shrink-0"
                                        style={{ color: sum > 0 ? WIN : sum < 0 ? LOSS : 'hsl(var(--muted-foreground))' }}
                                    >
                                        {money(sum)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ModalWindow>
        );
    }

    /* ── Список и статистика ─────────────────────────────────────── */
    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Дневник сделок"
            subtitle="Записи хранятся в облаке Telegram"
        >
            <div
                className="rounded-[20px] border border-[hsl(142_34%_22%)] p-4"
                style={{ background: 'linear-gradient(168deg, hsl(142 26% 12%), hsl(140 28% 8%))' }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">Итог</p>
                        <p
                            className="font-mono font-bold text-[26px] leading-none tabular-nums mt-1"
                            style={{ color: stats.pnl > 0 ? WIN : stats.pnl < 0 ? LOSS : 'hsl(142 18% 40%)' }}
                        >
                            {stats.total > 0 ? money(stats.pnl) : '--'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">Прибыльных</p>
                        <p className="font-mono font-bold text-[26px] leading-none tabular-nums mt-1"
                            style={{ color: stats.total > 0 ? WIN : 'hsl(142 18% 40%)' }}>
                            {stats.total > 0 ? `${Math.round(stats.winrate)}%` : '--'}
                        </p>
                    </div>
                </div>

                {stats.total > 0 && (
                    <p className="text-[11.5px] text-muted-foreground mt-3 tabular-nums">
                        {stats.total} {stats.total === 1 ? 'сделка' : stats.total < 5 ? 'сделки' : 'сделок'}
                        {stats.avgR !== 0 && ` · средний результат ${stats.avgR.toFixed(2)}R`}
                        {stats.streak !== 0 && ` · серия ${Math.abs(stats.streak)} ${stats.streak > 0 ? 'в плюс' : 'в минус'}`}
                    </p>
                )}
            </div>

            <div className={cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)]')} style={PANEL_BG}>
                <TerminalRow
                    index={0}
                    icon={<Plus className="w-[18px] h-[18px]" />}
                    tone="green"
                    title="Записать сделку"
                    caption="Инструмент, исход, результат и почему вошли"
                    onClick={() => setView('add')}
                />
                <TerminalRow
                    index={1}
                    icon={<CalendarDays className="w-[18px] h-[18px]" />}
                    tone="cyan"
                    title="Календарь сделок"
                    caption="Итог по дням"
                    value={byDay.size > 0 ? String(byDay.size) : undefined}
                    onClick={() => setView('calendar')}
                />
            </div>

            {trades === null ? (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Читаем дневник...
                </div>
            ) : trades.length === 0 ? (
                <div className={cn(PANEL, 'p-6 text-center')} style={PANEL_BG}>
                    <LineChart className="w-7 h-7 mx-auto mb-2.5" style={{ color: 'hsl(142 20% 34%)' }} />
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Пусто. Первая запись занимает полминуты, а через месяц по ним видно,
                        что у вас работает, а что кажется работающим.
                    </p>
                </div>
            ) : (
                <div className={cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)]')} style={PANEL_BG}>
                    {trades.map((trade, index) => (
                        <motion.div
                            key={trade.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.22 }}
                            className="group flex items-start gap-3 px-3.5 py-3"
                        >
                            <span
                                className="w-1 self-stretch rounded-full flex-shrink-0"
                                style={{
                                    background: trade.outcome === 'win' ? WIN
                                        : trade.outcome === 'loss' ? LOSS
                                            : 'hsl(142 18% 30%)',
                                }}
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
                                <p className="text-[11.5px] text-muted-foreground tabular-nums mt-0.5">
                                    {new Date(trade.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                    {trade.r !== 0 && ` · ${trade.r > 0 ? '+' : ''}${trade.r}R`}
                                </p>
                                {trade.note && (
                                    <p className="text-[12px] text-muted-foreground/80 mt-1 line-clamp-2">
                                        {trade.note}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                    className="font-mono font-bold text-[14px] tabular-nums"
                                    style={{
                                        color: trade.pnl > 0 ? WIN : trade.pnl < 0 ? LOSS : 'hsl(var(--muted-foreground))',
                                    }}
                                >
                                    {money(trade.pnl)}
                                </span>
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
        </ModalWindow>
    );
}
