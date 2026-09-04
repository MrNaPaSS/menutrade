import { useEffect, useState } from 'react';
import { fetchCourseAccess, type AccessState, type CourseId } from '@/lib/courseAccess';

interface CourseAccessState {
    courses: Record<CourseId, AccessState>;
    partners: Record<CourseId, string>;
    /** Идёт ли ещё запрос */
    loading: boolean;
    /** Бот не ответил: вне Telegram, нет связи или сервер не поднят */
    offline: boolean;
}

const ALL_CLOSED: Record<CourseId, AccessState> = {
    binary: 'closed',
    forex: 'closed',
    crypto: 'closed',
};

const CACHE_KEY = 'nmnh-course-access';

function loadCache(): { courses: Record<CourseId, AccessState>; partners: Record<CourseId, string> } | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.courses ? parsed : null;
    } catch {
        return null;
    }
}

function saveCache(value: { courses: Record<CourseId, AccessState>; partners: Record<CourseId, string> }): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    } catch {
        /* памяти нет - обойдёмся, просто спросим бота в следующий раз */
    }
}

/**
 * Доступ к курсам.
 *
 * Решение принимает бот. Но недоступный сервер не должен отбирать
 * учёбу: пока идёт запрос и если он не удался, работает последний
 * известный ответ из памяти браузера. Иначе перезапуск бота или
 * секунда без сети обнуляют человеку все счётчики и прячут курс,
 * который он проходит.
 *
 * Кэш только смягчает перебои - выдать доступ он не может: там лежит
 * ровно то, что бот когда-то ответил этому же человеку.
 */
export function useCourseAccess(): CourseAccessState {
    const [state, setState] = useState<CourseAccessState>(() => {
        const cached = loadCache();
        return {
            courses: cached?.courses ?? ALL_CLOSED,
            partners: cached?.partners ?? ({} as Record<CourseId, string>),
            loading: true,
            offline: false,
        };
    });

    useEffect(() => {
        let cancelled = false;

        fetchCourseAccess().then(data => {
            if (cancelled) return;

            if (data) {
                saveCache(data);
                setState({ ...data, loading: false, offline: false });
                return;
            }

            // Не ответил - остаёмся на том, что показывали, и говорим об этом
            setState(prev => ({ ...prev, loading: false, offline: true }));
        });

        return () => { cancelled = true; };
    }, []);

    return state;
}
