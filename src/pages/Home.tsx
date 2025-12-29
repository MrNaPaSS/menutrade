import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { GraduationCap, Newspaper, ArrowRight, TrendingUp, Code, Briefcase, BookOpen, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const navigate = useNavigate();
  const { modules, getProgress } = useProgress();

  const progress = getProgress();

  // Подсчет статистики обучения
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.isCompleted).length,
    0
  );
  const completedModules = modules.filter(m =>
    m.lessons.every(l => l.isCompleted)
  ).length;
  const totalModules = modules.length;

  const handleHomeClick = () => {
    // Остаемся на главной странице
  };

  const sections = [
    {
      id: 'trader-menu',
      icon: Briefcase,
      title: 'Меню трейдера',
      description: 'Промокоды, уровни доступа, FAQ и торговые платформы',
      progress: 0,
      buttonText: 'Открыть меню',
      onClick: () => navigate('/trader-menu'),
      color: 'primary'
    },
    {
      id: 'learning',
      icon: GraduationCap,
      title: 'Быстрый доступ к обучению',
      description: `Пройдено ${completedLessons} из ${totalLessons} уроков`,
      progress: progress,
      buttonText: progress > 0 ? 'Продолжить обучение' : 'Начать обучение',
      onClick: () => navigate('/learning'),
      color: 'primary'
    },
    {
      id: 'news',
      icon: Newspaper,
      title: 'Последние новости',
      description: 'Актуальные новости рынка и экономический календарь',
      buttonText: 'Все новости',
      onClick: () => navigate('/news'),
      color: 'secondary'
    },
    {
      id: 'software',
      icon: Code,
      title: 'Наш софт',
      description: 'Доступные инструменты и программы для торговли',
      buttonText: 'Открыть софт',
      onClick: () => navigate('/software'),
      color: 'primary'
    },
    {
      id: 'library',
      icon: BookOpen,
      title: 'Библиотека здравого трейдера',
      description: 'Книги по трейдингу, психологии и управлению капиталом',
      buttonText: 'Открыть библиотеку',
      onClick: () => navigate('/library'),
      color: 'secondary'
    },
    {
      id: 'guess-chart',
      icon: Activity,
      title: 'Куда пойдёт график',
      description: 'Тренируй насмотренность и анализируй куда пойдёт цена.',
      buttonText: 'Играть',
      onClick: () => navigate('/guess-chart'),
      color: 'accent'
    }
  ];

  return (
    <div className="min-h-[100dvh] scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={progress} hideOnScroll={true} />

        <main className="p-4 sm:p-5 md:p-6 pb-24 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            {/* Заголовок */}
            <div className="mb-4 sm:mb-6">
              <h2 className="font-display font-bold text-xl sm:text-2xl mb-1 sm:mb-2">Главная</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Добро пожаловать в Академию здравого трейдера
              </p>
            </div>

            {/* Карточки разделов */}
            <div className="space-y-3 sm:space-y-4">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const getColorClasses = (color: string) => {
                  switch (color) {
                    case 'primary':
                      return {
                        bg: 'bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20',
                        icon: 'text-primary'
                      };
                    case 'secondary':
                      return {
                        bg: 'bg-gradient-to-br from-secondary/15 to-secondary/25 border-secondary/20',
                        icon: 'text-secondary'
                      };
                    case 'accent':
                      return {
                        bg: 'bg-gradient-to-br from-accent/15 to-accent/25 border-accent/20',
                        icon: 'text-accent'
                      };
                    default:
                      return {
                        bg: 'bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20',
                        icon: 'text-primary'
                      };
                  }
                };
                const colorClasses = getColorClasses(section.color);

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="glass-card rounded-xl p-4 sm:p-5 md:p-6 neon-border transition-all duration-300 touch-manipulation min-h-[60px]">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                        <motion.div
                          className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border ${colorClasses.bg} shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)] flex-shrink-0`}
                          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${colorClasses.icon}`} />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-base sm:text-lg font-bold tracking-wide mb-1">
                            {section.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                            {section.description}
                          </p>

                          {/* Прогресс для обучения */}
                          {section.id === 'learning' && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-muted-foreground font-medium">
                                  {completedModules}/{totalModules} модулей
                                </span>
                                <span className="font-bold text-primary">{progress}%</span>
                              </div>
                              <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.8, delay: 0.3 }}
                                />
                              </div>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between group"
                            onClick={(e) => {
                              e.stopPropagation();
                              section.onClick();
                            }}
                          >
                            <span>{section.buttonText}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Статистика */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 sm:mt-6 glass-card rounded-xl p-4 sm:p-6 neon-border"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg">Ваш прогресс</h3>
                  <p className="text-xs text-muted-foreground">Общая статистика обучения</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/20">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                    {completedModules}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Модулей пройдено
                  </div>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/20">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                    {completedLessons}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Уроков пройдено
                  </div>
                </div>
              </div>
            </motion.div>

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

export default Home;

