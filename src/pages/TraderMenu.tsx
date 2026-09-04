import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, Target, Activity, BookOpen, Code, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { courses } from '@/data/courses';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { ToolRow } from '@/components/trader-menu/ToolRow';

const TraderMenu = () => {
  const navigate = useNavigate();
  const { completedByCourse } = useProgress();
  const { courses: courseAccess } = useCourseAccess();

  // Сводка для кнопки: сколько направлений открыто и общий прогресс
  const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);
  const openList = courses.filter(c => courseAccess[c.id] === 'open');
  const openCount = openList.length;
  const totals = openList.reduce(
    (acc, course) => {
      const total = course.modules
        .filter(m => !STRATEGY_MODULES.has(m.id))
        .reduce((sum, m) => sum + m.lessons.length, 0);
      return { total: acc.total + total, done: acc.done + (completedByCourse[course.id] ?? 0) };
    },
    { total: 0, done: 0 }
  );
  const overallPercent = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

  useSwipeBack({
    onSwipeBack: () => navigate('/home'),
    enabled: true
  });

  const handleHomeClick = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        {/* Header с кнопкой назад */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">Меню трейдера</h2>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            {/* Одно появление на весь экран, а не пять по очереди:
                раздел должен собраться, а не приезжать по частям */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {/* Обучение отдельной кнопкой: три направления с прогрессом
                  открываются шторкой, а не занимают треть меню */}
              <button
                onClick={() => navigate('/learning')}
                className="group w-full text-left rounded-2xl p-4 mb-6
                           bg-primary/[0.07] border border-primary/25
                           transition-colors duration-200 hover:bg-primary/[0.11]
                           active:scale-[0.99] touch-manipulation
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                                   bg-primary/15 border border-primary/25 text-primary">
                    <GraduationCap className="w-5 h-5" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block font-display font-bold text-base tracking-wide">
                      Обучение
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {openCount > 0
                        ? `${openCount} ${openCount === 1 ? 'направление открыто' : 'направления открыто'} из ${courses.length}`
                        : `${courses.length} направления: бинарные опционы, форекс, крипта`}
                    </span>
                  </span>

                  <ChevronRight className="w-5 h-5 text-primary/60 flex-shrink-0
                                           transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>

                {openCount > 0 && (
                  <div className="h-1 rounded-full bg-primary/15 overflow-hidden mt-3">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${Math.max(overallPercent, 2)}%` }}
                    />
                  </div>
                )}
              </button>

              <h3 className="text-xs text-muted-foreground mb-2 px-1">
                Инструменты
              </h3>

              {/* Один список с волосяными разделителями вместо четырёх
                  отдельных стеклянных карточек: тише, компактнее и
                  дешевле - четырьмя размытиями фона меньше */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden
                              divide-y divide-white/[0.06]">
                <ToolRow
                  title="Торговые стратегии"
                  meta="23 урока в четырёх модулях"
                  icon={Target}
                  onClick={() => navigate('/strategies')}
                />
                <ToolRow
                  title="Куда пойдёт график"
                  meta="Тренажёр на реальных графиках, без подсказок"
                  icon={Activity}
                  onClick={() => navigate('/guess-chart')}
                />
                <ToolRow
                  title="Библиотека"
                  meta="51 книга в восьми разделах"
                  icon={BookOpen}
                  onClick={() => navigate('/library')}
                />
                <ToolRow
                  title="Наш софт"
                  meta="Четыре инструмента: индикаторы, сигналы, платформа"
                  icon={Code}
                  onClick={() => navigate('/software')}
                />
              </div>
            </motion.div>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-muted-foreground font-mono bg-white/5 py-2 rounded-full border border-white/5 inline-block px-4">
                🐸 Built with 💚 for Академия здравого трейдера
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default TraderMenu;

