import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Bitcoin, ArrowLeft, Clock, CheckCircle2, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTelegram } from '@/hooks/useTelegram';
import { useUserAccess } from '@/contexts/UserAccessContext';

type Market = 'forex' | 'crypto';

const REGISTRATION_LINKS: Record<Market, string> = {
  // Форекс — та же ссылка, что в боте
  forex: 'https://u3.shortink.io/main?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&al=1743587&ac=web&cid=948657&code=WELCOME50',
  // Крипто — WEEX
  crypto: 'https://www.weex.com/ru/register?vipCode=kaktotakxme',
};

const MARKET_LABEL: Record<Market, string> = {
  forex: '📈 FOREX',
  crypto: '🪙 CRYPTO',
};

const TIMER_SECONDS = 15 * 60;
const STATUS_POLL_MS = 20_000;

function getBotApiBase(): string {
  return import.meta.env.DEV
    ? '/bot-api'
    : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
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

type Step = 'welcome' | 'register';

export function RegistrationGate() {
  const { userId, user } = useTelegram();
  const { hasSubmittedAccount, fetchUserStatus } = useUserAccess();

  const [step, setStep] = useState<Step>('welcome');
  const [market, setMarket] = useState<Market>('forex');
  const [accountId, setAccountId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Таймер на регистрацию и пополнение — стартует на шаге ввода аккаунта
  useEffect(() => {
    if (step !== 'register') return;
    setSecondsLeft(TIMER_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step, market]);

  // Экран ожидания: периодически проверяем, не подтвердил ли админ доступ
  useEffect(() => {
    if (!hasSubmittedAccount) return;
    const id = setInterval(() => {
      fetchUserStatus();
    }, STATUS_POLL_MS);
    return () => clearInterval(id);
  }, [hasSubmittedAccount, fetchUserStatus]);

  const chooseMarket = (selected: Market) => {
    setMarket(selected);
    setError(null);
    openRegistration(REGISTRATION_LINKS[selected]);
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
        body: JSON.stringify({
          userId,
          market,
          accountId: acc,
          username: user?.username || '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        // Подтянет hasSubmittedAccount=true из базы → переключит на экран ожидания
        await fetchUserStatus();
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Заявка отправлена!</h2>
            <p className="text-gray-300 leading-relaxed">
              Мы проверяем ваш аккаунт и пополнение. Как только доступ будет подтверждён —
              Академия откроется автоматически.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Ожидаем подтверждения...
          </div>
          <Button variant="outline" onClick={() => fetchUserStatus()} className="w-full">
            Проверить статус
          </Button>
        </motion.div>
      </Shell>
    );
  }

  // ── Шаг 2: таймер + ввод аккаунта ────────────────────────────────────────
  if (step === 'register') {
    return (
      <Shell>
        <AnimatePresence mode="wait">
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-6"
          >
            <button
              onClick={() => setStep('welcome')}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold text-white">
                {MARKET_LABEL[market]}
              </div>
              <h2 className="text-xl font-bold text-white">Завершите регистрацию</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Зарегистрируйтесь по открывшейся ссылке и пополните счёт на любую сумму.
                Затем введите ID вашего аккаунта ниже.
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 py-2">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide">
                <Clock className="w-4 h-4" /> Время на регистрацию и пополнение
              </div>
              <div className={`text-4xl font-mono font-bold ${secondsLeft === 0 ? 'text-gray-500' : 'text-emerald-400'}`}>
                {formatTime(secondsLeft)}
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => openRegistration(REGISTRATION_LINKS[market])}
            >
              Открыть ссылку регистрации ещё раз
            </Button>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">ID зарегистрированного аккаунта</label>
              <Input
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Например: 122004705"
                inputMode="text"
                className="bg-white/5 border-white/15 text-white"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Отправка...
                </span>
              ) : (
                'Отправить на проверку'
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Shell>
    );
  }

  // ── Шаг 1: приветствие + выбор рынка ─────────────────────────────────────
  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-center"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">Добро пожаловать в Академию</h1>
          <p className="text-gray-300 leading-relaxed">
            Чтобы получить доступ к Академии, достаточно зарегистрировать торговый аккаунт
            (Форекс или Крипто) и пополнить его на любую сумму.
          </p>
          <p className="text-gray-400 text-sm">
            Без подписок и скрытых платежей. Выберите рынок для регистрации:
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full justify-center gap-2"
            onClick={() => chooseMarket('forex')}
          >
            <TrendingUp className="w-5 h-5" /> Регистрация FOREX
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => chooseMarket('crypto')}
          >
            <Bitcoin className="w-5 h-5" /> Регистрация CRYPTO
          </Button>
        </div>
      </motion.div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-5 py-8 overflow-y-auto">
      <div className="w-full max-w-md glass-card rounded-2xl border border-border/40 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
