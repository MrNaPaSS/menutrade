import { useCallback, useState } from 'react';
import { Bitcoin, Check, TrendingUp } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { Button } from '@/components/ui/button';
import { RegistrationGate, type Market as GateMarket } from '@/components/RegistrationGate';

type Market = 'forex' | 'crypto';

interface Broker {
  name: string;
  tagline: string;
  minDeposit: string;
  /** Площадка в терминах шлюза: он открывает ссылку и принимает ID */
  gate: GateMarket;
  /** Чем площадка хороша - показываем на шаге с описанием */
  pitch: string[];
}

const BROKERS: Record<Market, Broker[]> = {
  forex: [
    {
      name: 'Pocket Option',
      tagline: 'Бинарные опционы, быстрый старт',
      minDeposit: 'от $20',
      gate: 'forex',
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
      gate: 'fxpro',
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
      gate: 'crypto',
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

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

interface TradeMarketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Где торговать.
 *
 * Окно с шагами, как обучение и стратегии: рынок, площадка, описание.
 * Раньше поднималась шторка снизу - на телефоне в неё помещалось три
 * карточки, а шаг назад приходилось рисовать отдельной ссылкой внизу
 * списка. У окна шаг назад в шапке, и он же ловит жест от края.
 */
export function TradeMarketDrawer({ open, onOpenChange }: TradeMarketDrawerProps) {
  const [market, setMarket] = useState<Market | null>(null);
  const [broker, setBroker] = useState<Broker | null>(null);
  // Регистрация идёт тем же шлюзом, что и везде: таймер, ссылка и ввод
  // ID счёта. Второй реализации этого шага в приложении быть не должно
  const [registering, setRegistering] = useState<GateMarket | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
    // Сбрасываем шаги после закрытия: следующий заход начинается с рынков
    setTimeout(() => {
      setMarket(null);
      setBroker(null);
      setRegistering(null);
    }, 300);
  }, [onOpenChange]);

  // Ввод ID счёта - тем же шлюзом, что и в остальных местах
  if (registering) {
    return (
      <RegistrationGate
        autoRegister={registering}
        onBack={() => setRegistering(null)}
      />
    );
  }

  // Описание площадки
  if (broker) {
    return (
      <ModalWindow
        open={open}
        onClose={close}
        onBack={() => setBroker(null)}
        title={broker.name}
        subtitle="Открой счёт по нашей ссылке - так аккаунт привяжется к Академии"
      >
        <div className="rounded-[18px] border border-[hsl(142_26%_15%)] p-4" style={PANEL_BG}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[12px] text-muted-foreground">Минимальный депозит</span>
            <span className="font-mono font-bold text-[13px] tabular-nums text-primary">
              {broker.minDeposit}
            </span>
          </div>

          <ul className="space-y-2">
            {broker.pitch.map(line => (
              <li key={line} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full min-h-[44px]" onClick={() => setRegistering(broker.gate)}>
          Зарегистрироваться
        </Button>

        <p className="text-[11.5px] text-muted-foreground leading-relaxed px-1 pb-1">
          Регистрируйся по нашей ссылке - иначе аккаунт не привяжется к Академии, и доступ
          не откроется.
        </p>
      </ModalWindow>
    );
  }

  // Площадки рынка
  if (market) {
    return (
      <ModalWindow
        open={open}
        onClose={close}
        onBack={() => setMarket(null)}
        title={MARKET_META[market].label}
        subtitle={MARKET_META[market].hint}
      >
        <div className={PANEL} style={PANEL_BG}>
          {BROKERS[market].map((item, index) => (
            <TerminalRow
              key={item.name}
              index={index}
              icon={<span className="font-mono text-[13px]">{item.name[0]}</span>}
              tone="green"
              title={item.name}
              caption={item.tagline}
              value={item.minDeposit}
              onClick={() => setBroker(item)}
            />
          ))}
        </div>
      </ModalWindow>
    );
  }

  // Рынки
  return (
    <ModalWindow
      open={open}
      onClose={close}
      title="Где будем торговать"
      subtitle="Выбери рынок - покажу подходящие площадки"
    >
      {(Object.keys(MARKET_META) as Market[]).map((key, index) => {
        const meta = MARKET_META[key];
        const Icon = meta.icon;

        return (
          <ModalCard
            key={key}
            index={index}
            icon={<Icon className="w-5 h-5" />}
            title={meta.label}
            description={meta.hint}
            footnote={`${BROKERS[key].length} ${BROKERS[key].length === 1 ? 'площадка' : 'площадки'}`}
            action="Открыть"
            onClick={() => setMarket(key)}
          />
        );
      })}
    </ModalWindow>
  );
}
