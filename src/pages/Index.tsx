import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { LessonContent } from '@/components/LessonContent';
import { BottomNav } from '@/components/BottomNav';
import { MasterTest } from '@/components/MasterTest';
import { Quiz } from '@/components/Quiz';
import { useProgress } from '@/hooks/useProgress';
import { useCourseAccess } from '@/hooks/useCourseAccess';
import { CoursePicker } from '@/components/CoursePicker';
import { courses, type Course } from '@/data/courses';
import type { CourseId } from '@/lib/courseAccess';
import { useBackAction } from '@/contexts/BackNavigationContext';
import { Module, Lesson, QuizQuestion } from '@/types/lesson';
import { ArrowLeft, RotateCcw, Trophy, Brain, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { masterTest, masterTestPassingThreshold } from '@/data/masterTest';

/** Общая рамка для группы строк - как в меню трейдера. */
const PANEL_STYLE = {
  background: 'linear-gradient(180deg, hsl(142 20% 10%) 0%, hsl(140 27% 6.5%) 100%)',
  boxShadow: '0 12px 32px -22px hsl(0 0% 0%), inset 0 1px 0 hsl(142 42% 38% / 0.12)',
} as const;

const PANEL_CLASS =
  'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';

type View = 'courses' | 'modules' | 'lessons' | 'content' | 'master-test' | 'module-test';

const Index = () => {
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  // Прошлое положение прокрутки держим в ref, а не в состоянии: оно
  // нужно только для сравнения и не участвует в разметке. В состоянии
  // оно перерисовывало весь раздел на каждом кадре прокрутки - вместе
  // со всеми карточками уроков и их пружинами.
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();
  const { courses: courseAccess, partners } = useCourseAccess();
  const location = useLocation();

  const {
    modules,
    accessLoading,
    completedByCourse,
    completeLesson,
    completeModule,
    getProgress,
    resetProgress,
    isMasterTestCompleted,
    completeMasterTest,
    isAllModulesCompleted
  } = useProgress();
  // Начинаем с выбора курса: рынков теперь три, и открыт человеку
  // тот, чей счёт подтверждён
  const [view, setView] = useState<View>('courses');
  const [course, setCourse] = useState<Course | null>(null);

  // Из меню трейдера приходят с конкретным курсом - открываем его
  // сразу, чтобы «продолжить» действительно продолжало
  useEffect(() => {
    const wanted = (location.state as { courseId?: CourseId } | null)?.courseId;
    if (!wanted || course) return;

    const target = courses.find(c => c.id === wanted);
    if (target && courseAccess[wanted] === 'open') {
      setCourse(target);
      setView('modules');
    }
  }, [location.state, course, courseAccess]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Проверка доступа
  // Стены на весь раздел больше нет: направления показываем всем, а
  // закрывает их замок на каждом курсе. Человек без верификации должен
  // видеть, что рынков три и что именно открывает каждый - иначе он не
  // узнает, ради чего заводить счёт.

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setView('lessons');
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.isLocked) return;
    setSelectedLesson(lesson);
    setView('content');
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setView('modules');
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setView('lessons');
  };

  const handleLessonComplete = () => {
    if (selectedModule && selectedLesson) {
      completeLesson(selectedModule.id, selectedLesson.id);
      handleBackToLessons();
    }
  };

  const handleModuleTestClick = () => {
    setView('module-test');
  };

  // Тест предлагаем в конце последнего урока модуля - когда человек уже
  // дочитал материал. Модуль, который закрыт, повторно проходить незачем.
  const currentModuleQuestions = selectedModule
    ? selectedModule.lessons.flatMap(lesson => lesson.quiz || [])
    : [];
  const isLastLessonOfModule = !!(selectedModule && selectedLesson
    && selectedModule.lessons[selectedModule.lessons.length - 1]?.id === selectedLesson.id);
  const offerModuleTest = !!(
    isLastLessonOfModule
    && currentModuleQuestions.length > 0
    && !selectedModule?.isCompleted
  );

  const handleModuleTestComplete = () => {
    if (selectedModule) {
      completeModule(selectedModule.id);
      handleBackToModules();
    }
  };

  const handleBackToCourses = () => {
    setCourse(null);
    setView('courses');
  };

  const courseModules = course
    ? modules.filter(m => course.modules.some(cm => cm.id === m.id))
    : modules;

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleMasterTestComplete = () => {
    completeMasterTest();
    setView('modules');
  };

  const handleMasterTestClick = () => {
    setView('master-test');
  };

  const progress = getProgress();

  // Что значит «назад» на каждом виде. Жест один на всё приложение,
  // здесь только сказано, куда он ведёт отсюда
  useBackAction(handleBackToCourses, view === 'modules');
  useBackAction(
    handleBackToModules,
    (view === 'lessons' || view === 'module-test') && selectedModule !== null
  );
  useBackAction(
    handleBackToLessons,
    view === 'content' && selectedLesson !== null && selectedModule !== null
  );

  // Скроллим вверх при изменении view
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });

    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [view]);

  // Логика скрытия заголовка при прокрутке
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    lastScrollY.current = latest;

    // Перерисовываем только когда заголовок правда меняет состояние,
    // а не на каждом движении пальца
    const shouldShow = latest < previous || latest < 50;
    setIsHeaderVisible(visible => (visible === shouldShow ? visible : shouldShow));
  });
  const allCompleted = isAllModulesCompleted();
  const masterTestCompleted = isMasterTestCompleted();

  // Render master test
  if (view === 'master-test') {
    return (
      <div className="min-h-[100dvh] scanline pb-16">
        <MatrixRain />
        <div className="relative z-10">
          <SimpleMenu />
          <MasterTest
            questions={masterTest}
            onComplete={handleMasterTestComplete}
            onBack={() => setView('modules')}
            passingThreshold={masterTestPassingThreshold}
          />
        </div>
        <BottomNav onHomeClick={handleHomeClick} />
      </div>
    );
  }

  // Render lesson content
  if (view === 'content' && selectedLesson && selectedModule) {
    // Get fresh lesson data
    const currentModule = modules.find(m => m.id === selectedModule.id);
    const currentLesson = currentModule?.lessons.find(l => l.id === selectedLesson.id);

    if (!currentLesson) return null;

    return (
      <div className="min-h-[100dvh] scanline pb-16">
        <MatrixRain />
        <div className="relative z-10">
          <LessonContent
            lesson={currentLesson}
            onBack={handleBackToLessons}
            onComplete={handleLessonComplete}
            offerModuleTest={offerModuleTest}
            onModuleTest={handleModuleTestClick}
          />
        </div>
        <BottomNav onHomeClick={handleHomeClick} />
      </div>
    );
  }

  // Render module test
  if (view === 'module-test' && selectedModule) {
    const currentModule = modules.find(m => m.id === selectedModule.id);
    if (!currentModule) return null;

    // Объединяем все вопросы из всех уроков модуля
    const moduleQuestions: QuizQuestion[] = currentModule.lessons.flatMap(lesson => lesson.quiz);

    return (
      <div className="min-h-[100dvh] scanline pb-16">
        <MatrixRain />
        <div className="relative z-10">
          {/* Sticky header с кнопкой назад */}
          <motion.div
            className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,12px))]"
            animate={{
              y: isHeaderVisible ? 0 : -100,
              opacity: isHeaderVisible ? 1 : 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{ pointerEvents: isHeaderVisible ? 'auto' : 'none', overflow: 'hidden' }}
          >
            <div className="relative flex items-center justify-center py-2 sm:py-3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToLessons}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Назад</span>
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-display font-bold text-lg sm:text-xl">Тест по модулю</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentModule.title}
                </p>
              </div>
              <div className="absolute right-4 -top-3">
                <SimpleMenu />
              </div>
            </div>
          </motion.div>

          <main className="p-2.5 sm:p-3 md:p-4 pb-8 sm:pb-10 flex justify-center">
            <div className="max-w-lg w-full mx-auto">
              <p className="text-sm text-muted-foreground mb-2 text-center">
                Вопросов: <span className="text-primary font-bold">{moduleQuestions.length}</span>
              </p>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Порог прохождения: 70%
              </p>

              <div className="glass-card rounded-xl p-6 neon-border">
                <Quiz
                  questions={moduleQuestions}
                  onComplete={handleModuleTestComplete}
                  passingThreshold={70}
                />
              </div>
            </div>
          </main>
        </div>
        <BottomNav onHomeClick={handleHomeClick} />
      </div>
    );
  }

  // Render lessons list
  if (view === 'lessons' && selectedModule) {
    const currentModule = modules.find(m => m.id === selectedModule.id);
    if (!currentModule) return null;

    // Проверяем, все ли уроки завершены
    const allLessonsCompleted = currentModule.lessons.every(lesson => lesson.isCompleted);
    const moduleQuestions = currentModule.lessons.flatMap(lesson => lesson.quiz || []);

    return (
      <div className="min-h-[100dvh] scanline pb-16">
        <MatrixRain />
        <div className="relative z-10 pt-4 sm:pt-5 md:pt-6">
          {/* Sticky header с кнопкой назад */}
          <motion.div
            className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,12px))]"
            animate={{
              y: isHeaderVisible ? 0 : -100,
              opacity: isHeaderVisible ? 1 : 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{ pointerEvents: isHeaderVisible ? 'auto' : 'none', overflow: 'hidden' }}
          >
            <div className="relative flex items-center justify-center py-2 sm:py-3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToModules}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Назад</span>
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-display font-bold text-lg sm:text-xl">{currentModule.title}</h2>
              </div>
              <div className="absolute right-4 -top-3">
                <SimpleMenu />
              </div>
            </div>
          </motion.div>

          <main className="p-4 sm:p-5 md:p-6 pb-8 sm:pb-10 flex justify-center">
            <div className="max-w-lg md:max-w-3xl w-full mx-auto">
              <div className={cn(PANEL_CLASS, 'mb-3')} style={PANEL_STYLE}>
                {currentModule.lessons.map((lesson, index) => (
                  <TerminalRow
                    key={lesson.id}
                    index={index}
                    icon={
                      lesson.isCompleted
                        ? <Check className="w-[18px] h-[18px]" />
                        : <span className="font-mono text-[13px] tabular-nums">{index + 1}</span>
                    }
                    tone="green"
                    title={lesson.title}
                    caption={lesson.duration ? `${lesson.duration}` : 'Урок'}
                    value={lesson.isCompleted ? 'пройден' : undefined}
                    valueLive={lesson.isCompleted}
                    locked={lesson.isLocked}
                    onClick={lesson.isLocked ? undefined : () => handleLessonClick(lesson)}
                  />
                ))}
              </div>

              {/* Тест предлагается в конце последнего урока. Внизу списка
                  оставляем только отметку, что модуль уже закрыт */}
              {moduleQuestions.length > 0 && currentModule.isCompleted && (
                <div className="w-full glass-card rounded-xl p-3 neon-border flex items-center
                                justify-center gap-2.5 font-display font-semibold text-sm sm:text-base">
                  <Brain className="w-5 h-5 flex-shrink-0 text-primary" />
                  <span>Модуль пройден!</span>
                </div>
              )}
            </div>
          </main>
        </div>
        <BottomNav onHomeClick={handleHomeClick} />
      </div>
    );
  }

  // Выбор курса
  if (view === 'courses') {
    return (
      <div className="min-h-screen scanline pb-16">
        <MatrixRain />
        <div className="relative z-10">
          <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
            <div className="max-w-lg w-full mx-auto">
              <div className="relative flex items-center justify-center mb-4 sm:mb-6 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,12px))]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHomeClick}
                    className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">На главную</span>
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <h2 className="font-display font-bold text-lg sm:text-xl">Обучение</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Курс открыт по площадке, счёт на которой подтверждён
                  </p>
                </div>
                <div className="absolute right-0 -top-3">
                  <SimpleMenu />
                </div>
              </div>

              {accessLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-[104px] rounded-2xl bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : (
                <CoursePicker
                  access={courseAccess}
                  partners={partners}
                  completedByCourse={completedByCourse}
                  onSelect={(selected) => {
                    setCourse(selected);
                    setView('modules');
                  }}
                />
              )}
            </div>
          </main>
        </div>
        <BottomNav onHomeClick={handleHomeClick} />
      </div>
    );
  }

  // Render modules list
  return (
    <div className="min-h-screen scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg lg:max-w-5xl w-full mx-auto">
            <motion.div
              className="relative flex items-center justify-center mb-4 sm:mb-6 sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,12px))]"
              initial={{ y: 0, opacity: 1 }}
              animate={{
                y: isHeaderVisible ? 0 : -100,
                opacity: isHeaderVisible ? 1 : 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToCourses}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Курсы</span>
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-display font-bold text-lg sm:text-xl">
                  {course?.title ?? 'Модули обучения'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Проходи уроки и открывай новые
                </p>
              </div>
              <div className="absolute right-4 -top-3">
                <SimpleMenu />
              </div>
            </motion.div>

            {/* Строки, а не карточки в сетке: те оставляли половину
                площади пустой, а здесь видно состав модуля и прогресс */}
            <div className={PANEL_CLASS} style={PANEL_STYLE}>
              {courseModules.map((module, index) => {
                const total = module.lessons.length;
                const done = module.lessons.filter(l => l.isCompleted).length;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                const locked = module.lessons[0]?.isLocked ?? false;

                return (
                  <TerminalRow
                    key={module.id}
                    index={index}
                    icon={module.icon}
                    tone="green"
                    title={module.title}
                    caption={locked
                      ? 'Откроется после предыдущего модуля'
                      : `${done} из ${total} уроков`}
                    value={locked ? undefined : `${percent}%`}
                    valueLive={!locked && done > 0}
                    progress={locked ? undefined : percent}
                    locked={locked}
                    onClick={locked ? undefined : () => handleModuleClick(module)}
                  />
                );
              })}
            </div>

            {/* Master Test Card */}
            {allCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div
                  className={`
                    glass-card rounded-xl p-6 neon-border cursor-pointer
                    transition-all duration-300 hover:scale-[1.02]
                    ${masterTestCompleted ? 'opacity-75' : 'neon-border-intense'}
                  `}
                  onClick={handleMasterTestClick}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className={`
                        w-16 h-16 rounded-xl flex items-center justify-center text-3xl
                        ${masterTestCompleted
                          ? 'bg-accent/20 border border-accent/30'
                          : 'bg-gradient-to-br from-accent/30 to-primary/30 border border-primary/30'
                        }
                      `}
                      animate={masterTestCompleted ? {} : {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={masterTestCompleted ? {} : {
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      {masterTestCompleted ? '✅' : '🏆'}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-lg">
                          {masterTestCompleted ? 'Тест пройден' : 'Финальный тест'}
                        </h3>
                        {!masterTestCompleted && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-bold">
                            НОВОЕ
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {masterTestCompleted
                          ? 'Вы успешно прошли тест "Здоровый трейдер"!'
                          : 'Тест на "Здоровый трейдер" - финальная проверка знаний'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Порог прохождения: {masterTestPassingThreshold}%
                      </p>
                    </div>
                    <Trophy className={`w-6 h-6 ${masterTestCompleted ? 'text-accent' : 'text-primary'}`} />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground font-mono">
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

export default Index;
