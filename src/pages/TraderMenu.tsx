import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, Target, Activity, BookOpen, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ContinueLearning } from '@/components/trader-menu/ContinueLearning';
import { ToolRow } from '@/components/trader-menu/ToolRow';

const TraderMenu = () => {
  const navigate = useNavigate();
  const { modules } = useProgress();

  // Цифры берём из самого курса, а не вписываем руками: раньше здесь
  // стояло «48 уроков», а их двадцать шесть
  const lessons = modules.flatMap(m => m.lessons);
  const completed = lessons.filter(l => l.isCompleted).length;

  // Куда человек вернётся - первый незакрытый урок
  const nextIndex = modules.findIndex(m => m.lessons.some(l => !l.isCompleted));
  const nextLesson = nextIndex >= 0
    ? modules[nextIndex].lessons.find(l => !l.isCompleted)?.title ?? null
    : null;

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
              <ContinueLearning
                completed={completed}
                total={lessons.length}
                nextLesson={nextLesson}
                nextModule={nextIndex >= 0 ? nextIndex + 1 : null}
                moduleCount={modules.length}
                onClick={() => navigate('/learning')}
              />

              <h3 className="text-xs text-muted-foreground mt-6 mb-2 px-1">
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

