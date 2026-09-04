import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useCoinBalance } from '@/hooks/useCoinBalance';
import { useDailyClaim } from '@/hooks/useDailyClaim';
import { useTelegram } from '@/hooks/useTelegram';
import { useDailyAttempts } from '@/hooks/useDailyAttempts';
import { ArrowLeft, Target, Activity, BookOpen, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusStrip } from '@/components/trader-menu/StatusStrip';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { courses } from '@/data/courses';
import { strategyModules } from '@/data/strategies';
import { libraryCategories } from '@/data/library';
import { softwareItems } from '@/data/software';

/** Столько попыток тренажёра в день - как в самом тренажёре. */
const FREE_ROUNDS_PER_DAY = 3;

// Модули стратегий лежат в файле курса по бинаркам, но частью обучения
// не являются - у них свой раздел
const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

// Цифры считаем из данных: вписанное число молча устаревает, так уже
// было с «48 уроков»
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

const SECTION_LABEL = 'hsl(142 16% 48%)';

/** Общая рамка для группы строк - так они читаются одним блоком. */
const PANEL_STYLE = {
  background: 'linear-gradient(180deg, hsl(142 20% 10%) 0%, hsl(140 27% 6.5%) 100%)',
  boxShadow: '0 12px 32px -22px hsl(0 0% 0%), inset 0 1px 0 hsl(142 42% 38% / 0.12)',
} as const;

const PANEL_CLASS =
  'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';

const TraderMenu = () => {
  const navigate = useNavigate();
  const { completedByCourse } = useProgress();
  const { courses: courseAccess, partners } = useCourseAccess();
  const { coins } = useCoinBalance();
  const { streak } = useDailyClaim();
  const { userId } = useTelegram();
  // Тот же ключ, что и в самом тренажёре - счётчик у них общий
  const attempts = useDailyAttempts(userId, 'guess_chart', FREE_ROUNDS_PER_DAY);

  const handleHomeClick = () => navigate('/home');

  const rows = courses.map(course => {
    const state = courseAccess[course.id] ?? 'closed';
    const total = course.modules
      .filter(m => !STRATEGY_MODULES.has(m.id))
      .reduce((sum, m) => sum + m.lessons.length, 0);
    const done = completedByCourse[course.id] ?? 0;
    return {
      course,
      state,
      total,
      done,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
      isOpen: state === 'open',
    };
  });

  const openRows = rows.filter(r => r.isOpen);
  const totalDone = openRows.reduce((sum, r) => sum + r.done, 0);
  const totalAll = openRows.reduce((sum, r) => sum + r.total, 0);
  const allLessons = rows.reduce((sum, r) => sum + r.total, 0);
  const overall = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

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
            <h1 className="font-display font-bold text-lg tracking-tight">
              Меню трейдера
            </h1>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="px-4 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            <StatusStrip
              metrics={[
                {
                  value: coins?.balance ?? 0,
                  label: 'монет',
                  onClick: () => navigate('/referral'),
                },
                { value: streak, label: 'дней подряд' },
                { value: overall, label: 'курса', suffix: '%' },
              ]}
            />

            <h2
              className="text-[11px] uppercase tracking-[0.1em] mt-6 mb-2 px-1"
              style={{ color: SECTION_LABEL }}
            >
              Обучение · {totalDone} из {totalAll || allLessons}
            </h2>

            <div className={PANEL_CLASS} style={PANEL_STYLE}>
              {rows.map(({ course, state, total, done, percent, isOpen }, index) => (
                <TerminalRow
                  key={course.id}
                  index={index}
                  icon={course.icon}
                  tone="green"
                  title={course.title}
                  caption={
                    isOpen
                      ? `${done} из ${total} уроков`
                      : state === 'pending'
                        ? 'ID отправлен, ждём подтверждения'
                        : partners[course.id]
                          ? `Открывает счёт на ${partners[course.id]}`
                          : `${total} уроков`
                  }
                  value={isOpen ? `${percent}%` : undefined}
                  valueLive={isOpen}
                  progress={isOpen ? percent : undefined}
                  locked={!isOpen}
                  onClick={
                    isOpen
                      ? () => navigate('/learning', { state: { courseId: course.id } })
                      : undefined
                  }
                />
              ))}
            </div>

            <h2
              className="text-[11px] uppercase tracking-[0.1em] mt-6 mb-2 px-1"
              style={{ color: SECTION_LABEL }}
            >
              Инструменты
            </h2>

            <div className={PANEL_CLASS} style={PANEL_STYLE}>
              <TerminalRow
                index={0}
                icon={<Target className="w-[18px] h-[18px]" />}
                tone="cyan"
                title="Торговые стратегии"
                caption="Готовые схемы входа и выхода"
                value={String(STRATEGY_LESSONS)}
                onClick={() => navigate('/strategies')}
              />
              <TerminalRow
                index={1}
                icon={<Activity className="w-[18px] h-[18px]" />}
                tone="green"
                title="Куда пойдёт график"
                caption="Тренажёр на реальных графиках"
                value={
                  attempts.exhausted
                    ? 'завтра'
                    : `${attempts.left} ${plural(attempts.left, 'попытка', 'попытки', 'попыток')}`
                }
                valueLive={!attempts.exhausted}
                onClick={() => navigate('/guess-chart')}
              />
              <TerminalRow
                index={2}
                icon={<BookOpen className="w-[18px] h-[18px]" />}
                tone="amber"
                title="Библиотека"
                caption={`Книги по трейдингу в ${libraryCategories.length} разделах`}
                value={String(LIBRARY_BOOKS)}
                onClick={() => navigate('/library')}
              />
              <TerminalRow
                index={3}
                icon={<Code className="w-[18px] h-[18px]" />}
                tone="violet"
                title="Наш софт"
                caption="Индикатор, расширение, платформа"
                value={String(softwareItems.length)}
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
