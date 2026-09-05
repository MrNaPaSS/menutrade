import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import {
    fetchCalendar, formatCountdown, formatTime, groupByDay, minutesUntil, nextImportant,
    type CalendarEvent, type Impact,
} from '@/lib/economicCalendar';
import { cn } from '@/lib/utils';

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';

/**
 * Запасной виджет.
 *
 * Свой источник закрыт заголовками для чтения из браузера, и запрос
 * может не пройти. Тогда показываем то, что работало раньше: календарь
 * без предупреждений лучше, чем пустой раздел.
 */
const FALLBACK_WIDGET =
    'https://s.tradingview.com/embed-widget/events/?locale=ru' +
    '#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C' +
    '%22width%22%3A%22100%25%22%2C%22height%22%3A%22520%22%2C' +
    '%22importanceFilter%22%3A%22-1%2C0%2C1%22%7D';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/** За сколько минут до важного события зажигаем предупреждение */
const WARN_MINUTES = 30;

const IMPACT_TONE: Record<Impact, { dot: string; label: string }> = {
    high: { dot: 'hsl(0 72% 62%)', label: 'важное' },
    medium: { dot: 'hsl(38 92% 62%)', label: 'среднее' },
    low: { dot: 'hsl(142 18% 42%)', label: 'слабое' },
};

/**
 * Календарь событий.
 *
 * Своя вёрстка вместо встроенного виджета: виджет - чужая страница в
 * рамке, из неё нельзя прочитать ни одного события, а значит нельзя и
 * предупредить о нём.
 *
 * Предупреждение работает, пока приложение открыто. Уведомление при
 * закрытом приложении умеет отправить только бот - это следующий шаг,
 * и здесь его не изображаем.
 */
export function EconomicCalendar() {
    const [events, setEvents] = useState<CalendarEvent[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Отсчёт живёт своим тиком: перезапрашивать календарь ради минут
    // незачем, а число должно меняться на глазах
    const [now, setNow] = useState(() => Date.now());
    const [onlyImportant, setOnlyImportant] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        fetchCalendar(controller.signal)
            .then(setEvents)
            .catch((e: unknown) => {
                if (controller.signal.aborted) return;
                setError(e instanceof Error ? e.message : 'Не удалось загрузить календарь');
            });

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(id);
    }, []);

    const upcoming = useMemo(
        () => (events ? nextImportant(events, now) : null),
        [events, now]
    );
    const upcomingMinutes = upcoming ? minutesUntil(upcoming, now) : 0;
    const warnNow = upcoming !== null && upcomingMinutes > 0 && upcomingMinutes <= WARN_MINUTES;

    const shown = useMemo(() => {
        if (!events) return [];
        // Прошедшие события за сегодня оставляем: по ним сверяют факт
        // с прогнозом. Дни целиком в прошлом убираем
        const dayAgo = now - 24 * 60 * 60 * 1000;
        return events
            .filter(e => e.at.getTime() > dayAgo)
            .filter(e => (onlyImportant ? e.impact !== 'low' : true));
    }, [events, now, onlyImportant]);

    const days = useMemo(() => groupByDay(shown), [shown]);

    // Источник закрыт для чтения из браузера, поэтому запрос может не
    // пройти. В этом случае показываем прежний виджет: раздел должен
    // работать, даже если своих данных нет
    if (error) {
        return (
            <iframe
                src={FALLBACK_WIDGET}
                title="Экономический календарь"
                loading="lazy"
                className="w-full h-[560px] sm:h-[640px] md:h-[720px] border-0 block
                           rounded-[18px] overflow-hidden"
                sandbox="allow-scripts allow-same-origin allow-popups"
            />
        );
    }

    if (!events) {
        return (
            <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                Загружаем события недели...
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Предупреждение о ближайшем важном событии */}
            {upcoming && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                        'rounded-[18px] p-4 border',
                        warnNow
                            ? 'border-amber-500/30 bg-amber-500/[0.07]'
                            : 'border-[hsl(142_30%_20%)]'
                    )}
                    style={warnNow ? undefined : { background: 'linear-gradient(168deg, hsl(142 26% 12%), hsl(140 28% 8%))' }}
                >
                    <div className="flex items-start gap-3">
                        {warnNow && <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />}

                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                                {warnNow ? 'Скоро выход данных' : 'Ближайшее важное'}
                            </p>
                            <p className="font-semibold text-[15.5px] text-foreground mt-1 leading-snug">
                                {upcoming.currency} · {upcoming.title}
                            </p>
                            <p className="text-[12.5px] text-muted-foreground mt-1 tabular-nums">
                                {formatTime(upcoming)} · {formatCountdown(upcomingMinutes)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Мелкие события прячем по умолчанию: их на неделе сотни, и
                среди них теряются те, что вправду двигают рынок */}
            <button
                onClick={() => setOnlyImportant(v => !v)}
                className="flex items-center gap-2 text-[12.5px] text-muted-foreground
                           hover:text-foreground transition-colors px-1"
            >
                <span
                    className={cn(
                        'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
                        onlyImportant ? 'bg-primary/40' : 'bg-white/[0.08]'
                    )}
                >
                    <span
                        className={cn(
                            'absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform',
                            onlyImportant ? 'translate-x-[18px]' : 'translate-x-0.5'
                        )}
                    />
                </span>
                Только значимые
            </button>

            {days.length === 0 ? (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    На эту неделю событий не осталось
                </div>
            ) : (
                days.map(([day, list]) => (
                    <div key={day}>
                        <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground px-1 mb-1.5">
                            {day}
                        </p>

                        <div
                            className={cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)]')}
                            style={PANEL_BG}
                        >
                            {list.map(event => {
                                const left = minutesUntil(event, now);
                                const past = left <= -60;

                                return (
                                    <div
                                        key={event.id}
                                        className={cn('flex items-start gap-3 px-3.5 py-3', past && 'opacity-45')}
                                    >
                                        <span className="font-mono text-[13px] tabular-nums text-muted-foreground
                                                         w-11 flex-shrink-0 pt-0.5">
                                            {formatTime(event)}
                                        </span>

                                        <span
                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
                                            style={{ background: IMPACT_TONE[event.impact].dot }}
                                            aria-label={IMPACT_TONE[event.impact].label}
                                        />

                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[13.5px] text-foreground leading-snug">
                                                {event.title}
                                            </span>
                                            <span className="block text-[11.5px] text-muted-foreground mt-0.5 tabular-nums">
                                                {event.currency}
                                                {event.forecast && ` · прогноз ${event.forecast}`}
                                                {event.previous && ` · было ${event.previous}`}
                                            </span>
                                        </span>

                                        {!past && left > 0 && left < 24 * 60 && (
                                            <span className="text-[11px] text-muted-foreground tabular-nums
                                                             flex-shrink-0 pt-0.5">
                                                {formatCountdown(left)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
