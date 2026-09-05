import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBackground } from '@/components/AppBackground';
import { EconomicCalendar } from '@/components/EconomicCalendar';
import { MARKET_URL, TICKER_URL, TIMELINE_MARKET, type NewsMarket } from '@/data/newsWidgets';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Newspaper, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface WidgetFrameProps {
    src: string;
    title: string;
    /** Куда ведёт «Открыть» - полная версия на TradingView */
    source: string;
    /** Высота подобрана под содержимое: календарю нужно больше строк */
    tall?: boolean;
}

/**
 * Виджет без обвязки.
 *
 * Ни карточки, ни полосы с названием: сами виджеты рисуются на
 * прозрачном фоне, и рамка вокруг них создавала вторую границу поверх
 * той, что у виджета внутри. Название и так стоит на вкладке.
 *
 * Ссылка на полную версию ушла под виджет тихой строкой - как в
 * календаре.
 */
function WidgetFrame({ src, title, source, tall }: WidgetFrameProps) {
    return (
        <div className="space-y-2">
            <iframe
                src={src}
                title={title}
                loading="lazy"
                className={`w-full border-0 block rounded-[18px] ${tall
                    ? 'h-[560px] sm:h-[640px] md:h-[720px]'
                    : 'h-[500px] sm:h-[580px] md:h-[640px]'}`}
                allow="clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
            />

        </div>
    );
}

const News = () => {
    const navigate = useNavigate();
    const [market, setMarket] = useState<NewsMarket>('forex');
    const [activeTab, setActiveTab] = useState('calendar');
    const newsRef = useRef<HTMLDivElement>(null);

    // Календарь только у форекса: заседания центробанков и занятость
    // двигают валюту, а криптотрейдеру в ленте нужнее сам рынок
    const withCalendar = market === 'forex';

    const handleHomeClick = () => navigate('/home');


    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, []);

    // Лента новостей живёт на скрипте: iframe-версия виджета отдаёт пустую
    // страницу. Контейнер держим смонтированным всегда - внутри скрытой
    // вкладки виджет не получает размер и не рисуется.
    //
    // При смене рынка виджет пересобираем целиком: настройки он читает
    // один раз при запуске и на месте не переключается
    useEffect(() => {
        const container = newsRef.current;
        if (!container) return;

        container.innerHTML = '<div class="tradingview-widget-container__widget w-full"></div>';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            displayMode: 'regular',
            feedMode: 'market',
            market: TIMELINE_MARKET[market],
            colorTheme: 'dark',
            isTransparent: true,
            locale: 'ru',
            width: '100%',
            height: 560,
        });
        container.appendChild(script);
    }, [market]);

    return (
        <div className="min-h-[100dvh] scanline pb-24">
            <AppBackground />
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
                        {/* Рынок выбирается первым: от него зависят и
                            котировки, и лента, и обзор. Один общий набор
                            показывал криптотрейдеру евро-доллар, а
                            форекс-трейдеру биткоин - обоим лишнее */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {([['forex', 'Форекс'], ['crypto', 'Крипта']] as const).map(([id, label]) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setMarket(id);
                                        // У крипты календаря нет: если стояли
                                        // на нём, уводим на ленту
                                        if (id === 'crypto' && activeTab === 'calendar') setActiveTab('news');
                                    }}
                                    className={cn(
                                        'h-10 rounded-xl text-[13px] font-medium border transition-colors',
                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                        market === id
                                            ? 'bg-primary/12 border-primary/35 text-primary'
                                            : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground hover:bg-white/[0.06]'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Котировки узкой полосой - это фон, а не отдельный блок */}
                        <iframe
                            key={market}
                            src={TICKER_URL[market]}
                            title="Котировки"
                            loading="lazy"
                            className="w-full h-[46px] border-0 block mb-3 rounded-lg overflow-hidden"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        />

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList
                                className={cn(
                                    'grid w-full mb-3 h-auto p-1 rounded-xl',
                                    'border border-[hsl(142_26%_15%)] bg-[hsl(140_26%_8%)]',
                                    withCalendar ? 'grid-cols-3' : 'grid-cols-2'
                                )}
                            >
                                {withCalendar && (
                                <TabsTrigger
                                    value="calendar"
                                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs px-2 py-2 min-h-[42px] gap-1.5"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Календарь
                                </TabsTrigger>
                                )}
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

                            {withCalendar && (
                            <TabsContent value="calendar" className="mt-0">
                                {/* Своя вёрстка вместо виджета: из чужой
                                    страницы в рамке нельзя прочитать ни
                                    одного события, а значит нельзя и
                                    предупредить о нём */}
                                <EconomicCalendar />
                            </TabsContent>
                            )}

                            <TabsContent
                                value="news"
                                forceMount
                                className="mt-0 data-[state=inactive]:hidden"
                            >
                                <div className="space-y-2">
                                    <div ref={newsRef} className="tradingview-widget-container w-full min-h-[560px] sm:min-h-[640px]">
                                        <div className="tradingview-widget-container__widget w-full" />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="analytics" className="mt-0">
                                <WidgetFrame
                                    src={MARKET_URL[market]}
                                    title="Обзор рынка"
                                    source="https://www.tradingview.com/markets/"
                                    tall
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
            <BottomNav onHomeClick={handleHomeClick} />
        </div>
    );
};

export default News;
