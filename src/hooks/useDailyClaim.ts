import { useCallback, useEffect, useState } from 'react';
import { DAILY_CLAIM_EVENT, isClaimedToday, loadClaimedDays, saveClaimedDays, todayKey } from '@/lib/daily';

/**
 * Состояние ежедневного подарка.
 *
 * Календарь им забирает монеты, нижняя панель по нему решает, зажигать
 * ли красную точку у подарка. Оба слушают одно событие, поэтому точка
 * гаснет сразу после нажатия, без перехода между экранами.
 */
export function useDailyClaim() {
    const [days, setDays] = useState<string[]>(loadClaimedDays);

    useEffect(() => {
        const sync = () => setDays(loadClaimedDays());

        window.addEventListener(DAILY_CLAIM_EVENT, sync);
        // storage срабатывает в других вкладках - в Telegram редкость,
        // но в браузере человек может открыть академию дважды
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(DAILY_CLAIM_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const markClaimed = useCallback(() => {
        const next = [...loadClaimedDays(), todayKey()];
        saveClaimedDays(next);
        setDays(next);
    }, []);

    return {
        claimedDays: days,
        takenToday: days.includes(todayKey()),
        markClaimed,
    };
}

export { isClaimedToday };
