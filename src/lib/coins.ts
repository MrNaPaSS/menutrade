/**
 * Монеты NMNH: сообщаем боту об учебных событиях.
 *
 * Секретный ключ платформы живёт на сервере бота и в браузер не попадает.
 * Отсюда уходит только подписанный Telegram initData - по нему бот
 * устанавливает, кто именно прошёл урок, и уже сам идёт на платформу.
 */

import { BOT_API_HEADERS, botApiBase, initData } from '@/lib/botApi';

export type CoinReason =
    | 'lesson_watched'
    | 'module_completed'
    | 'test_passed'
    | 'course_completed'
    | 'academy_joined'
    | 'daily_checkin';

interface BalanceInfo {
    balance: number;
    /** Есть ли запись ученика на платформе. Для новичка её ещё нет */
    exists: boolean;
    /** Заходил ли он в кабинет: если нет, стоит подсказать, где тратить */
    visited: boolean;
    shopUrl: string;
}

/**
 * Сколько монет даёт событие. Тарифы держит платформа, здесь копия -
 * чтобы показать «+5» до того, как придёт ответ сервера. Если тарифы
 * на платформе поменяют, поправить и тут.
 */
export const COIN_REWARDS: Record<CoinReason, number> = {
    lesson_watched: 5,
    academy_joined: 10,
    module_completed: 15,
    test_passed: 25,
    course_completed: 100,
    daily_checkin: 2,
};

/** Событие для всплывающей подсказки о начислении. */
export const COIN_EVENT = 'nmnh-coins-granted';

/**
 * Сообщает о событии. Ничего не возвращает и не бросает: начисление monet
 * не должно мешать учёбе. Повторы безопасны - платформа отсекает их по ref.
 */
export function sendCoinEvent(ref: string, reason: CoinReason): void {
    const data = initData();
    if (!data) return; // вне Telegram начислять некому

    fetch(`${botApiBase()}/coin-event`, {
        method: 'POST',
        headers: BOT_API_HEADERS,
        body: JSON.stringify({ initData: data, ref, reason }),
    })
        .then(res => res.json())
        .then(json => {
            // Показываем начисление только когда бот его принял: иначе
            // человек увидит монеты, которых нет
            if (json?.success) {
                window.dispatchEvent(new CustomEvent(COIN_EVENT, {
                    detail: { amount: COIN_REWARDS[reason], reason },
                }));
            }
        })
        .catch(() => {
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
            headers: BOT_API_HEADERS,
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
