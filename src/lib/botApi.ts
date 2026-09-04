/**
 * Общий доступ к серверу бота.
 *
 * В браузер не попадает ни секретный ключ платформы, ни чужой id: наружу
 * уходит только подписанный Telegram initData, а кто его прислал -
 * устанавливает бот, проверив подпись.
 */

export function botApiBase(): string {
    return import.meta.env.DEV
        ? '/bot-api'
        : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

export function initData(): string {
    return (window as { Telegram?: { WebApp?: { initData?: string } } })
        .Telegram?.WebApp?.initData || '';
}

export const BOT_API_HEADERS = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
} as const;

/**
 * Сколько ждём ответа бота.
 *
 * Без предела недоступный сервер держит обещание до таймаута браузера -
 * это десятки секунд, всё это время экран показывает заглушку и
 * выглядит сломанным. Восемь секунд с запасом хватает медленной сети.
 */
const TIMEOUT_MS = 8000;

/**
 * POST на сервер бота с подписью. null - мы вне Telegram, связи нет
 * или бот ответил отказом: экраны в этом случае просто не рисуют блок.
 */
export async function postSigned<T>(path: string, body: Record<string, unknown> = {}): Promise<T | null> {
    const data = initData();
    if (!data) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(`${botApiBase()}${path}`, {
            method: 'POST',
            headers: BOT_API_HEADERS,
            body: JSON.stringify({ initData: data, ...body }),
            signal: controller.signal,
        });
        const json = await res.json();
        return json?.success ? (json as T) : null;
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}
