/**
 * Перевод прогресса между двумя видами.
 *
 * Приложение держит модули целиком - с содержимым уроков, блокировками
 * и флагами. Серверу этого знать не нужно: он хранит только факты, то
 * есть ключи закрытых уроков. Курс ещё дописывается, и структура на
 * сервере устарела бы в первый же день.
 *
 * Блокировки не хранятся нигде: они выводятся из закрытых уроков.
 */

import type { Module } from '@/types/lesson';

export function lessonKey(moduleId: string, lessonId: string): string {
    return `${moduleId}:${lessonId}`;
}

/** Ключи всех закрытых уроков - в таком виде прогресс уходит на сервер. */
export function collectCompleted(modules: Module[]): string[] {
    const keys: string[] = [];
    modules.forEach(module => {
        module.lessons.forEach(lesson => {
            if (lesson.isCompleted) keys.push(lessonKey(module.id, lesson.id));
        });
    });
    return keys.sort();
}

/**
 * Раскладывает ключи обратно по модулям.
 *
 * Первый урок модуля открыт всегда, следующий - когда закрыт
 * предыдущий. Так пришедший с сервера прогресс сразу открывает
 * нужные уроки, и отдельно хранить блокировки не приходится.
 */
export function applyCompleted(modules: Module[], completed: string[]): Module[] {
    const done = new Set(completed);

    return modules.map(module => {
        const lessons = module.lessons.map(lesson => ({
            ...lesson,
            isCompleted: done.has(lessonKey(module.id, lesson.id)),
        }));

        return {
            ...module,
            lessons: lessons.map((lesson, index) => ({
                ...lesson,
                isLocked: index > 0 && !lessons[index - 1].isCompleted,
            })),
            isCompleted: lessons.length > 0 && lessons.every(l => l.isCompleted),
        };
    });
}

/** Объединение двух наборов: прогресс только прибавляется. */
export function unionCompleted(a: string[], b: string[]): string[] {
    return Array.from(new Set([...a, ...b])).sort();
}

/** Одинаковы ли наборы - чтобы не слать на сервер то, что он уже знает. */
export function sameCompleted(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((key, i) => key === b[i]);
}

/**
 * Какому курсу принадлежит ключ урока.
 *
 * Приставки те же, что знает бот (COURSE_PREFIX в academy_access.py):
 * crypto-*, fx-*, а без приставки - бинарные опционы, первый курс
 * академии. Менять их здесь, не поправив там, нельзя.
 */
export function courseOfKey(key: string): string | null {
    if (!key.includes(':')) return null;
    if (key.startsWith('crypto-')) return 'crypto';
    if (key.startsWith('fx-')) return 'forex';
    return 'binary';
}

/** Курсы, где уже есть пройденные уроки. */
export function startedCourses(completed: string[]): Set<string> {
    const found = new Set<string>();
    completed.forEach(key => {
        const course = courseOfKey(key);
        if (course) found.add(course);
    });
    return found;
}
