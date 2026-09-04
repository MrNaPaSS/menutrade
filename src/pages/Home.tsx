import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StatusStrip } from '@/components/trader-menu/StatusStrip';
import { useProgress } from '@/hooks/useProgress';
import { useCoinBalance } from '@/hooks/useCoinBalance';
import { useDailyClaim } from '@/hooks/useDailyClaim';
import { Briefcase, ChevronRight, Radio } from 'lucide-react';

const CARD_STYLE = {
  background: 'linear-gradient(162deg, hsl(142 20% 12%) 0%, hsl(140 26% 7%) 62%)',
  boxShadow: '0 12px 30px -18px hsl(0 0% 0% / 0.9), inset 0 1px 0 hsl(142 40% 40% / 0.14)',
} as const;

const Home = () => {
  const navigate = useNavigate();
  const { getProgress } = useProgress();
  const { coins } = useCoinBalance();
  const { streak } = useDailyClaim();

  const progress = getProgress();

  const sections = [
    {
      id: 'live',
      icon: Radio,
      title: 'Форум и Live-торговля',
      description: 'Живые разборы рынка и сделки вместе с автором',
      action: 'Открыть форум',
      badge: 'LIVE',
      onClick: () => navigate('/live'),
    },
    {
      id: 'trader-menu',
      icon: Briefcase,
      title: 'Меню трейдера',
      description: 'Обучение, стратегии, новости, библиотека и софт',
      action: 'Открыть меню',
      onClick: () => navigate('/trader-menu'),
    },
  ];

  return (
    <div className="min-h-[100dvh] scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header />

        <main className="px-4 pt-5 flex justify-center">
          <div className="max-w-lg w-full mx-auto space-y-4">
            <StatusStrip
              metrics={[
                { value: coins?.balance ?? 0, label: 'монет', onClick: () => navigate('/referral') },
                { value: streak, label: 'дней подряд' },
                { value: progress, label: 'курса', suffix: '%' },
              ]}
            />

            {/* Два входа вместо трёх: новости переехали в меню трейдера.
                Так главная помещается на экран без прокрутки */}
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <motion.button
                  key={section.id}
                  id={section.id}
                  onClick={section.onClick}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + index * 0.06, duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                  whileTap={{ scale: 0.985 }}
                  style={CARD_STYLE}
                  className="group relative w-full text-left overflow-hidden rounded-[20px] p-4
                             border border-[hsl(142_28%_17%)] transition-[border-color] duration-200
                             hover:border-[hsl(142_40%_26%)]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-10 -left-8 w-32 h-32 rounded-full blur-2xl bg-primary/12"
                  />

                  <div className="relative flex items-center gap-3.5">
                    <span
                      className="w-12 h-12 rounded-[15px] flex items-center justify-center flex-shrink-0
                                 border border-white/[0.08] text-primary"
                      style={{
                        background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 13%))',
                        boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.12)',
                      }}
                    >
                      <Icon className="w-[22px] h-[22px]" strokeWidth={2} />
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-[15.5px] tracking-[-0.01em] text-foreground">
                          {section.title}
                        </span>
                        {section.badge && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                                           bg-red-500/10 border border-red-500/30">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full
                                               rounded-full bg-red-500 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                            </span>
                            <span className="text-[9.5px] font-mono font-bold text-red-400 tracking-widest">
                              {section.badge}
                            </span>
                          </span>
                        )}
                      </span>
                      <span className="block text-[12.5px] text-muted-foreground mt-0.5">
                        {section.description}
                      </span>
                    </span>

                    <ChevronRight className="w-5 h-5 text-primary/50 flex-shrink-0
                                             transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
