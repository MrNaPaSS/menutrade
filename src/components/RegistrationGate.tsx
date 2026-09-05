import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Bitcoin, ArrowLeft, Clock, CheckCircle2, Loader2,
  GraduationCap, ChevronRight, ExternalLink, ShieldCheck, Sparkles, AlertTriangle,
  Radio, Bot, LineChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppBackground } from '@/components/AppBackground';
import { GraffitiSpray } from '@/components/graffiti/Graffiti';
import { useTelegram } from '@/hooks/useTelegram';
import { useUserAccess } from '@/contexts/UserAccessContext';

// 'forex' - Pocket Option (значение сохранено прежним для совместимости с базой бота)
type Market = 'forex' | 'fxpro' | 'crypto';

const REGISTRATION_LINKS: Record<Market, string> = {
  // Форекс: Pocket Option - та же ссылка, что в боте
  forex: 'https://u3.shortink.io/main?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&al=1743587&ac=web&cid=948657&code=WELCOME50',
  // Форекс: FxPro
  fxpro: 'https://direct.fxpro.partners/click?pid=8057&offer_id=149',
  // Крипто - WEEX
  crypto: 'https://www.weex.com/ru/register?vipCode=kaktotakxme',
};

const MARKET_META: Record<Market, { label: string; tagline: string }> = {
  forex: { label: 'POCKET OPTION', tagline: 'Бинарные опционы · бонус +50%' },
  fxpro: { label: 'FXPRO', tagline: 'Классический форекс-брокер' },
  crypto: { label: 'CRYPTO', tagline: 'Биржа WEEX' },
};

const TIMER_SECONDS = 15 * 60;

// Те же поверхности, что во всех окнах приложения
const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

