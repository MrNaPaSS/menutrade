import { useCallback, useEffect, useState } from 'react';
import { deleteTrade, loadTrades, saveTrade, type Trade } from '@/lib/tradeJournal';

interface JournalView {
    /** null - записи ещё читаются из облака Telegram */
    trades: Trade[] | null;
    add: (trade: Trade) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

/**
 * Дневник сделок как общее состояние профиля.
 *
 * Записи нужны сразу двум разделам - самому дневнику и календарю дней,
 * - а читаются они из облака Telegram с заметной задержкой. Один хук на
 * оба раздела значит одно чтение на заход и одинаковый список в обоих:
 * при чтении в каждом разделе своя копия расходилась бы после первой
 * же новой записи.
 */
export function useJournal(active: boolean): JournalView {
    const [trades, setTrades] = useState<Trade[] | null>(null);

    useEffect(() => {
        if (!active || trades !== null) return;

        let cancelled = false;
        loadTrades().then(loaded => {
            if (!cancelled) setTrades(loaded);
        });
        return () => { cancelled = true; };
    }, [active, trades]);

    const add = useCallback(async (trade: Trade) => {
        await saveTrade(trade);
        // Новая запись встаёт сверху: дневник читают с последней сделки
        setTrades(prev => [trade, ...(prev ?? [])]);
    }, []);

    const remove = useCallback(async (id: string) => {
        await deleteTrade(id);
        setTrades(prev => (prev ?? []).filter(trade => trade.id !== id));
    }, []);

    return { trades, add, remove };
}
