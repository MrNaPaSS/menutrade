/**
 * Какие курсы открыты этому человеку.
 *
 * Решает бот: курс открывается тому, чей счёт на соответствующей
 * площадке подтверждён администратором. Из браузера это не подделать -
 * наружу уходит только подписанный initData.
 *
 * Названия здесь - названия курсов, а не рынков бота. В базе бота рынок
 * Pocket Option исторически зовётся forex, хотя торгуют там бинарными
 * опционами; расхождение заканчивается на стороне сервера.
 */

import { postSigned } from '@/lib/botApi';
// Тип берём из реестра курсов, чтобы определение было одно.
// import type стирается при сборке - данные курсов сюда не попадут
import type { CourseId } from '@/data/courses';

export type { CourseId };

/** open - учись; pending - ID отправлен, ждём проверки; closed - закрыт. */
export type AccessState = 'open' | 'pending' | 'closed';

export interface CourseAccess {
    courses: Record<CourseId, AccessState>;
    /** Площадка, которая открывает курс: «WEEX», «FxPro», «Pocket Option» */
    partners: Record<CourseId, string>;
}

const CLOSED: Record<CourseId, AccessState> = {
    binary: 'closed',
    forex: 'closed',
    crypto: 'closed',
};

export async function fetchCourseAccess(): Promise<CourseAccess | null> {
    const data = await postSigned<CourseAccess>('/course-access');
    if (!data?.courses) return null;

    return {
        courses: { ...CLOSED, ...data.courses },
        partners: data.partners || ({} as Record<CourseId, string>),
    };
}
