/**
 * Ежедневный подарок: одно место, где живёт ответ на вопрос
 * «забрал ли человек монеты сегодня».
 *
 * Отметка в браузере нужна только чтобы не показывать кнопку и
 * индикатор повторно. Настоящая защита от двойного начисления стоит
 * на сервере: ключ события - сегодняшняя дата, платформа держит
 * уникальность по паре «ученик + событие».
 */

const STORAGE_KEY = 'nmnh-daily-claimed';

/** Кто-то забрал подарок: панель снизу гасит индикатор без перезагрузки. */
export const DAILY_CLAIM_EVENT = 'nmnh-daily-claimed-change';

export function todayKey(): string {
    return dateKey(new Date());
}

export function dateKey(d: Date): string {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

/** Понедельник текущей недели - от него строится полоска дней. */
export function weekStart(): Date {
    const d = new Date();
    const shift = (d.getDay() + 6) % 7; // воскресенье в JS это 0
    d.setDate(d.getDate() - shift);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function loadClaimedDays(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : [];
    } catch {
        return []; // приватный режим - обойдёмся без памяти между заходами
    }
}

export function saveClaimedDays(days: string[]): void {
    try {
        // Хранить всю историю незачем: календарь показывает одну неделю
        localStorage.setItem(STORAGE_KEY, JSON.stringify(days.slice(-60)));
    } catch {
        /* память недоступна - подарок всё равно защищён на сервере */
    }
    window.dispatchEvent(new CustomEvent(DAILY_CLAIM_EVENT));
}

export function isClaimedToday(): boolean {
    return loadClaimedDays().includes(todayKey());
}
