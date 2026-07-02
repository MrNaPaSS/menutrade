import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MatrixRain } from '@/components/MatrixRain';
import { BottomNav } from '@/components/BottomNav';
import { AccessDeniedScreen } from '@/components/AccessDeniedScreen';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, Radio, CandlestickChart, MessagesSquare, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FORUM_URL = 'https://t.me/+hobQYO9vXZIxMTMy';

function openTelegramLink(url: string): void {
  const tg = (window as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } }).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

const FEATURES = [
  {
    icon: CandlestickChart,
    title: 'Живые разборы рынка',
    description: 'Каждый день - анализ трендов, уровней и точек входа в реальном времени',
  },
  {
    icon: Radio,
    title: 'Торгуем вместе',
    description: 'Сделки в прямом эфире: вход, сопровождение, выход - шаг за шагом',
  },
  {
    icon: MessagesSquare,
    title: 'Прямой контакт с автором',
    description: 'Вопросы по сделкам и стратегиям - отвечаем в форуме, без посредников',
  },
  {
    icon: Users,
    title: 'Здравое комьюнити',
    description: 'Обмен реальным опытом - без фейка, только рост и поддержка',
  },
];

const Live = () => {
  const navigate = useNavigate();
  const { hasFullAccess, isLoading: accessLoading } = useUserAccess();

  const handleBack = () => navigate('/home');

  useSwipeBack({ onSwipeBack: handleBack, enabled: true });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  if (!accessLoading && !hasFullAccess) {
    return <AccessDeniedScreen feature="форум и live" onBack={handleBack} />;
  }

  return (
    <div className="min-h-[100dvh] scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <main className="p-4 sm:p-5 md:p-6 pb-24 flex justify-center">
          <div className="max-w-lg w-full mx-auto space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs font-mono font-bold text-red-400 tracking-widest">LIVE</span>
              </div>

              <h1 className="font-display font-bold text-2xl text-foreground neon-text-subtle">
                Форум и Live-торговля
              </h1>
              <p className="text-muted-foreground leading-relaxed text-sm px-1">
                Закрытый форум учеников Академии: здесь торгуем, разбираем рынок
                и растём вместе - каждый день.
              </p>
            </motion.div>

            <div className="space-y-3">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                    className="glass-card rounded-xl p-4 neon-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-sm mb-0.5">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                className="w-full h-12 font-display font-bold neon-glow"
                onClick={() => openTelegramLink(FORUM_URL)}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Войти в форум
              </Button>
              <p className="text-center text-[11px] text-muted-foreground mt-3">
                Форум откроется в Telegram. Доступ уже активирован для твоего аккаунта.
              </p>
            </motion.div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Live;
