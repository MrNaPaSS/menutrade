import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bitcoin, TrendingUp } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { platformLinks } from '@/data/traderMenu';

type Market = 'forex' | 'crypto';

interface Broker {
  name: string;
  tagline: string;
  minDeposit: string;
  url: string;
  /** Чем площадка хороша - показываем на шаге с описанием */
  pitch: string[];
}

const BROKERS: Record<Market, Broker[]> = {
  forex: [
    {
      name: 'Pocket Option',
      tagline: 'Бинарные опционы, быстрый старт',
      minDeposit: 'от $20',
      url: platformLinks.pocketOptions,
      pitch: [
        'Бинарные опционы - самый простой вход в рынок',
        'Промокод даёт +50% к первому депозиту',
        'Хватит $20, чтобы открыть полный доступ к Академии',
      ],
    },
    {
      name: 'FxPro',
      tagline: 'Классический форекс: MT4, MT5, cTrader',
      minDeposit: 'от $101',
      url: platformLinks.fxPro,
      pitch: [
        'Валюты, металлы, индексы и акции',
        'Терминалы MT4, MT5 и cTrader',
        'Регулируемый брокер, работает с 2006 года',
      ],
    },
  ],
  crypto: [
    {
      name: 'WEEX',
      tagline: 'Фьючерсы и спот, более 1000 монет',
      minDeposit: 'от $100',
      url: platformLinks.weexExchange,
      pitch: [
        'Фьючерсы и спот, более 1000 монет',
        'Биржа работает с 2018 года, интерфейс на русском',
        'Депозит остаётся твоим - вывести можно в любой момент',
      ],
    },
  ],
};

const MARKET_META: Record<Market, { label: string; hint: string; icon: typeof TrendingUp }> = {
  forex: { label: 'FOREX', hint: 'Валюты, металлы, индексы', icon: TrendingUp },
  crypto: { label: 'CRYPTO', hint: 'Биткоин, альткоины, фьючерсы', icon: Bitcoin },
};

function openLink(url: string): void {
  const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

interface TradeMarketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeMarketDrawer({ open, onOpenChange }: TradeMarketDrawerProps) {
  const [market, setMarket] = useState<Market | null>(null);
  const [broker, setBroker] = useState<Broker | null>(null);

  // Сбрасываем шаги при закрытии, чтобы шторка всегда открывалась с начала
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        setMarket(null);
        setBroker(null);
      }, 200);
    }
  };

  const step = broker ? 'broker' : market ? 'list' : 'markets';

  const title = broker ? broker.name : market ? MARKET_META[market].label : 'Где будем торговать';
  const hint = broker
    ? 'Открой счёт по нашей ссылке - так аккаунт привяжется к Академии'
    : market
      ? 'Выбери площадку'
      : 'Выбери рынок - покажу подходящие площадки';

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-[60vh] border-primary/20 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-md flex-col pb-6">
          <DrawerHeader className="text-center">
            <DrawerTitle className="font-display text-xl">{title}</DrawerTitle>
            <DrawerDescription className="text-xs">{hint}</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <AnimatePresence initial={false}>
              <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="space-y-3"
                >
                  {step === 'markets' && (Object.keys(MARKET_META) as Market[]).map((key) => {
                    const meta = MARKET_META[key];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setMarket(key)}
                        className="w-full glass-card neon-border rounded-xl p-4 flex items-center gap-3 text-left
                                   transition-transform duration-100 active:scale-[0.98]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/25 to-accent/20
                                        border border-primary/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{meta.hint}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}

                  {step === 'list' && market && BROKERS[market].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setBroker(item)}
                      className="w-full glass-card neon-border rounded-xl p-4 text-left
                                 transition-transform duration-100 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <span className="text-[10px] font-mono text-primary border border-primary/30
                                         rounded-full px-2 py-0.5 flex-shrink-0">
                          {item.minDeposit}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.tagline}</p>
                    </button>
                  ))}

                  {step === 'list' && (
                    <button
                      onClick={() => setMarket(null)}
                      className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground
                                 py-2 transition-colors hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" /> К выбору рынка
                    </button>
                  )}

                  {step === 'broker' && broker && (
                    <>
                  <div className="glass-card neon-border rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <p className="text-xs text-muted-foreground">Минимальный депозит</p>
                      <span className="text-xs font-mono text-primary border border-primary/30
                                       rounded-full px-2 py-0.5">
                        {broker.minDeposit}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {broker.pitch.map((line) => (
                        <li key={line} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-primary flex-shrink-0">•</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => openLink(broker.url)}
                    className="w-full rounded-xl bg-primary text-primary-foreground font-medium
                               py-3 transition-transform duration-100 active:scale-[0.98]"
                  >
                    Зарегистрироваться
                  </button>

                  <button
                    onClick={() => setBroker(null)}
                    className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground
                               py-2 transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" /> К площадкам
                  </button>
                    </>
                  )}
                </motion.div>
            </AnimatePresence>

            <p className="text-[11px] text-muted-foreground text-center mt-4">
              Регистрируйся по нашей ссылке - иначе аккаунт не привяжется к Академии
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
