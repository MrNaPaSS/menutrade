import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useCoinBalance } from '@/hooks/useCoinBalance';
import { ArrowRight, Briefcase, Coins, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ProgressRing';
import { useCountUp } from '@/hooks/useCountUp';
import { courses } from '@/data/courses';
import { cn } from '@/lib/utils';

const CARD_STYLE = {
  background: 'linear-gradient(162deg, hsl(142 20% 12%) 0%, hsl(140 26% 7%) 62%)',
  boxShadow: '0 12px 30px -18px hsl(0 0% 0% / 0.9), inset 0 1px 0 hsl(142 40% 40% / 0.14)',
} as const;

const Home = () => {
  const navigate = useNavigate();
  const { modules, getProgress, openCourses } = useProgress();
  const { coins } = useCoinBalance();

  const progress = getProgress();
  const shownPercent = useCountUp(progress);

  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length,
    0
  );
  const completedModules = modules.filter(m => m.lessons.every(l => l.isCompleted)).length;

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
            {/* Два входа вместо трёх: новости переехали в меню трейдера.
                Так главная помещается на экран без прокрутки */}
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <motion.div
                  key={section.id}
                  id={section.id}
                  role="button"
                  tabIndex={0}
                  onClick={section.onClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      section.onClick();
                    }
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + index * 0.06, duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                  whileTap={{ scale: 0.985 }}
                  style={CARD_STYLE}
                  className="group relative w-full text-left overflow-hidden rounded-[20px] p-4
                             border border-[hsl(142_28%_17%)] transition-[border-color] duration-200
                             hover:border-[hsl(142_40%_26%)]
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                             cursor-pointer"
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

                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between mt-3.5 group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      section.onClick();
                    }}
                  >
                    <span className="font-semibold">{section.action}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </motion.div>
              );
            })}
            {/* Статистика внизу, как и была: сюда доходят глазами после
                разделов, а не встречают её первой */}
            <motion.div
              id="home-progress-stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-[20px] border border-[hsl(142_28%_17%)] p-4"
              style={CARD_STYLE}
            >
              <div className="flex items-center gap-4 mb-4">
                <ProgressRing percent={progress}>
                  <span className="font-bold text-xl text-primary tabular-nums leading-none">
                    {shownPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">пройдено</span>
                </ProgressRing>

                <div className="min-w-0">
                  <h2 className="font-semibold text-[15.5px] text-foreground">Ваш прогресс</h2>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {openCourses.length > 0
                      ? `${openCourses.length} ${openCourses.length === 1 ? 'направление' : 'направления'} из ${courses.length}`
                      : 'Направления откроются после подтверждения счёта'}
                  </p>
                </div>
              </div>

              <div className={cn('grid gap-2.5', coins ? 'grid-cols-3' : 'grid-cols-2')}>
                <div className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[22px] font-bold text-primary tabular-nums leading-none">
                    {completedModules}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">Модулей</div>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[22px] font-bold text-primary tabular-nums leading-none">
                    {completedLessons}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5">Уроков</div>
                </div>

                {/* Монеты рядом с учёбой: их учёбой и зарабатывают */}
                {coins && (
                  <button
                    onClick={() => navigate('/referral')}
                    className="text-center p-2.5 rounded-xl bg-white/[0.03] border border-primary/20
                               transition-colors hover:bg-primary/[0.08]
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="text-[22px] font-bold text-primary tabular-nums leading-none
                                    flex items-center justify-center gap-1">
                      <Coins className="w-4 h-4" />
                      {coins.balance}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1.5">Монет</div>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
