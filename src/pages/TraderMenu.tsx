import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { ArrowLeft, GraduationCap, Target, Activity, BookOpen, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHasHover } from '@/hooks/useHasHover';

const TraderMenu = () => {
  const navigate = useNavigate();
  const hasHover = useHasHover();
  const { getProgress } = useProgress();
  const progress = getProgress();

  useSwipeBack({
    onSwipeBack: () => navigate('/home'),
    enabled: true
  });

  const handleHomeClick = () => {
    navigate('/home');
  };

  // Helper component for standard premium action cards
  const ActionCard = ({
    title,
    description,
    icon: Icon,
    onClick,
    colorClass = "primary",
    buttonText,
    index = 0
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 25 }}
      className="mb-4 sm:mb-6"
    >
      <div
        className="group relative glass-card rounded-2xl p-5 sm:p-6 neon-border cursor-pointer transition-all duration-300 hover:bg-white/5 active:scale-[0.98]"
        onClick={onClick}
      >
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full",
              colorClass === "primary" ? "bg-primary" : "bg-secondary"
            )} />
            <motion.div
              className={cn(
                "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 backdrop-blur-md",
                colorClass === "primary"
                  ? "bg-primary/15 border-primary/30 group-hover:border-primary/50"
                  : "bg-secondary/15 border-secondary/30 group-hover:border-secondary/50"
              )}
              whileHover={hasHover ? { rotate: [0, -5, 5, 0], scale: 1.1 } : undefined}
            >
              <Icon className={cn("w-7 h-7 sm:w-8 sm:h-8", colorClass === "primary" ? "text-primary" : "text-secondary")} />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-wide mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-1">
              {description}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between group/btn border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <span className="font-semibold">{buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        {/* Header с кнопкой назад */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4">
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

            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Всё для практики: уроки, стратегии, книги, софт и тренажёр
            </p>

            <ActionCard
              title="Обучение"
              description="48 уроков по модулям, с тестами"
              icon={GraduationCap}
              buttonText="Продолжить обучение"
              onClick={() => navigate('/learning')}
              index={0}
            />

            <ActionCard
              title="Торговые стратегии"
              description="Готовые схемы входа и выхода с примерами"
              icon={Target}
              buttonText="Открыть стратегии"
              onClick={() => navigate('/strategies')}
              colorClass="secondary"
              index={1}
            />

            <ActionCard
              title="Куда пойдёт график"
              description="Тренажёр насмотренности на реальных графиках"
              icon={Activity}
              buttonText="Играть"
              onClick={() => navigate('/guess-chart')}
              index={2}
            />

            <ActionCard
              title="Библиотека"
              description="Книги по трейдингу, психологии и капиталу"
              icon={BookOpen}
              buttonText="Открыть библиотеку"
              onClick={() => navigate('/library')}
              colorClass="secondary"
              index={3}
            />

            <ActionCard
              title="Наш софт"
              description="Индикаторы и инструменты для торговли"
              icon={Code}
              buttonText="Открыть софт"
              onClick={() => navigate('/software')}
              index={4}
            />

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

