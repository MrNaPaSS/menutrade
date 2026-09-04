/**
 * Монеты NMNH: сообщаем боту об учебных событиях.
 *
 * Секретный ключ платформы живёт на сервере бота и в браузер не попадает.
 * Отсюда уходит только подписанный Telegram initData - по нему бот
 * устанавливает, кто именно прошёл урок, и уже сам идёт на платформу.
 */

export type CoinReason =
    | 'lesson_watched'
    | 'module_completed'
    | 'test_passed'
    | 'course_completed'
    | 'academy_joined';

interface BalanceInfo {
    balance: number;
    /** Есть ли запись ученика на платформе. Для новичка её ещё нет */
    exists: boolean;
    /** Заходил ли он в кабинет: если нет, стоит подсказать, где тратить */
    visited: boolean;
    shopUrl: string;
}

function botApiBase(): string {
    return import.meta.env.DEV
        ? '/bot-api'
        : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

function initData(): string {
    return (window as { Telegram?: { WebApp?: { initData?: string } } })
        .Telegram?.WebApp?.initData || '';
}

/**
 * Сообщает о событии. Ничего не возвращает и не бросает: начисление monet
 * не должно мешать учёбе. Повторы безопасны - платформа отсекает их по ref.
 */
export function sendCoinEvent(ref: string, reason: CoinReason): void {
    const data = initData();
    if (!data) return; // вне Telegram начислять некому

    fetch(`${botApiBase()}/coin-event`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ initData: data, ref, reason }),
    }).catch(() => {
        /* Связи нет - бот доначислит из очереди при следующем событии */
    });
}

/** Баланс монет. null - платформа недоступна или мы вне Telegram. */
export async function fetchCoinBalance(): Promise<BalanceInfo | null> {
    const data = initData();
    if (!data) return null;

    try {
        const res = await fetch(`${botApiBase()}/coin-balance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({ initData: data }),
        });
        const json = await res.json();
        if (!json.success) return null;

        return {
            balance: json.balance ?? 0,
            exists: !!json.exists,
            visited: !!json.visited,
            shopUrl: json.shop_url || 'https://www.nmnh.trade/app/shop',
        };
    } catch {
        return null;
    }
}
