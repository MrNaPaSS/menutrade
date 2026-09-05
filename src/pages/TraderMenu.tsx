import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { useCoinBalance } from '@/hooks/useCoinBalance';
import { useDailyClaim } from '@/hooks/useDailyClaim';
import { useTelegram } from '@/hooks/useTelegram';
import { ArrowLeft, Activity, BookOpen, Calculator, Code, GraduationCap, Brain, Lock, Newspaper, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CELL, LABEL_SLOT, StatusStrip, VALUE_SLOT } from '@/components/trader-menu/StatusStrip';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { LearningModal } from '@/components/trader-menu/LearningModal';
import { StrategiesModal } from '@/components/trader-menu/StrategiesModal';
import { PositionCalculator } from '@/components/trader-menu/PositionCalculator';
import { TraderProfileModal } from '@/components/trader-menu/TraderProfileModal';
import { AccessDeniedScreen, type LockedFeature } from '@/components/AccessDeniedScreen';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { SoftwareListModal } from '@/components/trader-menu/SoftwareListModal';
import { SoftwareModal } from '@/components/SoftwareModal';
// Агент со своим чатом и историей нужен не каждому заходу -
// подгружаем его только когда открывают
const AgentApp = lazy(() => import('@/agent/AgentApp').then(m => ({ default: m.AgentApp })));
import type { SoftwareItem } from '@/data/software';
import { courses } from '@/data/courses';
import { strategyModules } from '@/data/strategies';
import { libraryCategories } from '@/data/library';

// Модули стратегий лежат в файле курса по бинаркам, но частью обучения
// не являются - у них свой раздел
const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

// Цифры считаем из данных: вписанное число молча устаревает, так уже
// было с «48 уроков»
const STRATEGY_LESSONS = strategyModules.reduce((sum, m) => sum + m.lessons.length, 0);

const SECTION_LABEL = 'hsl(var(--muted-foreground))';

/** Общая рамка для группы строк - так они читаются одним блоком. */
const PANEL_STYLE = {
  background: 'linear-gradient(180deg, hsl(142 20% 10%) 0%, hsl(140 27% 6.5%) 100%)',
  boxShadow: '0 12px 32px -22px hsl(0 0% 0%), inset 0 1px 0 hsl(142 42% 38% / 0.12)',
} as const;

const PANEL_CLASS =
  'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';

