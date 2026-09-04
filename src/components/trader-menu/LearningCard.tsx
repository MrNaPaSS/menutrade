import { memo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Clock, Lock } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface LearningCardProps {
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

/**
 * Обучение - главное на этом экране.
 *
 * Раскрывается на месте, а не уводит на другой экран и не поднимает
 * шторку: человек нажимает, видит три направления с прогрессом и
 * выбирает, никуда не уходя. Раскрытие - единственная анимация высоты
 * в приложении, и она оправдана: это ответ на действие, а не украшение.
 *
 * Зелёный здесь означает «твой прогресс». Больше нигде на экране его
 * нет, поэтому взгляд сразу находит то, ради чего пришли.
 */
export const LearningCard = memo(function LearningCard({
    access,
    partners,
    completedByCourse,
    onSelect,
}: LearningCardProps) {
    const [open, setOpen] = useState(false);
    const reduced = useReducedMotion();

    const openCourses = courses.filter(c => access[c.id] === 'open');
    const totals = openCourses.reduce(
        (acc, course) => ({
            total: acc.total + lessonCount(course),
            done: acc.done + (completedByCourse[course.id] ?? 0),
        }),
        { total: 0, done: 0 }
    );
    const percent = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.05]">
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r
                             from-transparent via-primary/40 to-transparent" />
            <span
                aria-hidden="true"
                className="absolute -top-16 left-1/4 w-48 h-32 rounded-full bg-primary/10 blur-3xl"
            />

            <motion.button
                onClick={() => setOpen(v => !v)}
                whileTap={{ scale: 0.99 }}
                aria-expanded={open}
                className="relative w-full text-left p-5
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
            >
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="font-display font-bold text-lg tracking-tight">
                        Обучение
                    </h2>
                    <span className="font-mono text-2xl text-primary tabular-nums leading-none">
                        {percent}<span className="text-sm text-primary/60">%</span>
                    </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                    {openCourses.length > 0
                        ? `${totals.done} из ${totals.total} уроков · ${openCourses.length} из ${courses.length} направлений`
                        : `${courses.length} направления: бинарные опционы, форекс, крипта`}
                </p>

                <div className="h-1 rounded-full bg-primary/12 overflow-hidden mt-4">
                    <motion.div
                        className="h-full rounded-full bg-primary origin-left"
                        style={{ boxShadow: '0 0 8px hsl(142 76% 52% / 0.5)' }}
                        initial={{ scaleX: reduced ? percent / 100 : 0 }}
                        animate={{ scaleX: percent / 100 }}
                        transition={{ duration: reduced ? 0 : 0.7, ease: [0.23, 1, 0.32, 1] }}
                    />
                </div>

                <div className="flex items-center justify-center gap-1 mt-3 text-[11px] text-primary/70">
                    {open ? 'Свернуть' : 'Выбрать направление'}
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                        className="inline-flex"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                </div>
            </motion.button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="tracks"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: { duration: reduced ? 0 : 0.28, ease: [0.23, 1, 0.32, 1] },
                            opacity: { duration: 0.18 },
                        }}
                        className="relative overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-1.5">
                            {courses.map(course => {
                                const state = access[course.id] ?? 'closed';
                                const isOpen = state === 'open';
                                const total = lessonCount(course);
                                const done = completedByCourse[course.id] ?? 0;
                                const share = total > 0 ? Math.round((done / total) * 100) : 0;

                                return (
                                    <button
                                        key={course.id}
                                        onClick={() => isOpen && onSelect(course)}
                                        disabled={!isOpen}
                                        className={cn(
                                            'w-full text-left rounded-xl p-3 border transition-colors duration-200',
                                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                            isOpen
                                                ? 'bg-background/40 border-primary/20 hover:bg-background/60 active:scale-[0.99]'
                                                : 'bg-background/20 border-white/[0.06] cursor-default'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={cn('text-lg', !isOpen && 'grayscale opacity-40')}>
                                                {course.icon}
                                            </span>
                                            <span className={cn(
                                                'flex-1 font-display font-semibold text-sm tracking-tight truncate',
                                                !isOpen && 'text-muted-foreground'
                                            )}>
                                                {course.title}
                                            </span>

                                            {isOpen ? (
                                                <span className="font-mono text-xs text-primary tabular-nums">
                                                    {share}%
                                                </span>
                                            ) : state === 'pending' ? (
                                                <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                                            ) : (
                                                <Lock className="w-3.5 h-3.5 text-muted-foreground/45" />
                                            )}
                                        </div>

                                        <p className="text-[11px] text-muted-foreground mt-1.5 pl-[26px]">
                                            {isOpen
                                                ? `${done} из ${total} уроков`
                                                : state === 'pending'
                                                    ? 'ID отправлен, ждём подтверждения'
                                                    : partners[course.id]
                                                        ? `Открывает счёт на ${partners[course.id]}`
                                                        : 'Пока закрыт'}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
