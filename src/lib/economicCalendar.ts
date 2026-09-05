/**
 * Экономический календарь.
 *
 * Данные тянем прямо в приложении, без бота. Отсюда главное
 * ограничение, которое надо помнить: предупредить человека можно
 * только пока приложение открыто. Уведомление при закрытом приложении
 * умеет отправить только бот.
 *
 * Источник - недельная выгрузка ForexFactory: без ключа, отдаётся с
 * разрешением на чтение из браузера, и её же используют их собственные
 * виджеты. Ключ в веб-приложении всё равно был бы виден любому, кто
 * откроет исходники, поэтому источник без ключа здесь не компромисс,
 * а единственный честный вариант.
 *
 * Адрес можно подменить через VITE_CALENDAR_URL - на случай, если
 * выгрузка переедет или появится свой источник.
 */

const DEFAULT_SOURCE = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

/** Насколько событие двигает рынок */
export type Impact = 'high' | 'medium' | 'low';

export interface CalendarEvent {
    id: string;
    title: string;
    /** Валюта: USD, EUR, GBP */
    currency: string;
    at: Date;
    impact: Impact;
    forecast: string;
    previous: string;
}

interface RawEvent {
    title?: string;
    country?: string;
    date?: string;
    impact?: string;
    forecast?: string;
    previous?: string;
}

function toImpact(raw: string | undefined): Impact {
    const value = (raw ?? '').toLowerCase();
    if (value.startsWith('high')) return 'high';
    if (value.startsWith('med')) return 'medium';
    return 'low';
}

/**
 * Тянет события на неделю.
 *
 * Ошибку не глотаем: экран должен сказать, что данных нет, а не
 * притвориться, будто событий на неделе не случилось.
 */
export async function fetchCalendar(signal?: AbortSignal): Promise<CalendarEvent[]> {
    const source = import.meta.env.VITE_CALENDAR_URL || DEFAULT_SOURCE;

    const res = await fetch(source, { signal });
    if (!res.ok) throw new Error(`Календарь недоступен: ${res.status}`);

    const raw = (await res.json()) as RawEvent[];
    if (!Array.isArray(raw)) throw new Error('Календарь вернул неожиданный ответ');

    return raw
        .map((item, index): CalendarEvent | null => {
            if (!item.title || !item.date) return null;

            const at = new Date(item.date);
            if (Number.isNaN(at.getTime())) return null;

            return {
                // Заголовок повторяется у разных валют, дата - у разных
                // событий, поэтому ключ собираем из обоих плюс номер
                id: `${item.date}-${item.country ?? ''}-${index}`,
                title: item.title,
                currency: (item.country ?? '').toUpperCase(),
                at,
                impact: toImpact(item.impact),
                forecast: item.forecast ?? '',
                previous: item.previous ?? '',
            };
        })
        .filter((item): item is CalendarEvent => item !== null)
        .sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** Сколько минут осталось до события. Отрицательное - уже прошло */
export function minutesUntil(event: CalendarEvent, now = Date.now()): number {
    return Math.round((event.at.getTime() - now) / 60_000);
}

/**
 * Ближайшее важное событие впереди.
 *
 * Мелкие события отсеиваем: предупреждать о них - значит приучить
 * не смотреть на предупреждения вовсе.
 */
export function nextImportant(
    events: CalendarEvent[],
    now = Date.now(),
): CalendarEvent | null {
    return events.find(e => e.impact === 'high' && e.at.getTime() > now) ?? null;
}

/** Раскладывает события по дням в порядке времени */
export function groupByDay(events: CalendarEvent[]): Array<[string, CalendarEvent[]]> {
    const days = new Map<string, CalendarEvent[]>();

    for (const event of events) {
        const key = event.at.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
        const list = days.get(key);
        if (list) {
            list.push(event);
        } else {
            days.set(key, [event]);
        }
    }

    return [...days.entries()];
}

/** Время события в часовом поясе телефона */
export function formatTime(event: CalendarEvent): string {
    return event.at.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** «через 2 ч 15 мин», «через 8 мин», «идёт сейчас» */
export function formatCountdown(minutes: number): string {
    if (minutes <= 0 && minutes > -60) return 'идёт сейчас';
    if (minutes <= 0) return 'прошло';

    if (minutes < 60) return `через ${minutes} мин`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours < 24) return rest > 0 ? `через ${hours} ч ${rest} мин` : `через ${hours} ч`;

    const days = Math.floor(hours / 24);
    return `через ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
}
