import { motion } from 'framer-motion';
import { Lesson } from '@/types/lesson';
import { Lock, CheckCircle, PlayCircle, Clock, ChevronRight } from 'lucide-react';
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
        "group w-full p-4 sm:p-5 rounded-xl text-left touch-manipulation min-h-[60px] transition-all duration-300",
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
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon with Glow */}
        <div className="relative flex-shrink-0">
          {!lesson.isLocked && lesson.isCompleted && (
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          )}
          <div className={cn(
            "relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all duration-300",
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

          {!lesson.isLocked && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
          )}
        </div>
      </div>
    </motion.button>
  );
}
