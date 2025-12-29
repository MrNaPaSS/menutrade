import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
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
  const allCompleted = isAllModulesCompleted();
  const masterTestCompleted = isMasterTestCompleted();

  // Render master test
  if (view === 'master-test') {
    return (
      <div className="min-h-screen scanline pb-24">
        <MatrixRain />
        <div className="relative z-10">
          <Header progress={progress} />
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
      <div className="min-h-screen scanline pb-24">
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
      <div className="min-h-screen scanline pb-24">
        <MatrixRain />
        <div className="relative z-10">
          <Header progress={progress} />
          
          <main className="p-4 pb-24">
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleBackToLessons}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Назад к урокам</span>
              </button>

              <div className="glass-card rounded-xl p-6 neon-border mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">Тест по модулю</h2>
                    <p className="text-sm text-muted-foreground">{currentModule.title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Вопросов: <span className="text-primary font-bold">{moduleQuestions.length}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Порог прохождения: 70%
                </p>
              </div>

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
      <div className="min-h-screen scanline pb-24">
        <MatrixRain />
        <div className="relative z-10">
          <Header progress={progress} />
          
          <main className="p-4 pb-24">
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleBackToModules}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Все модули</span>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="text-3xl">{currentModule.icon}</div>
                <div>
                  <h2 className="font-display font-bold text-xl">{currentModule.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                </div>
              </div>

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
    <div className="min-h-screen scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={progress} />
        
        <main className="p-4 pb-24">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">На главную</span>
              </Button>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-xl">Модули обучения</h2>
                <p className="text-sm text-muted-foreground">
                  Проходи уроки и открывай новые
                </p>
              </div>
              {progress > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetProgress}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
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
