/**
 * Настройки виджетов новостей по рынкам.
 *
 * Форекс и крипта разведены: у них разные инструменты в бегущей строке,
 * разная лента и разный обзор. Один общий набор показывал криптотрейдеру
 * пары евро-доллар, а форекс-трейдеру - биткоин, и обоим лишнее.
 *
 * Виджеты просим рисовать прозрачный фон - иначе внутри видно их
 * собственный тёмно-синий прямоугольник, чужой нашей теме.
 */

export type NewsMarket = 'forex' | 'crypto';

/** Лента новостей у TradingView фильтруется по рынку одним полем */
export const TIMELINE_MARKET: Record<NewsMarket, string> = {
    forex: 'forex',
    crypto: 'crypto',
};

function widget(name: string, config: Record<string, unknown>): string {
    return `https://s.tradingview.com/embed-widget/${name}/?locale=ru#`
        + encodeURIComponent(JSON.stringify(config));
}

const TICKER_SYMBOLS: Record<NewsMarket, Array<{ proName: string; title: string }>> = {
    forex: [
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'CMCMARKETS:GOLD', title: 'Золото' },
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'TVC:DXY', title: 'Индекс доллара' },
    ],
    crypto: [
        { proName: 'BINANCE:BTCUSDT', title: 'BTC' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH' },
        { proName: 'BINANCE:SOLUSDT', title: 'SOL' },
        { proName: 'BINANCE:XRPUSDT', title: 'XRP' },
        { proName: 'BINANCE:BNBUSDT', title: 'BNB' },
        { proName: 'CRYPTOCAP:TOTAL', title: 'Капитализация' },
    ],
};

export const TICKER_URL: Record<NewsMarket, string> = {
    forex: widget('ticker-tape', {
        symbols: TICKER_SYMBOLS.forex,
        showSymbolLogo: false,
        isTransparent: true,
        displayMode: 'compact',
        colorTheme: 'dark',
        locale: 'ru',
    }),
    crypto: widget('ticker-tape', {
        symbols: TICKER_SYMBOLS.crypto,
        showSymbolLogo: false,
        isTransparent: true,
        displayMode: 'compact',
        colorTheme: 'dark',
        locale: 'ru',
    }),
};

const OVERVIEW_BASE = {
    colorTheme: 'dark',
    isTransparent: true,
    dateRange: '12M',
    showChart: true,
    width: '100%',
    height: '100%',
    showSymbolLogo: true,
    plotLineColorGrowing: 'rgba(34, 201, 94, 1)',
    plotLineColorFalling: 'rgba(239, 68, 68, 1)',
    gridLineColor: 'rgba(255, 255, 255, 0.06)',
    scaleFontColor: '#9BB3A6',
    belowLineFillColorGrowing: 'rgba(34, 201, 94, 0.12)',
    belowLineFillColorFalling: 'rgba(239, 68, 68, 0.12)',
    symbolActiveColor: 'rgba(34, 201, 94, 0.12)',
};

export const MARKET_URL: Record<NewsMarket, string> = {
    forex: widget('market-overview', {
        ...OVERVIEW_BASE,
        tabs: [{
            title: 'Валюты',
            symbols: [
                { s: 'FX:EURUSD', d: 'EUR / USD' },
                { s: 'FX:GBPUSD', d: 'GBP / USD' },
                { s: 'FX:USDJPY', d: 'USD / JPY' },
                { s: 'FX:USDCHF', d: 'USD / CHF' },
                { s: 'FX:AUDUSD', d: 'AUD / USD' },
                { s: 'FX:USDCAD', d: 'USD / CAD' },
            ],
        }, {
            title: 'Металлы и индексы',
            symbols: [
                { s: 'CMCMARKETS:GOLD', d: 'Золото' },
                { s: 'TVC:SILVER', d: 'Серебро' },
                { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
                { s: 'TVC:DXY', d: 'Индекс доллара' },
            ],
        }],
    }),
    crypto: widget('market-overview', {
        ...OVERVIEW_BASE,
        tabs: [{
            title: 'Крупные',
            symbols: [
                { s: 'BINANCE:BTCUSDT', d: 'Bitcoin' },
                { s: 'BINANCE:ETHUSDT', d: 'Ethereum' },
                { s: 'BINANCE:BNBUSDT', d: 'BNB' },
                { s: 'BINANCE:SOLUSDT', d: 'Solana' },
                { s: 'BINANCE:XRPUSDT', d: 'XRP' },
            ],
        }, {
            title: 'Рынок целиком',
            symbols: [
                { s: 'CRYPTOCAP:TOTAL', d: 'Вся капитализация' },
                { s: 'CRYPTOCAP:BTC.D', d: 'Доминация BTC' },
                { s: 'BINANCE:ETHBTC', d: 'ETH / BTC' },
            ],
        }],
    }),
};
