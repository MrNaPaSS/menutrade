import { motion } from 'framer-motion';
import { Module } from '@/types/lesson';
import { ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  onClick: () => void;
  index: number;
}

export function ModuleCard({ module, onClick, index }: ModuleCardProps) {
  const completedLessons = module.lessons.filter(l => l.isCompleted).length;
  const totalLessons = module.lessons.length;
  const progress = Math.round((completedLessons / totalLessons) * 100);
  const isLocked = module.lessons[0]?.isLocked;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "w-full p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-left touch-manipulation min-h-[60px]",
        "border border-border/50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isLocked ? "opacity-50 cursor-not-allowed bg-muted/20" : "glass-card-hover cursor-pointer"
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={!isLocked ? { y: -4, scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
        <motion.div 
          className={cn(
            "relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0",
            "bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/20",
            !isLocked && "shadow-[0_0_20px_-5px_hsl(142,76%,52%,0.3)]"
          )}
          whileHover={!isLocked ? { rotate: [0, -5, 5, 0], scale: 1.1 } : undefined}
        >
          <span className="relative z-10">
            {isLocked ? <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" /> : module.icon}
          </span>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h2 className={cn(
            "font-display text-base sm:text-lg font-bold tracking-wide break-words overflow-wrap-anywhere word-break-break-word",
            isLocked ? "text-muted-foreground" : "text-foreground"
          )}>
            {module.title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 break-words overflow-wrap-anywhere word-break-break-word whitespace-normal">{module.description}</p>
          
          <div className="mt-2 sm:mt-3">
            <div className="flex justify-between text-[10px] sm:text-xs mb-1 sm:mb-1.5">
              <span className="text-muted-foreground font-medium">{completedLessons}/{totalLessons} уроков</span>
              <span className={cn("font-bold", progress === 100 ? "text-accent" : "text-primary")}>{progress}%</span>
            </div>
            <div className="relative h-1.5 sm:h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              />
            </div>
          </div>
        </div>

        <ChevronRight className={cn("w-4 h-4 sm:w-5 sm:h-5 mt-2 flex-shrink-0", isLocked ? "text-muted-foreground/50" : "text-primary")} />
      </div>
    </motion.button>
  );
}
