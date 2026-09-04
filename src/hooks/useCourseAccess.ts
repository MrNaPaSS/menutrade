import { useEffect, useState } from 'react';
import { fetchCourseAccess, type AccessState, type CourseId } from '@/lib/courseAccess';

interface CourseAccessState {
    courses: Record<CourseId, AccessState>;
    partners: Record<CourseId, string>;
    /** Пока идёт запрос, открытых курсов не показываем - иначе мигнёт */
    loading: boolean;
    /** Бот не ответил: вне Telegram или нет связи */
    offline: boolean;
}

const ALL_CLOSED: Record<CourseId, AccessState> = {
    binary: 'closed',
    forex: 'closed',
    crypto: 'closed',
};

/**
 * Доступ к курсам.
 *
 * Решение принимает бот, здесь оно только отображается. Если бот не
 * ответил, курсы не открываются сами собой: доступ - это то, за что
 * человек регистрируется у партнёра, и выдавать его по молчанию сети
 * нельзя.
 */
export function useCourseAccess(): CourseAccessState {
    const [state, setState] = useState<CourseAccessState>({
        courses: ALL_CLOSED,
        partners: {} as Record<CourseId, string>,
        loading: true,
        offline: false,
    });

    useEffect(() => {
        let cancelled = false;

        fetchCourseAccess().then(data => {
            if (cancelled) return;
            setState({
                courses: data?.courses ?? ALL_CLOSED,
                partners: data?.partners ?? ({} as Record<CourseId, string>),
                loading: false,
                offline: !data,
            });
        });

        return () => { cancelled = true; };
    }, []);

    return state;
}
