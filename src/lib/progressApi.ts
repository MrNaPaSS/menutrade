/**
 * Прогресс учёбы на сервере бота.
 *
 * Источник правды - сервер: браузер чистят, телефон меняют, а учёба
 * должна оставаться. Наружу уходит подписанный initData, кому он
 * принадлежит - устанавливает бот.
 *
 * Слияние на сервере одностороннее: присланное досыпается к
 * сохранённому. Пустой клиент ничего не стирает, обнулить прогресс
 * можно только явным сбросом.
 */

import { postSigned } from '@/lib/botApi';

export interface StoredProgress {
    /** Ключи вида "module-1:lesson-2" */
    completed: string[];
    master_test: boolean;
}

interface ProgressResponse {
    progress: StoredProgress;
}

function clean(data: ProgressResponse | null): StoredProgress | null {
    if (!data?.progress) return null;
    return {
        completed: Array.isArray(data.progress.completed) ? data.progress.completed : [],
        master_test: !!data.progress.master_test,
    };
}

/** null - мы вне Telegram или бот недоступен: работаем на локальной копии. */
export async function fetchProgress(): Promise<StoredProgress | null> {
    return clean(await postSigned<ProgressResponse>('/progress'));
}

export async function saveProgress(progress: StoredProgress): Promise<StoredProgress | null> {
    return clean(await postSigned<ProgressResponse>('/progress-save', { progress }));
}

/** Осознанный сброс - единственный способ обнулить прогресс на сервере. */
export async function resetProgressOnServer(): Promise<StoredProgress | null> {
    return clean(await postSigned<ProgressResponse>('/progress-save', { reset: true }));
}
