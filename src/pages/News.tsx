import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { ArrowLeft, Newspaper, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const News = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const progress = getProgress();
  const tickersWidgetRef = useRef<HTMLDivElement>(null);
  const newsWidgetRef = useRef<HTMLDivElement>(null);

  const handleHomeClick = () => {
    navigate('/home');
  };

  useEffect(() => {
    if (tickersWidgetRef.current) {
      const container = tickersWidgetRef.current;
      if (!container.querySelector('script[src*="tv-ticker-tape"]')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://widgets.tradingview-widget.com/w/ru/tv-ticker-tape.js';
        container.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    const loadNewsWidget = () => {
      if (newsWidgetRef.current) {
        const container = newsWidgetRef.current;
        const widgetDiv = container.querySelector('.tradingview-widget-container__widget');
        
        if (widgetDiv && !container.querySelector('script[src*="timeline"]')) {
          const script = document.createElement('script');
          script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
          script.type = 'text/javascript';
          script.async = true;
        script.innerHTML = `
        {
          "displayMode": "regular",
          "feedMode": "all_symbols",
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "ru",
          "width": "100%",
          "height": 550
        }`;
          container.appendChild(script);
        }
      }
    };

    loadNewsWidget();
    
    // Перезагружаем виджет при переключении вкладок
    const interval = setInterval(() => {
      if (newsWidgetRef.current) {
        const container = newsWidgetRef.current;
        const widgetDiv = container.querySelector('.tradingview-widget-container__widget');
        if (widgetDiv && !widgetDiv.innerHTML.trim()) {
          loadNewsWidget();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);



  return (
    <div className="min-h-screen scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={progress} />
        
        <main className="p-4 pb-24">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">На главную</span>
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl mb-2">Новости</h2>
              <p className="text-sm text-muted-foreground">
                Актуальные новости рынка и экономический календарь
              </p>
            </div>

            <div className="mb-4 glass-card rounded-xl p-2 neon-border overflow-hidden">
              <div ref={tickersWidgetRef}>
                <tv-ticker-tape 
                  symbols='FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FX:EURUSD,CMCMARKETS:GOLD,FPMARKETS:GBPUSD,FX:USDJPY,OANDA:AUDUSD,OANDA:AUDJPY,OANDA:GBPCAD,FX:EURUSD,OANDA:GBPJPY' 
                  line-chart-type="Baseline"
                ></tv-ticker-tape>
              </div>
            </div>

            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass-card mb-4">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-primary/20">
                  <Calendar className="w-4 h-4 mr-2" />
                  Календарь
                </TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:bg-primary/20">
                  <Newspaper className="w-4 h-4 mr-2" />
                  Новости
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Аналитика
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-4">
                <div className="glass-card rounded-xl p-4 neon-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">Экономический календарь</h3>
                        <p className="text-xs text-muted-foreground">Важные экономические события</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open('https://ru.tradingview.com/economic-calendar/', '_blank')}
                      className="text-primary"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Открыть
                    </Button>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-border/30 bg-background/50">
                    <iframe
                      src="https://s.tradingview.com/embed-widget/events/?locale=ru#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22600%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22currencyFilter%22%3A%22USD%2CEUR%2CGBP%2CJPY%2CRUB%22%7D"
                      style={{ width: '100%', height: '600px', border: 'none' }}
                      title="Economic Calendar"
                      allow="clipboard-write"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="news" className="space-y-4">
                <div className="glass-card rounded-xl p-4 neon-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">Новости рынка</h3>
                      <p className="text-xs text-muted-foreground">Актуальные финансовые новости</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-border/30 bg-background/50">
                    <div ref={newsWidgetRef} className="tradingview-widget-container w-full" style={{ height: '550px', width: '100%' }}>
                      <div className="tradingview-widget-container__widget w-full" style={{ width: '100%', height: '550px' }}></div>
                      <div className="tradingview-widget-copyright text-xs text-muted-foreground text-center mt-2">
                        <a 
                          href="https://ru.tradingview.com/news/top-providers/tradingview/" 
                          rel="noopener nofollow" 
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          <span className="blue-text">Track all markets on TradingView</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="glass-card rounded-xl p-4 neon-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">Обзор рынка</h3>
                      <p className="text-xs text-muted-foreground">Обзор валютных пар и графики</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-border/30 bg-background/50">
                    <div className="tradingview-widget-container" style={{ height: '550px', width: '100%' }}>
                      <iframe
                        src="https://s.tradingview.com/embed-widget/market-overview/?locale=ru#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%2212M%22%2C%22showChart%22%3Atrue%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX%3AEURUSD%22%2C%22d%22%3A%22EUR%20to%20USD%22%7D%2C%7B%22s%22%3A%22FX%3AGBPUSD%22%2C%22d%22%3A%22GBP%20to%20USD%22%7D%2C%7B%22s%22%3A%22FX%3AUSDJPY%22%2C%22d%22%3A%22USD%20to%20JPY%22%7D%2C%7B%22s%22%3A%22FX%3AUSDCHF%22%2C%22d%22%3A%22USD%20to%20CHF%22%7D%2C%7B%22s%22%3A%22FX%3AAUDUSD%22%2C%22d%22%3A%22AUD%20to%20USD%22%7D%2C%7B%22s%22%3A%22FX%3AUSDCAD%22%2C%22d%22%3A%22USD%20to%20CAD%22%7D%5D%7D%5D%2C%22width%22%3A%22400%22%2C%22height%22%3A%22550%22%2C%22showSymbolLogo%22%3Atrue%2C%22plotLineColorGrowing%22%3A%22rgba(34%2C%20201%2C%2094%2C%201)%22%2C%22plotLineColorFalling%22%3A%22rgba(239%2C%2068%2C%2068%2C%201)%22%2C%22gridLineColor%22%3A%22rgba(42%2C%2046%2C%2057%2C%201)%22%2C%22scaleFontColor%22%3A%22%23DBDBDB%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(34%2C%20201%2C%2094%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(239%2C%2068%2C%2068%2C%200.12)%22%2C%22symbolActiveColor%22%3A%22rgba(34%2C%20201%2C%2094%2C%200.12)%22%7D"
                        style={{ width: '100%', height: '550px', border: 'none' }}
                        title="Market Overview"
                        allow="clipboard-write"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
                      />
                      <div className="tradingview-widget-copyright text-xs text-muted-foreground text-center mt-1">
                        <a 
                          href="https://www.tradingview.com/markets/" 
                          rel="noopener nofollow" 
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          <span className="blue-text">Market summary</span>
                          <span className="trademark"> by TradingView</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 neon-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">Скринер форекс</h3>
                      <p className="text-xs text-muted-foreground">Анализ валютных пар в реальном времени</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-border/30 bg-background/50">
                    <div className="tradingview-widget-container" style={{ height: '550px', width: '100%' }}>
                      <iframe
                        src="https://s.tradingview.com/embed-widget/screener/?locale=ru#%7B%22market%22%3A%22forex%22%2C%22showToolbar%22%3Atrue%2C%22defaultColumn%22%3A%22overview%22%2C%22defaultScreen%22%3A%22general%22%2C%22isTransparent%22%3Afalse%2C%22colorTheme%22%3A%22dark%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A550%7D"
                        style={{ width: '100%', height: '550px', border: 'none' }}
                        title="Forex Screener"
                        allow="clipboard-write"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
                      />
                      <div className="tradingview-widget-copyright text-xs text-muted-foreground text-center mt-1">
                        <a 
                          href="https://ru.tradingview.com/markets/currencies/" 
                          rel="noopener nofollow" 
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          <span className="blue-text">Track all markets on TradingView</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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
