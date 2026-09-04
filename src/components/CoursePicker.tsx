import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Clock, Lock } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface CoursePickerProps {
    access: Record<CourseId, AccessState>;
    partners: Record<CourseId, string>;
    /** Сколько уроков закрыто в каждом курсе */
    completedByCourse: Record<string, number>;
    onSelect: (course: Course) => void;
}

const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

function lessonCount(course: Course): number {
    return course.modules
        .filter(m => !STRATEGY_MODULES.has(m.id))
        .reduce((sum, m) => sum + m.lessons.length, 0);
}

/**
 * Выбор направления обучения.
 *
 * Закрытые курсы не прячем: человек должен видеть, что рынков три, и
 * какая площадка открывает каждый. Молчаливое отсутствие раздела
 * читается как поломка, а не как условие.
 *
 * Движение одно на весь список - карточки собираются с шагом в 50 мс,
 * полосы прогресса дорисовываются следом. Ничего не дёргается после
 * того, как экран собрался.
 */
export const CoursePicker = memo(function CoursePicker({
    access,
    partners,
    completedByCourse,
    onSelect,
}: CoursePickerProps) {
    const reduced = useReducedMotion();

    return (
        <div className="space-y-3">
            {courses.map((course, index) => {
                const state = access[course.id] ?? 'closed';
                const open = state === 'open';
                const total = lessonCount(course);
                const done = completedByCourse[course.id] ?? 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                const partner = partners[course.id];

                return (
                    <motion.button
                        key={course.id}
                        onClick={() => open && onSelect(course)}
                        disabled={!open}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: index * 0.05,
                            duration: 0.26,
                            ease: [0.23, 1, 0.32, 1],
                        }}
                        whileTap={open ? { scale: 0.985 } : undefined}
                        className={cn(
                            'group relative w-full text-left rounded-2xl overflow-hidden border',
                            'transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                            open
                                ? 'bg-primary/[0.06] border-primary/25 hover:bg-primary/[0.09]'
                                : 'bg-white/[0.02] border-white/10 cursor-default'
                        )}
                    >
                        {/* Полоса прогресса по верхней кромке: она часть
                            карточки, а не приписка снизу */}
                        {open && (
                            <motion.div
                                className="absolute inset-x-0 top-0 h-[3px] bg-primary
                                           shadow-[0_0_10px_hsl(142_76%_52%_/_0.5)] origin-left"
                                initial={{ scaleX: reduced ? Math.max(percent, 2) / 100 : 0 }}
                                animate={{ scaleX: Math.max(percent, 2) / 100 }}
                                transition={{
                                    delay: 0.2 + index * 0.05,
                                    duration: 0.6,
                                    ease: [0.23, 1, 0.32, 1],
                                }}
                            />
                        )}

                        <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3.5">
                                <span className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border',
                                    open
                                        ? 'bg-primary/10 border-primary/25'
                                        : 'bg-white/[0.03] border-white/10 grayscale opacity-45'
                                )}>
                                    {course.icon}
                                </span>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn(
                                            'font-display font-bold text-base tracking-wide truncate',
                                            !open && 'text-muted-foreground'
                                        )}>
                                            {course.title}
                                        </h3>
                                        {open && (
                                            <span className="font-mono text-xs text-primary tabular-nums flex-shrink-0 ml-auto">
                                                {percent}%
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {course.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-white/[0.06]">
                                {open ? (
                                    <>
                                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                            {done} из {total} уроков
                                        </span>
                                        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary">
                                            {done > 0 ? 'Продолжить' : 'Начать'}
                                            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200
                                                                     group-hover:translate-x-0.5" />
                                        </span>
                                    </>
                                ) : state === 'pending' ? (
                                    <>
                                        <Clock className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                                        <span className="text-xs text-amber-400/80">
                                            ID отправлен, ждём подтверждения. Обычно до 30 минут
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                                        <span className="text-xs text-muted-foreground">
                                            {partner
                                                ? `Откроет счёт на ${partner}: заведите его и отправьте ID боту`
                                                : `${total} уроков, курс пока закрыт`}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
});
