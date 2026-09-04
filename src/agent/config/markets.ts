/**
 * Рынки, на которых работает агент.
 *
 * Раньше он умел только бинарные опционы: вердикт CALL/PUT, риск равен
 * ставке, выход по экспирации. На форексе и в крипте это неверно - там
 * есть стоп-лосс, тейк, размер позиции, а в крипте ещё плечо и
 * ликвидация. Поэтому рынок стал отдельным измерением рядом с режимом
 * (ментор/аналитик), а не зашит в текст промпта.
 */

export type TradingMarket = 'binary' | 'forex' | 'crypto';

/** Что выбрал человек. 'auto' - определяем по вопросу и графику. */
export type MarketChoice = TradingMarket | 'auto';

interface MarketMeta {
    label: string;
    hint: string;
    /** По этим словам узнаём рынок, когда выбран режим «авто» */
    keywords: string[];
}

export const MARKET_META: Record<TradingMarket, MarketMeta> = {
    binary: {
        label: 'Бинарные опционы',
        hint: 'CALL/PUT, экспирация',
        keywords: [
            'бинарн', 'экспирац', 'call', 'put', 'ставка', 'ставку',
            'pocket', 'покет', 'опцион', 'колл', 'пут',
        ],
    },
    forex: {
        label: 'Форекс',
        hint: 'Вход, стоп, тейк',
        keywords: [
            'форекс', 'forex', 'eurusd', 'gbpusd', 'usdjpy', 'usdchf',
            'audusd', 'xauusd', 'лот', 'пипс', 'пункт', 'спред', 'своп',
            'mt4', 'mt5', 'метатрейдер', 'ctrader', 'fxpro', 'кредитное плечо',
        ],
    },
    crypto: {
        label: 'Крипта',
        hint: 'Лонг/шорт, плечо',
        keywords: [
            'крипт', 'битк', 'btc', 'bitcoin', 'eth', 'эфир', 'альт',
            'usdt', 'фьючерс', 'лонг', 'шорт', 'плечо', 'ликвидац',
            'фандинг', 'спот', 'бирж', 'weex', 'binance', 'бинанс', 'bybit',
        ],
    },
};

export const MARKETS: TradingMarket[] = ['binary', 'forex', 'crypto'];

/**
 * Определяет рынок по тексту вопроса.
 *
 * null означает «не понял» - в этом случае промпт получит правила всех
 * трёх рынков и модель выберет сама по графику. Гадать за человека
 * хуже, чем спросить у него же в первой строке ответа.
 */
export function detectMarket(text: string): TradingMarket | null {
    const lower = (text || '').toLowerCase();
    if (!lower.trim()) return null;

    const hits = MARKETS.map(market => ({
        market,
        score: MARKET_META[market].keywords.filter(k => lower.includes(k)).length,
    })).filter(row => row.score > 0);

    if (hits.length === 0) return null;

    const best = hits.reduce((a, b) => (b.score > a.score ? b : a));
    // Ничья - тоже «не понял»: два рынка в одном вопросе бывают, когда
    // человек сравнивает их, и подмешивать правила одного нечестно
    const tied = hits.filter(row => row.score === best.score).length > 1;
    return tied ? null : best.market;
}

/** Что подставить в промпт: выбранный рынок или найденный в тексте. */
export function resolveMarket(choice: MarketChoice, text: string): TradingMarket | null {
    return choice === 'auto' ? detectMarket(text) : choice;
}
