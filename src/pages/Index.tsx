import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { ModuleCard } from '@/components/ModuleCard';
import { LessonCard } from '@/components/LessonCard';
import { LessonContent } from '@/components/LessonContent';
import { BottomNav } from '@/components/BottomNav';
import { MasterTest } from '@/components/MasterTest';
import { Quiz } from '@/components/Quiz';
import { useProgress } from '@/hooks/useProgress';
import { Module, Lesson, QuizQuestion } from '@/types/lesson';
import { ArrowLeft, RotateCcw, Trophy, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { masterTest, masterTestPassingThreshold } from '@/data/masterTest';

type View = 'modules' | 'lessons' | 'content' | 'master-test' | 'module-test';

const Index = () => {
  const navigate = useNavigate();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();
  
  const { 
    modules, 
    completeLesson,
    completeModule,
    getProgress, 
    resetProgress,
    isMasterTestCompleted,
    completeMasterTest,
    isAllModulesCompleted
  } = useProgress();
  const [view, setView] = useState<View>('modules');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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

  const handleModuleTestComplete = () => {
    if (selectedModule) {
      completeModule(selectedModule.id);
      handleBackToModules();
    }
  };

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
    const currentScrollY = latest;
    
    // Показываем при прокрутке вверх или если прокрутка меньше 50px
    if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setIsHeaderVisible(true);
    } 
    // Скрываем при прокрутке вниз больше 50px
    else if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsHeaderVisible(false);
    }
    
    setLastScrollY(currentScrollY);
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
            className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4"
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
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
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
        <div className="relative z-10">
          {/* Sticky header с кнопкой назад */}
          <motion.div 
            className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4"
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
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
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

          <main className="p-2.5 sm:p-3 md:p-4 pb-8 sm:pb-10 flex justify-center">
            <div className="max-w-lg w-full mx-auto">
              <div className="space-y-3 mb-6">
                {currentModule.lessons.map((lesson, index) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onClick={() => handleLessonClick(lesson)}
                    index={index}
                  />
                ))}
              </div>

              {moduleQuestions.length > 0 && (
                <button
                  onClick={handleModuleTestClick}
                  disabled={!allLessonsCompleted || currentModule.isCompleted}
                  className={`w-full glass-card rounded-xl p-4 neon-border transition-all duration-300 flex items-center justify-center gap-3 font-display font-semibold text-lg ${
                    allLessonsCompleted && !currentModule.isCompleted
                      ? 'hover:bg-primary/10 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Brain className={`w-6 h-6 ${allLessonsCompleted && !currentModule.isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{currentModule.isCompleted ? 'Модуль пройден!' : allLessonsCompleted ? 'Пройти тест по модулю' : 'Пройти тест по модулю (пройдите все уроки)'}</span>
                </button>
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
          <div className="max-w-lg w-full mx-auto">
            <motion.div 
              className="relative flex items-center justify-center mb-4 sm:mb-6 sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4"
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
                  onClick={handleHomeClick}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">На главную</span>
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-display font-bold text-lg sm:text-xl">Модули обучения</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Проходи уроки и открывай новые
                </p>
              </div>
              <div className="absolute right-4 -top-3">
                <SimpleMenu />
              </div>
            </motion.div>

            <div className="space-y-3 sm:space-y-4">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onClick={() => handleModuleClick(module)}
                  index={index}
                />
              ))}
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
