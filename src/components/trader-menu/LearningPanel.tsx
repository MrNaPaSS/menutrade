import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Clock, Lock } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface LearningPanelProps {
    access: Record<CourseId, AccessState>;
    partners: Record<CourseId, string>;
    completedByCourse: Record<string, number>;
    onSelect: (course: Course) => void;
}

const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

function lessonCount(course: Course): number {
    return course.modules
        .filter(m => !STRATEGY_MODULES.has(m.id))
        .reduce((sum, m) => sum + m.lessons.length, 0);
}

const TITLE_COLOR = 'hsl(150 25% 93%)';
const MUTED_COLOR = 'hsl(142 18% 55%)';

/**
 * Обучение - главный блок экрана.
 *
 * Три направления показаны сразу, а не прячутся под нажатием. Сложить
 * их было ошибкой: экран оставался наполовину пустым, а самое ценное -
 * прогресс по каждому рынку - оказывалось спрятанным. Показанное
 * содержимое и есть то, ради чего сюда заходят.
 */
export const LearningPanel = memo(function LearningPanel({
    access,
    partners,
    completedByCourse,
    onSelect,
}: LearningPanelProps) {
    const reduced = useReducedMotion();

    const rows = courses.map(course => {
        const state = access[course.id] ?? 'closed';
        const total = lessonCount(course);
        const done = completedByCourse[course.id] ?? 0;
        return {
            course,
            state,
            total,
            done,
            percent: total > 0 ? Math.round((done / total) * 100) : 0,
            isOpen: state === 'open',
        };
    });

    const openRows = rows.filter(r => r.isOpen);
    const totalDone = openRows.reduce((sum, r) => sum + r.done, 0);
    const totalAll = openRows.reduce((sum, r) => sum + r.total, 0);

    return (
        <section
            className="relative overflow-hidden rounded-[22px] border border-[hsl(142_30%_18%)]"
            style={{
                background: 'linear-gradient(168deg, hsl(142 24% 12%) 0%, hsl(140 28% 6.5%) 70%)',
                boxShadow: '0 16px 40px -22px hsl(0 0% 0%), inset 0 1px 0 hsl(142 50% 45% / 0.16)',
            }}
        >
            <span
                aria-hidden="true"
                className="absolute -top-20 left-8 w-56 h-40 rounded-full blur-3xl"
                style={{ background: 'hsl(142 76% 52% / 0.13)' }}
            />

            <header className="relative flex items-end justify-between gap-3 px-5 pt-5 pb-4">
                <div>
                    <h2
                        className="font-display font-bold text-[19px] tracking-tight leading-none"
                        style={{ color: TITLE_COLOR }}
                    >
                        Обучение
                    </h2>
                    <p className="text-[12px] mt-1.5" style={{ color: MUTED_COLOR }}>
                        {openRows.length > 0
                            ? `${openRows.length} из ${courses.length} направлений открыто`
                            : 'Направление открывает счёт на площадке'}
                    </p>
                </div>

                {totalAll > 0 && (
                    <div className="text-right leading-none">
                        <span className="font-display font-bold text-[26px] text-primary tabular-nums">
                            {totalDone}
                        </span>
                        <span className="text-[15px] tabular-nums" style={{ color: MUTED_COLOR }}>
                            /{totalAll}
                        </span>
                        <p className="text-[11px] mt-1.5" style={{ color: MUTED_COLOR }}>
                            уроков
                        </p>
                    </div>
                )}
            </header>

            <div className="relative px-2.5 pb-2.5 space-y-1.5">
                {rows.map(({ course, state, total, done, percent, isOpen }, index) => (
                    <motion.button
                        key={course.id}
                        onClick={() => isOpen && onSelect(course)}
                        disabled={!isOpen}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 + index * 0.05, duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                        whileTap={isOpen ? { scale: 0.985 } : undefined}
                        className={cn(
                            'group w-full text-left rounded-[16px] px-3.5 py-3 border transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                            isOpen
                                ? 'border-[hsl(142_35%_22%)] bg-[hsl(140_30%_9%)] hover:bg-[hsl(142_32%_11%)]'
                                : 'border-[hsl(142_18%_14%)] bg-[hsl(140_25%_6%)] cursor-default'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                'w-8 h-8 rounded-[10px] flex items-center justify-center text-base flex-shrink-0',
                                'border border-white/[0.06]',
                                !isOpen && 'grayscale opacity-40'
                            )}
                                style={{ background: 'hsl(142 30% 14%)' }}
                            >
                                {course.icon}
                            </span>

                            <span className="flex-1 min-w-0">
                                <span
                                    className="block font-display font-semibold text-[14px] tracking-tight truncate"
                                    style={{ color: isOpen ? TITLE_COLOR : MUTED_COLOR }}
                                >
                                    {course.title}
                                </span>
                                <span className="block text-[11.5px] mt-0.5 tabular-nums" style={{ color: MUTED_COLOR }}>
                                    {isOpen
                                        ? `${done} из ${total} уроков`
                                        : state === 'pending'
                                            ? 'ID отправлен, ждём подтверждения'
                                            : partners[course.id]
                                                ? `Открывает счёт на ${partners[course.id]}`
                                                : `${total} уроков`}
                                </span>
                            </span>

                            {isOpen ? (
                                <span className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="font-display font-bold text-[15px] text-primary tabular-nums">
                                        {percent}%
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-primary/50 transition-transform
                                                             duration-200 group-hover:translate-x-0.5" />
                                </span>
                            ) : state === 'pending' ? (
                                <Clock className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                            ) : (
                                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(142 15% 38%)' }} />
                            )}
                        </div>

                        {isOpen && (
                            <div
                                className="h-[3px] rounded-full overflow-hidden mt-2.5"
                                style={{ background: 'hsl(142 30% 16%)' }}
                            >
                                <motion.div
                                    className="h-full rounded-full bg-primary origin-left"
                                    style={{ boxShadow: '0 0 8px hsl(142 76% 52% / 0.6)' }}
                                    initial={{ scaleX: reduced ? percent / 100 : 0 }}
                                    animate={{ scaleX: percent / 100 }}
                                    transition={{
                                        delay: 0.2 + index * 0.05,
                                        duration: reduced ? 0 : 0.65,
                                        ease: [0.23, 1, 0.32, 1],
                                    }}
                                />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>
        </section>
    );
});
