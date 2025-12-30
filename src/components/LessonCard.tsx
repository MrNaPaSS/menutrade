import { motion } from 'framer-motion';
import { Lesson } from '@/types/lesson';
import { Lock, CheckCircle, PlayCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
  index: number;
}

export function LessonCard({ lesson, onClick, index }: LessonCardProps) {
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
        "w-full p-4 sm:p-5 rounded-lg sm:rounded-xl text-left touch-manipulation min-h-[60px]",
        "border border-border/40",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        lesson.isLocked
          ? "opacity-50 cursor-not-allowed bg-muted/10"
          : "glass-card-hover cursor-pointer",
        lesson.isCompleted && "border-primary/30"
      )}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={!lesson.isLocked ? { x: 8, scale: 1.02 } : undefined}
      whileTap={!lesson.isLocked ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <motion.div
          className={cn(
            "relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
            "border",
            lesson.isLocked
              ? "bg-muted/30 border-border/30"
              : lesson.isCompleted
                ? "bg-primary/15 border-primary/30 shadow-[0_0_15px_-5px_hsl(142,76%,52%,0.4)]"
                : "bg-primary/10 border-primary/20"
          )}
          whileHover={!lesson.isLocked ? { scale: 1.1 } : undefined}
        >
          <Icon className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 relative z-10",
            lesson.isLocked ? "text-muted-foreground" : "text-primary"
          )} strokeWidth={2} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-display text-xs sm:text-sm font-semibold tracking-wide break-words overflow-wrap-anywhere word-break-break-word",
            lesson.isLocked ? "text-muted-foreground" : "text-foreground"
          )}>
            {lesson.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground break-words overflow-wrap-anywhere word-break-break-word whitespace-normal mt-0.5 line-clamp-2">
            {lesson.description}
          </p>
        </div>

        <div className={cn(
          "flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex-shrink-0",
          lesson.isLocked ? "text-muted-foreground/50" : "text-muted-foreground bg-muted/30"
        )}>
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="font-medium hidden sm:inline">{lesson.duration}</span>
        </div>
      </div>
    </motion.button>
  );
}
