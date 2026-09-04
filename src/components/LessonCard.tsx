import { memo } from 'react';
import { motion } from 'framer-motion';
import { COIN_REWARDS } from '@/lib/coins';
import { Lesson } from '@/types/lesson';
import { Lock, CheckCircle, PlayCircle, Clock, ChevronRight, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
  index: number;
}

// memo: раздел перерисовывается при любом изменении прогресса, а
// карточка зависит только от своего урока. Без этого каждая заново
// проигрывала появление.
export const LessonCard = memo(function LessonCard({ lesson, onClick, index }: LessonCardProps) {
  const getIcon = () => {
    if (lesson.isLocked) return Lock;
    if (lesson.isCompleted) return CheckCircle;
    return PlayCircle;
  };

  const Icon = getIcon();

  return (
    <motion.button
      onClick={onClick}
      disabled={lesson.isLocked}
      className={cn(
        // transition-all заставляет браузер следить за каждым свойством,
        // включая тени и фильтры. Здесь меняются только цвета и рамка
        "group w-full p-3 rounded-xl text-left touch-manipulation",
        "transition-colors duration-200",
        "border border-border/40 neon-border",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        lesson.isLocked
          ? "opacity-50 cursor-not-allowed bg-muted/5 gray-scale"
          : "glass-card-hover cursor-pointer active:scale-[0.98]",
        lesson.isCompleted && "border-primary/30 bg-primary/5"
      )}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      // Задержка растёт только до шестой карточки: дальше список
      // всё равно за экраном, а хвост ждал бы почти секунду
      transition={{ delay: Math.min(index, 5) * 0.04, duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon with Glow */}
        <div className="relative flex-shrink-0">
          {!lesson.isLocked && lesson.isCompleted && (
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          )}
          <div className={cn(
            "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all duration-300",
            lesson.isLocked
              ? "bg-muted/10 border-border/30"
              : lesson.isCompleted
                ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_-5px_hsl(142,76%,52%,0.5)]"
                : "bg-background/40 border-white/10 group-hover:border-primary/30"
          )}>
            <Icon className={cn(
              "w-5 h-5 relative z-10 transition-colors",
              lesson.isLocked ? "text-muted-foreground" : "text-primary"
            )} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={cn(
              "font-display text-sm sm:text-base font-bold tracking-wide transition-colors line-clamp-1",
              lesson.isLocked ? "text-muted-foreground" : "text-foreground font-semibold"
            )}>
              {lesson.title}
            </h3>
            {lesson.isCompleted && (
              <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">Done</span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 leading-relaxed">
            {lesson.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 py-1 rounded-lg flex-shrink-0",
            lesson.isLocked ? "text-muted-foreground/40 bg-muted/5" : "text-muted-foreground bg-white/5 border border-white/5"
          )}>
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="font-semibold">{lesson.duration}</span>
          </div>

          {/* Награда за урок. Пройденным не показываем: монеты уже получены */}
          {!lesson.isLocked && !lesson.isCompleted && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded-lg
                            flex-shrink-0 text-primary bg-primary/10 border border-primary/20">
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="font-semibold tabular-nums">
                +{COIN_REWARDS.lesson_watched}
              </span>
            </div>
          )}

          {!lesson.isLocked && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
          )}
        </div>
      </div>
    </motion.button>
  );
});
