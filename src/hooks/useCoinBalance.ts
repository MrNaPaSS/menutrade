import { useCallback, useEffect, useState } from 'react';
import { COIN_EVENT, fetchCoinBalance } from '@/lib/coins';

type Balance = Awaited<ReturnType<typeof fetchCoinBalance>>;

/**
 * Баланс монет NMNH для любого экрана.
 *
 * Запрос уходит один раз при появлении экрана и повторяется после
 * начисления: так число в главном меню и в профиле не отстаёт от
 * всплывающей подсказки «+5 за урок».
 *
 * null означает «показывать нечего»: человек вне Telegram или
 * платформа не ответила. Экраны в этом случае просто не рисуют блок.
 */
export function useCoinBalance(): { coins: Balance; loading: boolean; reload: () => void } {
    const [coins, setCoins] = useState<Balance>(null);
    // Пока первый запрос не вернулся, null означает «ещё не знаем», а не
    // «показывать нечего». Без этого экран сперва рисуется без блока
    // монет, а потом блок вклинивается и сдвигает всё под собой
    const [loading, setLoading] = useState(true);
    const [nonce, setNonce] = useState(0);

    const reload = useCallback(() => setNonce(n => n + 1), []);

    useEffect(() => {
        let cancelled = false;
        fetchCoinBalance().then(data => {
            if (cancelled) return;
            setCoins(data);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [nonce]);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        const onGrant = (e: Event) => {
            const amount = (e as CustomEvent).detail?.amount;
            // Сразу показываем новое число, а следом сверяемся с платформой:
            // ждать ответа сервера ради «+5» человеку незачем
            if (typeof amount === 'number') {
                setCoins(prev => (prev ? { ...prev, balance: prev.balance + amount } : prev));
            }
            // Пауза, чтобы начисление успело дойти до платформы: иначе
            // сверка вернёт прежнее число и оно на глазах уменьшится
            timers.push(setTimeout(reload, 2500));
        };

        window.addEventListener(COIN_EVENT, onGrant);
        return () => {
            window.removeEventListener(COIN_EVENT, onGrant);
            timers.forEach(clearTimeout);
        };
    }, [reload]);

    return { coins, loading, reload };
}
