import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins } from 'lucide-react';
import { GraffitiStar } from '@/components/graffiti/Graffiti';
import { sendCoinEvent } from '@/lib/coins';
import { dateKey, todayKey, weekStart } from '@/lib/daily';
import { useDailyClaim } from '@/hooks/useDailyClaim';
import { cn } from '@/lib/utils';

/** Монет за день. Значение назначает бот, здесь оно только для показа. */
const DAILY_COINS = 2;

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Календарь ежедневных монет.
 *
 * Забрать дважды за день нельзя: ключ события - сегодняшняя дата, а
 * платформа держит уникальность по паре «ученик + событие». Отметка
 * в браузере нужна лишь чтобы не показывать кнопку повторно; настоящая
 * защита стоит на сервере.
 */
export function DailyCalendar() {
    const { claimedDays, takenToday, markClaimed } = useDailyClaim();
    const [sending, setSending] = useState(false);
    const [failed, setFailed] = useState(false);

    const today = todayKey();

    const claim = useCallback(async () => {
        if (takenToday || sending) return;
        setSending(true);
        setFailed(false);

        // Отмечаем забранным только после ответа бота. Раньше отметка
        // ставилась сразу: если начисление не проходило, кнопка гасла,
        // монет не было, и повторить человек уже не мог
        //
        // Отмечаем местный день, а не серверный: календарь и кнопка
        // живут во времени телефона, и подставлять туда чужую дату -
        // плодить путаницу на границе суток. За то, чтобы монеты не
        // ушли дважды, отвечает ключ события на сервере
        const accepted = await sendCoinEvent(`daily_${today}`, 'daily_checkin');
        if (accepted === null) {
            setFailed(true);
        } else {
            markClaimed();
        }
        setSending(false);
    }, [takenToday, sending, today, markClaimed]);

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
            isTaken: claimedDays.includes(key),
        };
    });

    return (
        <div className="rounded-[18px] border border-[hsl(142_26%_15%)] p-4 sm:p-5"
            style={{ background: 'hsl(140 26% 8%)' }}>
            <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-bold text-base">Заходи каждый день</h3>
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
                            {day.isTaken
                                ? <GraffitiStar className="w-4 h-4" />
                                : day.number}
                        </div>
                    </div>
                ))}
            </div>

            <motion.button
                onClick={claim}
                disabled={takenToday || sending}
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
                ) : sending ? (
                    'Забираем...'
                ) : (
                    <>
                        <Coins className="w-4 h-4" />
                        Забрать {DAILY_COINS} монеты
                    </>
                )}
            </motion.button>

            {/* Отказ не прячем: человек должен знать, что монеты не
                пришли, и что кнопка осталась рабочей */}
            {failed && (
                <p className="text-xs text-amber-400/90 mt-2 text-center">
                    Не получилось забрать. Попробуйте ещё раз через минуту
                </p>
            )}
        </div>
    );
}
