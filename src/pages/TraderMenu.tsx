import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useTelegram } from '@/hooks/useTelegram';
import { useDailyAttempts } from '@/hooks/useDailyAttempts';
import { ArrowLeft, Target, Activity, BookOpen, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningCard } from '@/components/trader-menu/LearningCard';
import { ToolTile } from '@/components/trader-menu/ToolTile';
import { strategyModules } from '@/data/strategies';
import { libraryCategories } from '@/data/library';
import { softwareItems } from '@/data/software';

/** Столько попыток тренажёра в день - как в самом тренажёре. */
const FREE_ROUNDS_PER_DAY = 3;

// Цифры считаем из данных, а не вписываем: содержимое меняется, а
// вписанное число молча устаревает. Так уже было с «48 уроков».
const STRATEGY_LESSONS = strategyModules.reduce((sum, m) => sum + m.lessons.length, 0);
const LIBRARY_BOOKS = libraryCategories.reduce(
  (sum, c: { books?: unknown[] }) => sum + (c.books?.length ?? 0),
  0
);

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const TraderMenu = () => {
  const navigate = useNavigate();
  const { completedByCourse } = useProgress();
  const { courses: courseAccess, partners } = useCourseAccess();
  const { userId } = useTelegram();
  // Тот же ключ, что и в самом тренажёре - счётчик у них общий
  const attempts = useDailyAttempts(userId, 'guess_chart', FREE_ROUNDS_PER_DAY);

  const handleHomeClick = () => navigate('/home');

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm
                           focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight">
              Меню трейдера
            </h1>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            >
              <LearningCard
                access={courseAccess}
                partners={partners}
                completedByCourse={completedByCourse}
                onSelect={(course) => navigate('/learning', { state: { courseId: course.id } })}
              />
            </motion.div>

            <h2 className="text-xs text-muted-foreground mt-6 mb-2.5 px-1">
              Инструменты
            </h2>

            {/* Сетка вместо списка: у каждого раздела своя площадь, и
                четыре плитки помещаются на экран без прокрутки */}
            <div className="grid grid-cols-2 gap-2.5">
              <ToolTile
                index={0}
                title="Стратегии"
                figure={`${STRATEGY_LESSONS} ${plural(STRATEGY_LESSONS, 'разбор', 'разбора', 'разборов')}`}
                icon={Target}
                onClick={() => navigate('/strategies')}
              />
              <ToolTile
                index={1}
                title="Куда пойдёт график"
                figure={
                  attempts.exhausted
                    ? 'Завтра снова'
                    : `${attempts.left} ${plural(attempts.left, 'попытка', 'попытки', 'попыток')} сегодня`
                }
                icon={Activity}
                accent={!attempts.exhausted}
                onClick={() => navigate('/guess-chart')}
              />
              <ToolTile
                index={2}
                title="Библиотека"
                figure={`${LIBRARY_BOOKS} ${plural(LIBRARY_BOOKS, 'книга', 'книги', 'книг')}`}
                icon={BookOpen}
                onClick={() => navigate('/library')}
              />
              <ToolTile
                index={3}
                title="Наш софт"
                figure={`${softwareItems.length} ${plural(softwareItems.length, 'инструмент', 'инструмента', 'инструментов')}`}
                icon={Code}
                onClick={() => navigate('/software')}
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default TraderMenu;
