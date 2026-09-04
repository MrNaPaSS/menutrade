import { memo } from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface CourseTracksProps {
    access: Record<CourseId, AccessState>;
    completedByCourse: Record<string, number>;
    onOpen: (course: Course) => void;
    /** Куда вести за доступом, если ни один курс не открыт */
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
 * открытые с их прогрессом - выбирает он сам, и видно, где остановился.
 *
 * Закрытые сведены в одну строку внизу: подробности того, как их
 * открыть, живут в самом разделе обучения, здесь хватит указателя.
 */
export const CourseTracks = memo(function CourseTracks({
    access,
    completedByCourse,
    onOpen,
    onLocked,
}: CourseTracksProps) {
    const open = courses.filter(course => access[course.id] === 'open');
    const lockedCount = courses.length - open.length;

    return (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] overflow-hidden
                        divide-y divide-primary/10">
            {open.map(course => {
                const total = lessonCount(course);
                const done = completedByCourse[course.id] ?? 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                    <button
                        key={course.id}
                        onClick={() => onOpen(course)}
                        className="group w-full text-left px-4 py-3.5 min-h-[64px]
                                   transition-colors duration-200 hover:bg-primary/[0.07]
                                   active:bg-primary/[0.1]
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl flex-shrink-0">{course.icon}</span>

                            <span className="flex-1 min-w-0">
                                <span className="block font-display font-semibold text-sm tracking-wide">
                                    {course.title}
                                </span>
                                <span className="block font-mono text-[11px] text-muted-foreground tabular-nums">
                                    {done} из {total} уроков
                                </span>
                            </span>

                            <span className="font-mono text-sm text-primary tabular-nums flex-shrink-0">
                                {percent}%
                            </span>
                            <ChevronRight className="w-4 h-4 text-primary/50 flex-shrink-0
                                                     transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>

                        <div className="h-1 rounded-full bg-primary/15 overflow-hidden mt-2.5">
                            <div
                                className="h-full rounded-full bg-primary transition-[width] duration-500"
                                style={{ width: `${Math.max(percent, 2)}%` }}
                            />
                        </div>
                    </button>
                );
            })}

            {lockedCount > 0 && (
                <button
                    onClick={onLocked}
                    className={cn(
                        'w-full text-left px-4 py-3 min-h-[52px] flex items-center gap-3',
                        'transition-colors duration-200 hover:bg-white/[0.03]',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset'
                    )}
                >
                    <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    <span className="flex-1 text-xs text-muted-foreground">
                        {open.length === 0
                            ? 'Курсы откроются после подтверждения счёта у партнёра'
                            : lockedCount === 1
                                ? 'Ещё один курс открывается на другой площадке'
                                : `Ещё ${lockedCount} курса открываются на других площадках`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                </button>
            )}
        </div>
    );
});
