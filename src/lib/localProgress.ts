/**
 * Локальная копия прогресса.
 *
 * Раньше в localStorage лежало всё дерево модулей вместе с текстами
 * уроков. Его разбирали при запуске и записывали заново при каждом
 * закрытом уроке - сотни килобайт JSON синхронно, в главном потоке.
 * Отсюда и заминка на первом кадре, и подтормаживание в момент, когда
 * человек дочитал урок.
 *
 * Теперь хранятся только ключи закрытых уроков - тот же вид, что уходит
 * на сервер. Тексты берутся из данных курса, блокировки выводятся.
 */

interface LocalProgress {
    completed: string[];
}

/**
 * Достаёт ключи закрытых уроков.
 *
 * Понимает и старый вид записи - дерево модулей: иначе у всех, кто уже
 * учился, прогресс обнулился бы при первом же обновлении.
 */
export function loadLocalCompleted(key: string): string[] {
    let raw: string | null;
    try {
        raw = localStorage.getItem(key);
    } catch {
        return []; // приватный режим - обойдёмся без локальной копии
    }
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);

        // Новый вид: только ключи
        if (parsed && Array.isArray((parsed as LocalProgress).completed)) {
            return (parsed as LocalProgress).completed.filter(k => typeof k === 'string');
        }

        // Старый вид: дерево модулей с уроками и текстами
        if (Array.isArray(parsed)) {
            const keys: string[] = [];
            parsed.forEach((module: { id?: string; lessons?: { id?: string; isCompleted?: boolean }[] }) => {
                if (!module?.id || !Array.isArray(module.lessons)) return;
                module.lessons.forEach(lesson => {
                    if (lesson?.id && lesson.isCompleted) keys.push(`${module.id}:${lesson.id}`);
                });
            });
            return keys;
        }
    } catch {
        /* запись повреждена - начинаем с чистого листа, сервер дополнит */
    }

    return [];
}

/**
 * Сохраняет ключи закрытых уроков.
 *
 * Пустой список поверх непустого не пишется. Это предохранитель, а не
 * тонкость: стоило приложению на секунду решить, что уроков у человека
 * нет - недоступный сервер, закрытый курс, ошибка в расчёте, - и запись
 * стирала накопленное безвозвратно. Именно так и произошло. Обнулить
 * можно только осознанным сбросом, у него отдельный флаг.
 */
export function saveLocalCompleted(key: string, completed: string[], allowEmpty = false): void {
    try {
        if (completed.length === 0 && !allowEmpty && loadLocalCompleted(key).length > 0) {
            return;
        }
        localStorage.setItem(key, JSON.stringify({ completed }));
    } catch {
        /* места нет или приватный режим - прогресс всё равно на сервере */
    }
}
