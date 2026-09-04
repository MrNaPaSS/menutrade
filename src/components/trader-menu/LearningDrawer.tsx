import { motion } from 'framer-motion';
import { ChevronRight, Clock, Lock } from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface LearningDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
 * Три направления обучения с прогрессом.
 *
 * Открывается по кнопке из меню трейдера. Списком в самом меню они
 * занимали треть экрана и оттягивали внимание от остальных разделов;
 * здесь у них своё место, и видно сразу все три - открытые с
 * прогрессом, закрытые с указанием площадки, которая их открывает.
 */
export function LearningDrawer({
    open,
    onOpenChange,
    access,
    partners,
    completedByCourse,
    onSelect,
}: LearningDrawerProps) {
    const openCount = courses.filter(c => access[c.id] === 'open').length;

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[88dvh]">
                <DrawerHeader className="text-left pb-2">
                    <DrawerTitle className="font-display text-lg tracking-wide">
                        Обучение
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-muted-foreground">
                        {openCount === 0
                            ? 'Курс открывает счёт на площадке, подтверждённый в боте'
                            : openCount === courses.length
                                ? 'Открыты все три направления'
                                : `Открыто ${openCount} из ${courses.length}. Остальные открывает счёт на площадке`}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="px-4 pb-6 space-y-2 overflow-y-auto">
                    {courses.map((course, index) => {
                        const state = access[course.id] ?? 'closed';
                        const isOpen = state === 'open';
                        const total = lessonCount(course);
                        const done = completedByCourse[course.id] ?? 0;
                        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                        return (
                            <motion.button
                                key={course.id}
                                onClick={() => isOpen && onSelect(course)}
                                disabled={!isOpen}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.04 + index * 0.05, duration: 0.22, ease: 'easeOut' }}
                                className={cn(
                                    'w-full text-left rounded-xl border p-4 transition-colors duration-200',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                    isOpen
                                        ? 'bg-primary/[0.06] border-primary/25 hover:bg-primary/[0.1] active:scale-[0.99]'
                                        : 'bg-white/[0.02] border-white/10 cursor-default'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn('text-2xl flex-shrink-0', !isOpen && 'grayscale opacity-45')}>
                                        {course.icon}
                                    </span>

                                    <span className="flex-1 min-w-0">
                                        <span className={cn(
                                            'block font-display font-bold text-sm tracking-wide',
                                            !isOpen && 'text-muted-foreground'
                                        )}>
                                            {course.title}
                                        </span>
                                        <span className="block text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                            {course.description}
                                        </span>
                                    </span>

                                    {isOpen ? (
                                        <span className="flex items-center gap-1.5 flex-shrink-0">
                                            <span className="font-mono text-sm text-primary tabular-nums">{percent}%</span>
                                            <ChevronRight className="w-4 h-4 text-primary/60" />
                                        </span>
                                    ) : state === 'pending' ? (
                                        <Clock className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-muted-foreground/45 flex-shrink-0" />
                                    )}
                                </div>

                                {isOpen && (
                                    <>
                                        <div className="h-1 rounded-full bg-primary/15 overflow-hidden mt-3">
                                            <motion.div
                                                className="h-full rounded-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(percent, 2)}%` }}
                                                transition={{ delay: 0.15 + index * 0.05, duration: 0.5, ease: 'easeOut' }}
                                            />
                                        </div>
                                        <span className="block mt-2 font-mono text-[11px] text-muted-foreground tabular-nums">
                                            {done} из {total} уроков
                                        </span>
                                    </>
                                )}

                                {state === 'pending' && (
                                    <p className="mt-3 text-xs text-amber-400/80">
                                        ID отправлен, ждём подтверждения. Обычно до 30 минут
                                    </p>
                                )}

                                {state === 'closed' && (
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        {partners[course.id]
                                            ? `Откроется после регистрации на ${partners[course.id]}: заведите счёт и отправьте его ID боту`
                                            : 'Курс пока закрыт'}
                                    </p>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
