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
}

const BROKERS: Record<Market, Broker[]> = {
  forex: [
    {
      name: 'Pocket Option',
      tagline: 'Бинарные опционы, быстрый старт',
      minDeposit: 'от $20',
      url: platformLinks.pocketOptions,
    },
    {
      name: 'FxPro',
      tagline: 'Классический форекс: MT4, MT5, cTrader',
      minDeposit: 'от $101',
      url: 'https://direct.fxpro.partners/click?pid=8057&offer_id=149',
    },
  ],
  crypto: [
    {
      name: 'WEEX',
      tagline: 'Фьючерсы и спот, более 1000 монет',
      minDeposit: 'от $100',
      url: platformLinks.weexExchange,
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

  // Сбрасываем выбор при закрытии, чтобы шторка всегда открывалась с первого шага
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setTimeout(() => setMarket(null), 200);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-[50vh] border-primary/20 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-md flex-col pb-6">
          <DrawerHeader className="text-center">
            <DrawerTitle className="font-display text-xl">
              {market ? MARKET_META[market].label : 'Где будем торговать'}
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              {market
                ? 'Выбери площадку и открой счёт по нашей ссылке'
                : 'Выбери рынок - покажу подходящие площадки'}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4">
            <AnimatePresence mode="wait" initial={false}>
              {market === null ? (
                <motion.div
                  key="markets"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                  className="space-y-3"
                >
                  {(Object.keys(MARKET_META) as Market[]).map((key) => {
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
                          <p className="font-display font-bold text-sm">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">{meta.hint}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="brokers"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                  className="space-y-3"
                >
                  {BROKERS[market].map((broker) => (
                    <button
                      key={broker.name}
                      onClick={() => openLink(broker.url)}
                      className="w-full glass-card neon-border rounded-xl p-4 text-left
                                 transition-transform duration-100 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-display font-bold text-sm">{broker.name}</p>
                        <span className="text-[10px] font-mono text-primary border border-primary/30
                                         rounded-full px-2 py-0.5 flex-shrink-0">
                          {broker.minDeposit}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{broker.tagline}</p>
                    </button>
                  ))}

                  <button
                    onClick={() => setMarket(null)}
                    className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground
                               py-2 transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" /> К выбору рынка
                  </button>
                </motion.div>
              )}
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
