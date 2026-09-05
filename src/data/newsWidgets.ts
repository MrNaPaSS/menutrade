/**
 * Настройки виджетов новостей.
 *
 * Раздел про форекс: валютные пары, металлы и индексы. Крипта здесь была
 * отдельным переключателем, но её убрали - новости по монетам приходят в
 * форум сообщениями от бота, и дублировать их в приложении незачем.
 *
 * Виджеты просим рисовать прозрачный фон - иначе внутри видно их
 * собственный тёмно-синий прямоугольник, чужой нашей теме.
 */

function widget(name: string, config: Record<string, unknown>): string {
    return `https://s.tradingview.com/embed-widget/${name}/?locale=ru#`
        + encodeURIComponent(JSON.stringify(config));
}

export const TICKER_URL = widget('ticker-tape', {
    symbols: [
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'CMCMARKETS:GOLD', title: 'Золото' },
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'TVC:DXY', title: 'Индекс доллара' },
    ],
    showSymbolLogo: false,
    isTransparent: true,
    displayMode: 'compact',
    colorTheme: 'dark',
    locale: 'ru',
});

export const MARKET_URL = widget('market-overview', {
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
});
