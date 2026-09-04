import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins } from 'lucide-react';
import { sendCoinEvent } from '@/lib/coins';
import { cn } from '@/lib/utils';

/** Монет за день. Значение назначает бот, здесь оно только для показа. */
const DAILY_COINS = 2;

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function todayKey(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

/** Понедельник текущей недели - от него строим полоску дней. */
function weekStart(): Date {
    const d = new Date();
    const shift = (d.getDay() + 6) % 7; // воскресенье в JS это 0
    d.setDate(d.getDate() - shift);
    d.setHours(0, 0, 0, 0);
    return d;
}

function dateKey(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

const STORAGE_KEY = 'nmnh-daily-claimed';

function loadClaimed(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Календарь ежедневных монет.
 *
 * Забрать дважды за день нельзя: ключ события - сегодняшняя дата, а
 * платформа держит уникальность по паре «ученик + событие». Отметка
 * в браузере нужна лишь чтобы не показывать кнопку повторно; настоящая
 * защита стоит на сервере.
 */
export function DailyCalendar() {
    const [claimed, setClaimed] = useState<string[]>(loadClaimed);
    const [sending, setSending] = useState(false);

    const today = todayKey();
    const takenToday = claimed.includes(today);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(claimed.slice(-60)));
        } catch {
            /* приватный режим - обойдёмся без памяти между заходами */
        }
    }, [claimed]);

    const claim = useCallback(() => {
        if (takenToday || sending) return;
        setSending(true);
        sendCoinEvent(`daily_${today}`, 'daily_checkin');
        setClaimed(prev => [...prev, today]);
        setTimeout(() => setSending(false), 600);
    }, [takenToday, sending, today]);

    const start = weekStart();
    const days = WEEK_DAYS.map((label, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = dateKey(date);
        return {
            label,
            key,
            number: date.getDate(),
            isToday: key === today,
            isPast: key < today,
            isTaken: claimed.includes(key),
        };
    });

    return (
        <div className="glass-card rounded-xl p-4 sm:p-5 neon-border">
            <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display font-bold text-base">Заходи каждый день</h3>
                <span className="text-xs text-muted-foreground">+{DAILY_COINS} монеты</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-3">
                {days.map(day => (
                    <div key={day.key} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{day.label}</span>
                        <div className={cn(
                            'w-full aspect-square rounded-lg flex items-center justify-center',
                            'text-xs font-semibold tabular-nums border transition-colors',
                            day.isTaken
                                ? 'bg-primary/15 border-primary/40 text-primary'
                                : day.isToday
                                    ? 'border-primary/50 text-primary'
                                    : day.isPast
                                        ? 'border-border/30 text-muted-foreground/40'
                                        : 'border-border/30 text-muted-foreground/60'
                        )}>
                            {day.isTaken ? <Check className="w-3.5 h-3.5" /> : day.number}
                        </div>
                    </div>
                ))}
            </div>

            <motion.button
                onClick={claim}
                disabled={takenToday}
                whileTap={takenToday ? undefined : { scale: 0.98 }}
                className={cn(
                    'w-full rounded-xl py-3 font-medium flex items-center justify-center gap-2',
                    'transition-colors',
                    takenToday
                        ? 'bg-muted/20 text-muted-foreground cursor-default'
                        : 'bg-primary text-primary-foreground'
                )}
            >
                {takenToday ? (
                    <>
                        <Check className="w-4 h-4" />
                        Сегодня забрано
                    </>
                ) : (
                    <>
                        <Coins className="w-4 h-4" />
                        Забрать {DAILY_COINS} монеты
                    </>
                )}
            </motion.button>
        </div>
    );
}
