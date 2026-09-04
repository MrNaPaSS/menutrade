import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Newspaper, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Виджеты TradingView просим рисовать прозрачный фон - иначе внутри карточки
 * видно их собственный тёмно-синий прямоугольник, чужой нашей теме.
 */
const TICKER_URL =
    'https://s.tradingview.com/embed-widget/ticker-tape/?locale=ru#' +
    encodeURIComponent(JSON.stringify({
        symbols: [
            { proName: 'FX:EURUSD', title: 'EUR/USD' },
            { proName: 'FX:GBPUSD', title: 'GBP/USD' },
            { proName: 'FX:USDJPY', title: 'USD/JPY' },
            { proName: 'CMCMARKETS:GOLD', title: 'Золото' },
            { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
            { proName: 'BINANCE:BTCUSDT', title: 'BTC' },
        ],
        showSymbolLogo: false,
        isTransparent: true,
        displayMode: 'compact',
        colorTheme: 'dark',
        locale: 'ru',
    }));

const CALENDAR_URL =
    'https://s.tradingview.com/embed-widget/events/?locale=ru#' +
    encodeURIComponent(JSON.stringify({
        colorTheme: 'dark',
        isTransparent: true,
        width: '100%',
        height: '100%',
        importanceFilter: '-1,0,1',
        currencyFilter: 'USD,EUR,GBP,JPY,RUB',
    }));

const MARKET_URL =
    'https://s.tradingview.com/embed-widget/market-overview/?locale=ru#' +
    encodeURIComponent(JSON.stringify({
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
            title: 'Forex',
            symbols: [
                { s: 'FX:EURUSD', d: 'EUR / USD' },
                { s: 'FX:GBPUSD', d: 'GBP / USD' },
                { s: 'FX:USDJPY', d: 'USD / JPY' },
                { s: 'FX:USDCHF', d: 'USD / CHF' },
                { s: 'FX:AUDUSD', d: 'AUD / USD' },
                { s: 'FX:USDCAD', d: 'USD / CAD' },
            ],
        }],
    }));

interface WidgetFrameProps {
    src: string;
    title: string;
    /** Куда ведёт «Открыть» - полная версия на TradingView */
    source: string;
    /** Высота подобрана под содержимое: календарю нужно больше строк */
    tall?: boolean;
}

/**
 * Виджет без лишних краёв: одна карточка, внутри сразу содержимое.
 * Раньше рамок было две - карточки и вложенного контейнера.
 */
function WidgetFrame({ src, title, source, tall }: WidgetFrameProps) {
    return (
        <div className="glass-card neon-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/20">
                <span className="text-xs font-medium text-muted-foreground truncate">
                    {title}
                </span>
                <button
                    type="button"
                    onClick={() => window.open(source, '_blank', 'noopener')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                >
                    Открыть
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            <iframe
                src={src}
                title={title}
                loading="lazy"
                className={`w-full border-0 block ${tall
                    ? 'h-[440px] sm:h-[520px] md:h-[600px]'
                    : 'h-[380px] sm:h-[460px] md:h-[520px]'}`}
                allow="clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
            />
        </div>
    );
}

const News = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('calendar');
    const newsRef = useRef<HTMLDivElement>(null);

    const handleHomeClick = () => navigate('/home');


    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, []);

    // Лента новостей живёт на скрипте: iframe-версия виджета отдаёт пустую
    // страницу. Контейнер держим смонтированным всегда - внутри скрытой
    // вкладки виджет не получает размер и не рисуется.
    useEffect(() => {
        const container = newsRef.current;
        if (!container || container.querySelector('script[src*="timeline"]')) return;

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            displayMode: 'regular',
            feedMode: 'all_symbols',
            colorTheme: 'dark',
            isTransparent: true,
            locale: 'ru',
            width: '100%',
            height: 440,
        });
        container.appendChild(script);
    }, []);

    return (
        <div className="min-h-[100dvh] scanline pb-24">
            <MatrixRain />
            <div className="relative z-10">
                <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm px-4 pb-2
                                pt-[var(--tg-content-top)]">
                    <div className="relative flex items-center justify-center py-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleHomeClick}
                            className="absolute left-0 text-muted-foreground hover:text-foreground text-xs"
                        >
                            <ArrowLeft className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">На главную</span>
                        </Button>

                        <h2 className="font-display font-bold text-lg sm:text-xl">Новости</h2>

                        <div className="absolute right-0 -top-1">
                            <SimpleMenu />
                        </div>
                    </div>
                </div>

                <main className="px-3 sm:px-4 pb-8 flex justify-center">
                    <div className="max-w-lg w-full mx-auto">
                        {/* Котировки узкой полосой - это фон, а не отдельный блок */}
                        <iframe
                            src={TICKER_URL}
                            title="Котировки"
                            loading="lazy"
                            className="w-full h-[46px] border-0 block mb-3 rounded-lg overflow-hidden"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        />

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 glass-card mb-3 h-auto p-1">
                                <TabsTrigger
                                    value="calendar"
                                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs px-2 py-2 min-h-[42px] gap-1.5"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Календарь
                                </TabsTrigger>
                                <TabsTrigger
                                    value="news"
                                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs px-2 py-2 min-h-[42px] gap-1.5"
                                >
                                    <Newspaper className="w-4 h-4" />
                                    Лента
                                </TabsTrigger>
                                <TabsTrigger
                                    value="analytics"
                                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs px-2 py-2 min-h-[42px] gap-1.5"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Рынок
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="calendar" className="mt-0">
                                <WidgetFrame
                                    src={CALENDAR_URL}
                                    title="Экономический календарь"
                                    source="https://ru.tradingview.com/economic-calendar/"
                                    tall
                                />
                            </TabsContent>

                            <TabsContent
                                value="news"
                                forceMount
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <div className="glass-card neon-border rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/20">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Новости рынка
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => window.open('https://ru.tradingview.com/news/', '_blank', 'noopener')}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Открыть
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div ref={newsRef} className="tradingview-widget-container w-full min-h-[440px]">
                                        <div className="tradingview-widget-container__widget w-full" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="analytics" className="mt-0">
                                <WidgetFrame
                                    src={MARKET_URL}
                                    title="Обзор рынка"
                                    source="https://www.tradingview.com/markets/"
                                    tall
                                />
                            </TabsContent>
                        </Tabs>

                        <p className="text-[11px] text-muted-foreground text-center mt-4">
                            Данные предоставлены TradingView
                        </p>
                    </div>
                </main>
            </div>
            <BottomNav onHomeClick={handleHomeClick} />
        </div>
    );
};

export default News;
