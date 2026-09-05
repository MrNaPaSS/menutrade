/**
 * Сколько вопросов AI-ментору можно задать без доступа.
 *
 * Раньше агент работал без ограничений: человек без счёта получал
 * бесплатного аналитика и не имел причины открывать доступ. Три вопроса
 * в сутки - достаточно, чтобы увидеть, как ментор отвечает, и мало,
 * чтобы им пользоваться вместо академии.
 *
 * Счётчик живёт в localStorage: он не про безопасность, а про
 * вежливую остановку. Обходится очисткой хранилища - и пусть, ключ от
 * материалов академии он всё равно не даёт.
 */

export const AI_FREE_QUESTIONS = 3;

const KEY = 'nmnh_ai_quota_v1';

interface Quota {
    /** День в виде ГГГГ-ММ-ДД по местному времени */
    day: string;
    used: number;
}

function today(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function read(): Quota {
    const empty: Quota = { day: today(), used: 0 };

    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return empty;

        const parsed = JSON.parse(raw) as Partial<Quota>;
        // Счётчик за вчера начинаем заново
        if (typeof parsed?.day !== 'string' || parsed.day !== empty.day) return empty;
        if (typeof parsed.used !== 'number' || !Number.isFinite(parsed.used)) return empty;

        return { day: parsed.day, used: Math.max(0, Math.floor(parsed.used)) };
    } catch {
        // Приватный режим или запрет на хранилище: считаем, что вопросов
        // ещё не было. Лучше отдать лишний ответ, чем сломать чат
        return empty;
    }
}

/** Сколько вопросов осталось сегодня */
export function questionsLeft(): number {
    return Math.max(0, AI_FREE_QUESTIONS - read().used);
}

/** Отмечает заданный вопрос и возвращает остаток */
export function countQuestion(): number {
    const current = read();
    const next: Quota = { day: current.day, used: current.used + 1 };

    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // Не записалось - ничего страшного, ограничение просто не сработает
    }

    return Math.max(0, AI_FREE_QUESTIONS - next.used);
}
