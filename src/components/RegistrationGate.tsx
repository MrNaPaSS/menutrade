import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Bitcoin, ArrowLeft, Clock, CheckCircle2, Loader2,
  GraduationCap, ChevronRight, ExternalLink, ShieldCheck, Sparkles, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MatrixRain } from '@/components/MatrixRain';
import { useTelegram } from '@/hooks/useTelegram';
import { useUserAccess } from '@/contexts/UserAccessContext';

type Market = 'forex' | 'crypto';

const REGISTRATION_LINKS: Record<Market, string> = {
  // Форекс - та же ссылка, что в боте
  forex: 'https://u3.shortink.io/main?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&al=1743587&ac=web&cid=948657&code=WELCOME50',
  // Крипто - WEEX
  crypto: 'https://www.weex.com/ru/register?vipCode=kaktotakxme',
};

const MARKET_META: Record<Market, { label: string; tagline: string }> = {
  forex: { label: 'FOREX', tagline: 'Брокер · бонус к депозиту' },
  crypto: { label: 'CRYPTO', tagline: 'Биржа WEEX' },
};

const TIMER_SECONDS = 15 * 60;

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

type Step = 'welcome' | 'info' | 'register';

export function RegistrationGate() {
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
            <div className="relative w-24 h-24 rounded-full glass-card neon-border flex items-center justify-center">
              <CheckCircle2 className="w-11 h-11 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-foreground neon-text-subtle">
              Заявка отправлена
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Проверяем регистрацию и пополнение. Как только доступ подтвердится,
              Академия откроется <span className="text-primary font-semibold">автоматически</span>,
              ничего нажимать не нужно.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-primary/80 font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            ОЖИДАЕМ ПОДТВЕРЖДЕНИЯ…
          </div>
        </motion.div>
      </Shell>
    );
  }

  const meta = MARKET_META[market];
  const Icon = market === 'forex' ? TrendingUp : Bitcoin;

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
            <button
              onClick={() => setStep('welcome')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-display font-bold text-lg leading-none text-foreground">{meta.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{meta.tagline}</div>
              </div>
            </div>

            {market === 'forex' ? <ForexInfo /> : <CryptoInfo />}

            <Button className="w-full h-12 font-display font-bold neon-glow" onClick={goRegister}>
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
          <button
            onClick={() => setStep('info')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-none text-foreground">{meta.label}</div>
              <div className="text-xs text-muted-foreground mt-1">Введите ID аккаунта после пополнения</div>
            </div>
          </div>

          {/* Таймер */}
          <div className="glass-card rounded-xl p-4 neon-border">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Clock className="w-3.5 h-3.5" /> Время на регистрацию
              </span>
              <span className={`font-mono font-bold text-2xl ${secondsLeft === 0 ? 'text-muted-foreground' : 'text-primary neon-text-subtle'}`}>
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
          </div>

          <button
            onClick={() => openRegistration(REGISTRATION_LINKS[market])}
            className="w-full flex items-center justify-center gap-2 text-sm text-primary/90 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Открыть ссылку регистрации ещё раз
          </button>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">ID зарегистрированного аккаунта</label>
            <Input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Например: 122004705"
              className="h-12 bg-muted/40 border-border/60 text-foreground font-mono focus-visible:ring-primary"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button
            className="w-full h-12 font-display font-bold neon-glow"
            disabled={submitting}
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
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/40 flex items-center justify-center neon-border">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl text-foreground neon-text-subtle">
              Доступ к Академии
            </h1>
            <p className="text-muted-foreground leading-relaxed text-sm px-1">
              Зарегистрируйте торговый аккаунт и пополните его на любую сумму,
              этого достаточно, чтобы открыть все материалы.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <MarketCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Регистрация FOREX"
            tagline={MARKET_META.forex.tagline}
            onClick={() => chooseMarket('forex')}
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

      <p className="text-[11px] text-muted-foreground">⏱ Верификация до 30 мин · 📞 @kaktotakxm</p>
    </div>
  );
}

// ── Инфо-блок CRYPTO (аналог текста в боте) ────────────────────────────────
function CryptoInfo() {
  const steps = [
    <>Зарегистрируйтесь на бирже <b className="text-foreground">WEEX</b> (кнопка ниже)</>,
    <>Пополните счёт на <b className="text-foreground">любую сумму</b></>,
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

interface MarketCardProps {
  icon: React.ReactNode;
  label: string;
  tagline: string;
  onClick: () => void;
}

function MarketCard({ icon, label, tagline, onClick }: MarketCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full glass-card glass-card-hover rounded-xl p-4 flex items-center gap-3.5 text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-base text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{tagline}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </motion.button>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <MatrixRain />
      <div className="relative z-10 w-full max-w-md px-5 py-8">
        <div className="glass-card neon-border rounded-2xl p-6 sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
