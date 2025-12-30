import { motion, Variants } from 'framer-motion';
import { Module } from '@/types/lesson';
import { ChevronRight, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  onClick: () => void;
  index: number;
  badge?: string;
  showProgress?: boolean;
  showArrow?: boolean;
  variants?: Variants;
  className?: string;
}

export function ModuleCard({
  module,
  onClick,
  index,
  badge,
  showProgress = true,
  showArrow = false,
  variants,
  className
}: ModuleCardProps) {
  const completedLessons = module.lessons.filter(l => l.isCompleted).length;
  const totalLessons = module.lessons.length;
  const progress = Math.round((completedLessons / totalLessons) * 100);
  const isLocked = module.lessons[0]?.isLocked;

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1
      }
    }
  };

  const animationVariants = variants || defaultVariants;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      variants={animationVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={cn(
        "group relative w-full glass-card rounded-2xl p-5 md:p-6 text-left transition-all duration-300",
        "neon-border hover:bg-primary/5 active:scale-[0.98] touch-manipulation",
        "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:gap-8",
        isLocked && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
    >
      {/* Icon Container with Glow */}
      <div className="relative flex-shrink-0">
        {!isLocked && (
          <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors rounded-full" />
        )}
        <div className={cn(
          "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl backdrop-blur-md border flex items-center justify-center text-3xl sm:text-4xl shadow-xl transition-all duration-300",
          isLocked
            ? "bg-muted/20 border-white/5"
            : "bg-background/40 border-white/10 group-hover:border-primary/30 group-hover:scale-110"
        )}>
          {isLocked ? (
            <Lock className="w-6 h-6 text-muted-foreground" />
          ) : (
            <span className="relative z-10">{module.icon}</span>
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className={cn(
            "font-display font-bold text-lg sm:text-xl transition-colors line-clamp-1",
            !isLocked && "group-hover:text-primary"
          )}>
            {module.title}
          </h3>
          {badge && (
            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
              {badge}
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {module.description}
        </p>

        {showProgress ? (
          <div className="mt-2 sm:mt-3">
            <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
              <span className="text-muted-foreground font-medium">{completedLessons}/{totalLessons} уроков</span>
              <span className={cn("font-bold", progress === 100 ? "text-accent" : "text-primary")}>{progress}%</span>
            </div>
            <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/80">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              {totalLessons} {totalLessons === 1 ? 'материал' : 'материалов'}
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              {isLocked ? 'Заблокировано' : 'Доступно сейчас'}
            </span>
          </div>
        )}
      </div>

      {/* Arrow Indicator */}
      {(showArrow || !isLocked) && (
        <div className={cn(
          "hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300",
          "bg-white/5 border border-white/10",
          !isLocked && "group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:translate-x-1"
        )}>
          <ChevronRight className={cn(
            "w-5 h-5 transition-colors",
            isLocked ? "text-muted-foreground/30" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>
      )}
    </motion.button>
  );
}
