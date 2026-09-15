import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_WINDOW, fetchTradingStats, type TradingStats } from '@/lib/tradingStats';

interface TradingStatsView {
    /** Окно в днях: 7, 30 или 90 */
    days: number;
    setDays: (days: number) => void;
    stats: TradingStats | null;
    loading: boolean;
    /** Платформа не ответила. Нули в этом случае рисовать нельзя */
    offline: boolean;
    reload: () => void;
}

/**
 * Торговая сводка для экрана статистики.
 *
 * Запрос уходит только когда экран открыт: каждый вызов идёт через
 * бота на платформу, и держать его на фоне ради числа, которого не
 * видно, незачем.
 *
 * Прежние цифры при смене окна остаются на месте до прихода новых:
 * если убирать их на время запроса, экран на каждом переключении
 * схлопывается и прыгает.
 */
export function useTradingStats(active: boolean): TradingStatsView {
    const [days, setDays] = useState(DEFAULT_WINDOW);
    const [stats, setStats] = useState<TradingStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [offline, setOffline] = useState(false);
    const [nonce, setNonce] = useState(0);

    const reload = useCallback(() => setNonce(n => n + 1), []);

    useEffect(() => {
        if (!active) return;

        let cancelled = false;
        setLoading(true);

        fetchTradingStats(days).then(data => {
            if (cancelled) return;
            // Ответа нет - прежние цифры уже не про это окно, убираем
            setStats(data);
            setOffline(data === null);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [active, days, nonce]);

    return { days, setDays, stats, loading, offline, reload };
}