function getBotApiBase(): string {
  return import.meta.env.DEV
    ? '/bot-api'
    : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

// Отправка FB-события через бота: только InitiateCheckout (нажал "Зарегистрироваться").
// ViewContent шлёт сам бот при первом контакте; Lead - при подтверждении депозита.
// Fire-and-forget - не блокирует UX, дедупликация на стороне бота.
function sendFbEvent(userId: string | null, event: 'InitiateCheckout', username?: string): void {
  if (!userId) return;
  fetch(`${getBotApiBase()}/fb-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ userId, event, username: username || '', language: 'ru' }),
  }).catch(() => { /* аналитика не критична */ });
}

function openRegistration(url: string): void {
  const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Step = 'welcome' | 'forex-brokers' | 'info' | 'register';

export function RegistrationGate({ onBack }: { onBack?: () => void } = {}) {
  const { userId, user } = useTelegram();
  const { hasSubmittedAccount, fetchUserStatus } = useUserAccess();

  const [step, setStep] = useState<Step>('welcome');
  const [market, setMarket] = useState<Market>('forex');
  const [accountId, setAccountId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Таймер на регистрацию и пополнение - стартует на шаге ввода аккаунта
  useEffect(() => {
    if (step !== 'register') return;
    setSecondsLeft(TIMER_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step, market]);

  const chooseMarket = (selected: Market) => {
    setMarket(selected);
    setError(null);
    setStep('info');
  };

  // Шаг назад из описания брокера: форекс-брокеры возвращают к своему списку
  const backFromInfo = () => setStep(market === 'crypto' ? 'welcome' : 'forex-brokers');

  const goRegister = () => {
    // FB InitiateCheckout - нажал "Зарегистрироваться" (аналог "получил ссылку регистрации" в боте)
    sendFbEvent(userId, 'InitiateCheckout', user?.username);
    openRegistration(REGISTRATION_LINKS[market]);
    setStep('register');
  };

  const handleSubmit = async () => {
    const acc = accountId.trim();
    if (!acc) {
      setError('Введите ID зарегистрированного аккаунта');
      return;
    }
    if (!userId) {
      setError('Не удалось определить пользователя Telegram. Откройте приложение через бота.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${getBotApiBase()}/submit-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ userId, market, accountId: acc, username: user?.username || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchUserStatus(true);
      } else {
        setError(data.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }
    } catch {
      setError('Ошибка соединения. Проверьте интернет и попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Экран ожидания подтверждения ─────────────────────────────────────────
  if (hasSubmittedAccount) {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center
                            border border-[hsl(142_30%_20%)]"
              style={PANEL_BG}
            >
              <CheckCircle2 className="w-11 h-11" style={{ color: 'hsl(142 76% 58%)' }} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-[22px] tracking-tight text-foreground">
              Заявка отправлена
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Проверяем регистрацию и пополнение. Как только доступ подтвердится,
              Академия откроется <span className="text-primary font-semibold">автоматически</span>,
              ничего нажимать не нужно.
            </p>
          </div>

          <StepStrip current={3} />

          <div className="flex items-center justify-center gap-2 text-[11.5px] text-muted-foreground font-mono">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(142 76% 58%)' }} />
            ждём подтверждения
          </div>

          {onBack && (
            <Button variant="outline" className="w-full h-11" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться в приложение
            </Button>
          )}
        </motion.div>
      </Shell>
    );
  }

  const meta = MARKET_META[market];
  const Icon = market === 'crypto' ? Bitcoin : TrendingUp;

  // ── Шаг 1.5: выбор форекс-брокера ─────────────────────────────────────────
  if (step === 'forex-brokers') {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          {/* Заголовок по центру, стрелка absolute слева: на шаге
              выбора нет ничего, кроме двух карточек, и текст, прижатый
              к левому краю, выглядел началом списка, а не заголовком */}
          <div className="relative text-center px-10">
            <div className="absolute left-0 top-0">
              <BackButton onClick={() => setStep('welcome')} />
            </div>
            <h1 className="font-display font-bold text-[19px] tracking-tight text-foreground">
              Выберите брокера
            </h1>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1.5">
              Оба открывают полный доступ. Выбирайте тот, что ближе по стилю торговли.
            </p>
          </div>

          <StepStrip current={1} />

          <div className="space-y-3">
            <MarketCard
              icon={<TrendingUp className="w-6 h-6 text-primary" />}
              label="Pocket Option"
              tagline={MARKET_META.forex.tagline}
              onClick={() => chooseMarket('forex')}
            />
            <MarketCard
              icon={<LineChart className="w-6 h-6 text-primary" />}
              label="FxPro"
              tagline={MARKET_META.fxpro.tagline}
              onClick={() => chooseMarket('fxpro')}
            />
          </div>
        </motion.div>
      </Shell>
    );
  }

  // ── Шаг 2: инфо-окно раздела (как в боте) + кнопка регистрации ────────────
  if (step === 'info') {
    return (
      <Shell>
        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${market}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <BackButton onClick={backFromInfo} />
              <span
                className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0
                           border border-white/[0.07]"
                style={{
                  background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
                  color: 'hsl(142 76% 62%)',
                }}
              >
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="font-display font-bold text-[17px] tracking-tight leading-none text-foreground">
                  {meta.label}
                </div>
                <div className="text-[12px] text-muted-foreground mt-1.5">{meta.tagline}</div>
              </div>
            </div>

            <StepStrip current={1} />

            {market === 'forex' && <ForexInfo />}
            {market === 'fxpro' && <FxProInfo />}
            {market === 'crypto' && <CryptoInfo />}

            <Button className="w-full h-12 font-semibold" onClick={goRegister}>
              Зарегистрироваться
            </Button>
          </motion.div>
        </AnimatePresence>
      </Shell>
    );
  }

  // ── Шаг 3: таймер + ввод аккаунта ────────────────────────────────────────
  if (step === 'register') {
    const progress = ((TIMER_SECONDS - secondsLeft) / TIMER_SECONDS) * 100;

    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <div className="flex items-center gap-3">
            <BackButton onClick={() => setStep('info')} />
            <span
              className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0
                         border border-white/[0.07]"
              style={{
                background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
                color: 'hsl(142 76% 62%)',
              }}
            >
              <Icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display font-bold text-[17px] tracking-tight leading-none text-foreground">
                {meta.label}
              </div>
              <div className="text-[12px] text-muted-foreground mt-1.5">ID счёта после пополнения</div>
            </div>
          </div>

          <StepStrip current={2} />

          {/* Таймер */}
          <div className={`${PANEL} p-4`} style={PANEL_BG}>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.09em] text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {secondsLeft === 0 ? 'Время вышло' : 'Время на регистрацию'}
              </span>
              <span
                className="font-mono font-bold text-2xl tabular-nums"
                style={{ color: secondsLeft === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(142 76% 58%)' }}
              >
                {formatTime(secondsLeft)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.9 }}
              />
            </div>

            {/* Ноль на таймере не должен читаться как отказ: заявку
                принимают и после него */}
            {secondsLeft === 0 && (
              <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-2.5">
                Ничего не потеряно - ID можно отправить и сейчас, заявку примут.
              </p>
            )}
          </div>

          <button
            onClick={() => openRegistration(REGISTRATION_LINKS[market])}
            className="w-full flex items-center justify-center gap-2 text-sm text-primary/90 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Открыть ссылку регистрации ещё раз
          </button>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground" htmlFor="account-id">
              ID зарегистрированного счёта
            </label>
            <Input
              id="account-id"
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                // Ошибку гасим на первом же исправлении, а не после
                // повторной отправки
                if (error) setError(null);
              }}
              // Цифровая клавиатура: ID у всех трёх площадок числовой,
              // а буквенная раскладка на телефоне добавляет лишний шаг
              inputMode="numeric"
              autoComplete="off"
              placeholder="Например: 122004705"
              className="h-12 bg-[hsl(140_26%_8%)] border-[hsl(142_26%_15%)] text-foreground
                         font-mono text-[15px] focus-visible:ring-primary"
            />
            {error && (
              <p className="flex items-start gap-1.5 text-[12.5px] text-destructive">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {error}
              </p>
            )}
          </div>

          <Button
            className="w-full h-12 font-semibold"
            // Пустое поле гасит кнопку, а не отвечает ошибкой после
            // нажатия: человек видит условие до действия
            disabled={submitting || !accountId.trim()}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Отправка…
              </span>
            ) : (
              'Отправить на проверку'
            )}
          </Button>
        </motion.div>
      </Shell>
    );
  }

  // ── Шаг 1: приветствие + выбор рынка ─────────────────────────────────────
  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5"
      >
        {/* Шапка как в окнах разделов: значок и текст в строку, слева.
            Крупный значок по центру со свечением занимал треть экрана и
            отодвигал вниз всё, ради чего человек сюда пришёл */}
        <div className="flex items-start gap-3.5">
          <span
            className="w-12 h-12 rounded-[15px] flex items-center justify-center flex-shrink-0
                       border border-white/[0.07]"
            style={{
              background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
              boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.1)',
              color: 'hsl(142 76% 62%)',
            }}
          >
            <GraduationCap className="w-6 h-6" />
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-[20px] tracking-tight text-foreground">
              Доступ к академии
            </h1>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1.5">
              Зарегистрируйте торговый счёт и пополните его на любую сумму -
              этого достаточно, чтобы открыть все материалы.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              aria-label="Назад"
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                         border border-white/[0.08] bg-white/[0.04] text-muted-foreground
                         transition-colors hover:bg-white/[0.09] hover:text-foreground
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`${PANEL} p-4 space-y-2.5`} style={PANEL_BG}>
          <div className="flex items-start gap-2.5 text-sm">
            <Radio className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground"><span className="text-foreground font-semibold">Форум с live-торговлей</span> - сделки и разборы вместе с трейдером</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground"><span className="text-foreground font-semibold">48 уроков и стратегии</span> - полная программа обучения</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <Bot className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground"><span className="text-foreground font-semibold">AI-наставник 24/7</span> - без лимитов</span>
          </div>
        </div>

        <div className="space-y-3">
          <MarketCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Регистрация FOREX"
            tagline="Pocket Option или FxPro"
            onClick={() => { setError(null); setStep('forex-brokers'); }}
          />
          <MarketCard
            icon={<Bitcoin className="w-6 h-6 text-accent" />}
            label="Регистрация CRYPTO"
            tagline={MARKET_META.crypto.tagline}
            onClick={() => chooseMarket('crypto')}
          />
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Без подписок</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-primary/70" /> Без скрытых платежей</span>
        </div>
      </motion.div>
    </Shell>
  );
}

// ── Инфо-блок FOREX (аналог текста в боте) ─────────────────────────────────
function ForexInfo() {
  const steps = [
    <>Зарегистрируйтесь по кнопке ниже</>,
    <>Пополните счёт от <b className="text-foreground">$20</b> с промокодом <b className="text-primary">WELCOME50</b> (+50% бонус)</>,
    <>Введите ID аккаунта на следующем шаге</>,
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Как получить доступ за 3 шага:</p>

      <div className="space-y-2.5">
        {steps.map((stepText, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <span>{stepText}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-yellow-100/90 leading-relaxed">
          Уже есть аккаунт на платформе? Удалите его (Настройки → Удалить аккаунт)
          и зарегистрируйтесь заново по нашей ссылке, иначе верификация невозможна.
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground">⏱ Верификация до 30 мин · 📞 @NMNH_MANAGER</p>
    </div>
  );
}

// ── Инфо-блок FXPRO ────────────────────────────────────────────────────────
function FxProInfo() {
  const steps = [
    <>Зарегистрируйтесь в <b className="text-foreground">FxPro</b> по кнопке ниже</>,
    <>Пополните счёт от <b className="text-foreground">$101</b></>,
    <>Введите ID аккаунта на следующем шаге</>,
  ];
  const perks = [
    'Классический форекс: валюты, металлы, индексы',
    'Регулируемый брокер с историей с 2006 года',
    'Терминалы MT4, MT5 и cTrader',
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Как получить доступ за 3 шага:</p>

      <div className="space-y-2.5">
        {steps.map((stepText, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <span>{stepText}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
        {perks.map((perk) => (
          <div key={perk} className="flex items-center gap-2 text-xs text-foreground/90">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {perk}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-yellow-100/90 leading-relaxed">
          Регистрируйтесь именно по нашей ссылке - иначе аккаунт не привяжется
          к Академии и верификация будет невозможна.
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground">⏱ Верификация до 30 мин · 📞 @NMNH_MANAGER</p>
    </div>
  );
}

// ── Инфо-блок CRYPTO (аналог текста в боте) ────────────────────────────────
function CryptoInfo() {
  const steps = [
    <>Зарегистрируйтесь на бирже <b className="text-foreground">WEEX</b> (кнопка ниже)</>,
    <>Пополните счёт от <b className="text-foreground">$100</b></>,
    <>Введите ID аккаунта на следующем шаге</>,
  ];
  const perks = ['Без подписок', 'Без скрытых платежей', 'Без дополнительных условий'];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Доступ к форуму за 3 шага:</p>

      <div className="space-y-2.5">
        {steps.map((stepText, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <span>{stepText}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
        {perks.map((perk) => (
          <div key={perk} className="flex items-center gap-2 text-xs text-foreground/90">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {perk}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 p-3">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground/90 leading-relaxed">
          После пополнения открывается доступ ко всем материалам, разборам и торговым
          идеям внутри сообщества.
        </p>
      </div>
    </div>
  );
}

/**
 * Полоса пути.
 *
 * Через шлюз идут лиды, и главный вопрос у них - «сколько ещё шагов».
 * Полоса отвечает на него сразу: три шага, видно, где человек сейчас.
 */
function StepStrip({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Площадка', 'Регистрация', 'Проверка'];

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((label, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;

        return (
          <div key={label} className="flex-1 min-w-0">
            <div
              className="h-[3px] rounded-full transition-colors duration-300"
              style={{
                background: done || active ? 'hsl(142 76% 52%)' : 'hsl(142 24% 16%)',
                boxShadow: active ? '0 0 8px hsl(142 76% 52% / 0.55)' : undefined,
              }}
            />
            <span
              className="block text-[10px] mt-1.5 truncate"
              style={{ color: active ? 'hsl(142 76% 58%)' : 'hsl(var(--muted-foreground))' }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Шаг назад: та же круглая стрелка, что в шапке окон */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Назад"
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                 border border-white/[0.08] bg-white/[0.04] text-muted-foreground
                 transition-colors hover:bg-white/[0.09] hover:text-foreground
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}

interface MarketCardProps {
  icon: React.ReactNode;
  label: string;
  tagline: string;
  onClick: () => void;
}

/** Та же карточка, что в окнах разделов: значок, название, подпись */
function MarketCard({ icon, label, tagline, onClick }: MarketCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="w-full rounded-[18px] p-4 flex items-center gap-3.5 text-left
                 border border-[hsl(142_38%_24%)] bg-[hsl(142_30%_10%)]
                 transition-colors duration-200 hover:bg-[hsl(142_32%_12%)]
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <span
        className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0
                   border border-white/[0.07]"
        style={{
          background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
          boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.1)',
        }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-[15px] tracking-[-0.01em] text-foreground">{label}</span>
        <span className="block text-[12px] text-muted-foreground mt-0.5">{tagline}</span>
      </span>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(142 20% 42%)' }} />
    </motion.button>
  );
}

/**
 * Оболочка шлюза.
 *
 * Та же поверхность, что у окон приложения: тёмный градиент, мягкая
 * рамка, спрей за содержимым. Раньше здесь было матовое стекло со
 * свечением по контуру - экран выбивался из остального приложения.
 *
 * Верхний отступ считает полосу кнопок Telegram: шлюз открывается на
 * весь экран, и без этого кнопка «Назад» уезжала под «Закрыть».
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[96] overflow-y-auto">
      <AppBackground />

      <div
        className="relative z-10 w-full max-w-md mx-auto px-4 pb-10"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-content-top, 0px) + 16px)',
        }}
      >
        <div
          className="relative overflow-hidden rounded-[26px] border border-[hsl(142_30%_20%)] p-5 sm:p-6"
          style={{
            background: 'linear-gradient(180deg, hsl(142 22% 12%) 0%, hsl(140 28% 6.5%) 100%)',
            boxShadow: '0 30px 70px -30px hsl(0 0% 0%), inset 0 1px 0 hsl(142 50% 45% / 0.16)',
          }}
        >
          <GraffitiSpray className="-top-8 -left-6 w-56 h-36" opacity={0.07} />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
