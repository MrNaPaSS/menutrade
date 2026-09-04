import { motion, useReducedMotion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

/**
 * Полоса прогресса в шапке.
 *
 * Заполнение идёт через scaleX, а не width: ширина - свойство
 * раскладки, её анимация заставляет браузер пересчитывать страницу
 * каждый кадр, тогда как трансформацию считает композитор.
 *
 * Бесконечных циклов здесь больше нет. Раньше по полосе каждые три
 * секунды пробегал блик, а точка на конце пульсировала - на экране,
 * который человек видит чаще всего, это работа впустую и расход
 * батареи. Движение осталось одно: полоса доезжает до своего значения,
 * когда оно меняется.
 */
export function ProgressBar({ progress, showLabel = true }: ProgressBarProps) {
  const reduced = useReducedMotion();
  const filled = Math.min(Math.max(progress, 0), 100) / 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Твой прогресс
          </span>
          {/* key на значении: цифра меняется редко и заметно, короткий
              отклик здесь уместен - он показывает, что именно изменилось */}
          <motion.span
            className="text-sm font-bold text-primary font-display tabular-nums"
            key={progress}
            initial={reduced ? false : { scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {progress}%
          </motion.span>
        </div>
      )}

      <div
        className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-border/30"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />

        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full
                     bg-gradient-to-r from-primary via-primary to-secondary"
          initial={{ scaleX: reduced ? filled : 0 }}
          animate={{ scaleX: filled }}
          transition={{ duration: reduced ? 0 : 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
    </div>
  );
}