const TraderMenu = () => {
  const navigate = useNavigate();
  const { completedByCourse, modules, completeLesson } = useProgress();
  const { courses: courseAccess } = useCourseAccess();
  const { coins } = useCoinBalance();
  const { hasFullAccess } = useUserAccess();
  const { user } = useTelegram();
  const { streak } = useDailyClaim();

  const [coursesOpen, setCoursesOpen] = useState(false);
  const [strategiesOpen, setStrategiesOpen] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  // Карточка продукта поверх списка: закрыв её, человек
  // возвращается к списку, а не на экран целиком
  const [softwareItem, setSoftwareItem] = useState<SoftwareItem | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  // Нажатие на закрытый раздел ведёт на его витрину: сперва человек
  // видит, что внутри, и только потом - условие доступа. Шлюз с
  // выбором площадки открывается уже оттуда
  const [locked, setLocked] = useState<LockedFeature | null>(null);

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
      <AppBackground />
      <div className="relative z-10">
        {/* Шапка без своей заливки: под ней стоит тот же рваный фон,
            что и на главной, и вторая подложка его перекрывала бы */}
        <div className="sticky top-0 z-50 pb-2 px-4">
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
          </div>
        </div>

        <main className="px-4 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            {/* Профиль в одной панели с показателями: это один блок
                «кто я и как иду», а двумя плитками рядом он читался как
                два разных элемента */}
            <StatusStrip
              leading={
                <motion.button
                  onClick={() => (hasFullAccess ? setProfileOpen(true) : setLocked('профиль трейдера'))}
                  aria-label="Торговый профиль"
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    CELL,
                    'relative w-[86px] flex-none transition-colors',
                    'hover:bg-white/[0.03] active:bg-white/[0.05]',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                  )}
                >
                  {/* Фото человека вместо значка: свой профиль узнают по
                      лицу быстрее, чем по подписи */}
                  <span className={VALUE_SLOT}>
                    <span className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center
                                     border border-primary/25 bg-primary/10">
                      {user?.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserRound className="w-4 h-4" style={{ color: 'hsl(142 76% 62%)' }} />
                      )}

                      {!hasFullAccess && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/55">
                          <Lock className="w-3.5 h-3.5" style={{ color: 'hsl(142 20% 62%)' }} />
                        </span>
                      )}
                    </span>
                  </span>

                  <span
                    className={LABEL_SLOT}
                    style={{ color: hasFullAccess ? 'hsl(142 76% 58%)' : 'hsl(var(--muted-foreground))' }}
                  >
                    торговый профиль
                  </span>
                </motion.button>
              }
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
              Обучение
            </h2>

            {/* Одна кнопка: направления показывает окно, а не список на
                самом экране - так меню остаётся коротким */}
            <div className={PANEL_CLASS} style={PANEL_STYLE}>
              <TerminalRow
                index={0}
                icon={<GraduationCap className="w-[18px] h-[18px]" />}
                tone="green"
                title="Уроки"
                caption={
                  openRows.length > 0
                    ? `${totalDone} из ${totalAll} уроков · ${openRows.length} из ${courses.length} направлений`
                    : `${courses.length} направления · ${allLessons} уроков`
                }
                value={totalAll > 0 ? `${overall}%` : undefined}
                valueLive={totalAll > 0}
                progress={totalAll > 0 ? overall : undefined}
                onClick={() => setCoursesOpen(true)}
              />
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
                icon={<Brain className="w-[18px] h-[18px]" />}
                tone="green"
                title="AI-агент"
                caption="Разбор графика и обучение по трём рынкам"
                onClick={() => setAgentOpen(true)}
              />
              <TerminalRow
                index={1}
                icon={<Newspaper className="w-[18px] h-[18px]" />}
                tone="amber"
                title="Последние новости"
                caption="Календарь событий и новости рынка"
                onClick={() => navigate('/news')}
              />
              <TerminalRow
                index={2}
                icon={<BookOpen className="w-[18px] h-[18px]" />}
                tone="amber"
                title="Библиотека"
                caption={`Книги по трейдингу в ${libraryCategories.length} разделах`}
                onClick={() => navigate('/library')}
              />
              <TerminalRow
                index={3}
                icon={<Calculator className="w-[18px] h-[18px]" />}
                tone="cyan"
                title="Калькулятор сделки"
                caption="Объём, риск и цель по одной формуле"
                onClick={() => setCalcOpen(true)}
              />
              <TerminalRow
                index={4}
                icon={<Code className="w-[18px] h-[18px]" />}
                tone="violet"
                title="Наш софт"
                caption="Индикатор, расширение, платформа"
                onClick={() => setSoftwareOpen(true)}
              />
              <TerminalRow
                index={5}
                icon={<Activity className="w-[18px] h-[18px]" />}
                tone="green"
                title="Куда пойдёт график"
                caption="Тренажёр на реальных графиках"
                onClick={() => navigate('/guess-chart')}
              />
            </div>
          </div>
        </main>
      </div>

      {agentOpen && (
        <Suspense fallback={null}>
          <AgentApp onBack={() => setAgentOpen(false)} />
        </Suspense>
      )}

      <SoftwareListModal
        open={softwareOpen && !softwareItem}
        onClose={() => setSoftwareOpen(false)}
        onSelect={setSoftwareItem}
      />
      <SoftwareModal item={softwareItem} onClose={() => setSoftwareItem(null)} />

      <PositionCalculator open={calcOpen} onClose={() => setCalcOpen(false)} />

      <TraderProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Стратегии живут внутри обучения: это тот же материал, только
          без последовательности. Возврат ведёт обратно в направления,
          а не закрывает всё разом */}
      <StrategiesModal
        open={strategiesOpen && !locked}
        onClose={() => setStrategiesOpen(false)}
        onBackToLearning={() => {
          setStrategiesOpen(false);
          setCoursesOpen(true);
        }}
        hasAccess={hasFullAccess}
        onLocked={() => setLocked('стратегии')}
      />
      <LearningModal
        open={coursesOpen && !locked}
        onClose={() => setCoursesOpen(false)}
        access={courseAccess}
        completedByCourse={completedByCourse}
        modules={modules}
        onLessonComplete={completeLesson}
        onLocked={() => setLocked('обучение')}
        onOpenStrategies={() => {
          setCoursesOpen(false);
          setStrategiesOpen(true);
        }}
        strategyLessons={STRATEGY_LESSONS}
      />

      {locked && <AccessDeniedScreen feature={locked} onBack={() => setLocked(null)} />}
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default TraderMenu;
