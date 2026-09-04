import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, Clock } from 'lucide-react';
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

function lessonCount(course: Course): number {
    return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

/**
 * Выбор курса.
 *
 * Закрытые курсы не прячем: человек должен видеть, что есть ещё два
 * рынка и как их открыть. Молчаливое отсутствие раздела читается как
 * поломка, а не как условие.
 */
export const CoursePicker = memo(function CoursePicker({
    access,
    partners,
    completedByCourse,
    onSelect,
}: CoursePickerProps) {
    return (
        <div className="space-y-3">
            {courses.map((course, index) => {
                const state = access[course.id] ?? 'closed';
                const total = lessonCount(course);
                const done = completedByCourse[course.id] ?? 0;
                const partner = partners[course.id];
                const open = state === 'open';

                return (
                    <motion.button
                        key={course.id}
                        onClick={() => open && onSelect(course)}
                        disabled={!open}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.04 }}
                        className={cn(
                            'w-full text-left rounded-2xl p-4 border transition-colors duration-200',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                            open
                                ? 'bg-primary/[0.06] border-primary/25 hover:bg-primary/[0.1] active:scale-[0.99]'
                                : 'bg-white/[0.02] border-white/10 cursor-default'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className={cn('text-2xl flex-shrink-0', !open && 'grayscale opacity-50')}>
                                {course.icon}
                            </span>

                            <span className="flex-1 min-w-0">
                                <span className={cn(
                                    'block font-display font-bold text-base tracking-wide',
                                    !open && 'text-muted-foreground'
                                )}>
                                    {course.title}
                                </span>
                                <span className="block text-xs text-muted-foreground line-clamp-2">
                                    {course.description}
                                </span>
                            </span>

                            {open ? (
                                <ChevronRight className="w-4 h-4 text-primary/60 flex-shrink-0" />
                            ) : state === 'pending' ? (
                                <Clock className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                            ) : (
                                <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                            )}
                        </div>

                        {open && (
                            <div className="mt-3">
                                <div className="h-1 rounded-full bg-primary/15 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: `${total ? Math.max((done / total) * 100, 2) : 2}%` }}
                                    />
                                </div>
                                <span className="block mt-2 font-mono text-[11px] text-muted-foreground tabular-nums">
                                    {done} из {total} уроков
                                </span>
                            </div>
                        )}

                        {state === 'pending' && (
                            <p className="mt-3 text-xs text-amber-400/80">
                                ID отправлен, ждём подтверждения. Обычно до 30 минут
                            </p>
                        )}

                        {state === 'closed' && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                {partner
                                    ? `Откроется после регистрации на ${partner}: заведите счёт и отправьте его ID боту`
                                    : 'Курс пока закрыт'}
                            </p>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
});
