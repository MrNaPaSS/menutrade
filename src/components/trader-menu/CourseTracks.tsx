import { memo } from 'react';
import { ChevronRight, Clock, Lock } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface CourseTracksProps {
    access: Record<CourseId, AccessState>;
    completedByCourse: Record<string, number>;
    onOpen: (course: Course) => void;
    /** Куда вести за подробностями по закрытому курсу */
    onLocked: () => void;
}

const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

function lessonCount(course: Course): number {
    return course.modules
        .filter(m => !STRATEGY_MODULES.has(m.id))
        .reduce((sum, m) => sum + m.lessons.length, 0);
}

/**
 * Направления обучения в меню трейдера.
 *
 * Курсов три, и одной кнопкой «продолжить» тут не обойтись: она
 * угадывала бы, к какому из них человек возвращается. Показываем все
 * три - открытые с прогрессом, закрытые приглушённо. Прятать закрытые
 * нельзя: человек должен видеть, что рынков три, иначе он и не узнает,
 * ради чего открывать счёт на другой площадке.
 */
export const CourseTracks = memo(function CourseTracks({
    access,
    completedByCourse,
    onOpen,
    onLocked,
}: CourseTracksProps) {
    return (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] overflow-hidden
                        divide-y divide-primary/10">
            {courses.map(course => {
                const state = access[course.id] ?? 'closed';
                const isOpen = state === 'open';
                const total = lessonCount(course);
                const done = completedByCourse[course.id] ?? 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                    <button
                        key={course.id}
                        onClick={() => (isOpen ? onOpen(course) : onLocked())}
                        className={cn(
                            'group w-full text-left px-4 py-3.5 min-h-[64px] transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
                            isOpen
                                ? 'hover:bg-primary/[0.07] active:bg-primary/[0.1]'
                                : 'hover:bg-white/[0.03]'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn('text-xl flex-shrink-0', !isOpen && 'grayscale opacity-45')}>
                                {course.icon}
                            </span>

                            <span className="flex-1 min-w-0">
                                <span className={cn(
                                    'block font-display font-semibold text-sm tracking-wide',
                                    !isOpen && 'text-muted-foreground'
                                )}>
                                    {course.title}
                                </span>
                                <span className="block font-mono text-[11px] text-muted-foreground tabular-nums">
                                    {isOpen
                                        ? `${done} из ${total} уроков`
                                        : state === 'pending'
                                            ? 'ID отправлен, ждём подтверждения'
                                            : `${total} уроков · нужен счёт на площадке`}
                                </span>
                            </span>

                            {isOpen ? (
                                <>
                                    <span className="font-mono text-sm text-primary tabular-nums flex-shrink-0">
                                        {percent}%
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-primary/50 flex-shrink-0
                                                             transition-transform duration-200 group-hover:translate-x-0.5" />
                                </>
                            ) : state === 'pending' ? (
                                <Clock className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                            ) : (
                                <Lock className="w-4 h-4 text-muted-foreground/45 flex-shrink-0" />
                            )}
                        </div>

                        {isOpen && (
                            <div className="h-1 rounded-full bg-primary/15 overflow-hidden mt-2.5">
                                <div
                                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                                    style={{ width: `${Math.max(percent, 2)}%` }}
                                />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
});
