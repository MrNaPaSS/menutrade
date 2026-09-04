import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Clock, Lock, X } from 'lucide-react';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { cn } from '@/lib/utils';

interface CoursesModalProps {
    open: boolean;
    onClose: () => void;
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

const TITLE_COLOR = 'hsl(150 25% 94%)';
const CAPTION_COLOR = 'hsl(142 16% 50%)';
const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Окно с направлениями обучения.
 *
 * Не шторка снизу: она поднималась из-за края и на телефоне три
 * карточки в неё не помещались. Здесь окно вырастает из середины -
 * подложка гасит фон, окно чуть увеличивается, направления
 * проявляются одно за другим. Это единственное место в приложении с
 * такой постановкой, поэтому она читается как событие, а не как
 * очередной переход.
 */
export function CoursesModal({
    open,
    onClose,
    access,
    partners,
    completedByCourse,
    onSelect,
}: CoursesModalProps) {
    const reduced = useReducedMotion();

    // Escape закрывает окно, а фон под ним не прокручивается: иначе
    // страница уезжает под пальцем, пока человек читает
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    <motion.div
                        className="absolute inset-0 bg-black/72 backdrop-blur-[6px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Направления обучения"
                        className="relative w-full max-w-md max-h-[82dvh] overflow-hidden
                                   rounded-[26px] border border-[hsl(142_30%_20%)] flex flex-col"
                        style={{
                            background: 'linear-gradient(180deg, hsl(142 22% 12%) 0%, hsl(140 28% 6.5%) 100%)',
                            boxShadow: '0 30px 70px -30px hsl(0 0% 0%), inset 0 1px 0 hsl(142 50% 45% / 0.16)',
                        }}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
                        transition={{ duration: reduced ? 0.15 : 0.32, ease: EASE }}
                    >
                        <span
                            aria-hidden="true"
                            className="absolute -top-24 left-10 w-64 h-48 rounded-full blur-3xl pointer-events-none"
                            style={{ background: 'hsl(142 76% 52% / 0.14)' }}
                        />

                        <header className="relative flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                            <div>
                                <h2
                                    className="font-display font-bold text-[18px] tracking-tight leading-none"
                                    style={{ color: TITLE_COLOR }}
                                >
                                    Направления
                                </h2>
                                <p className="text-[12px] mt-2" style={{ color: CAPTION_COLOR }}>
                                    Курс открывает счёт на площадке, подтверждённый в боте
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Закрыть"
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                           border border-white/[0.08] bg-white/[0.04]
                                           transition-colors duration-200 hover:bg-white/[0.09]
                                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                <X className="w-4 h-4" style={{ color: CAPTION_COLOR }} />
                            </button>
                        </header>

                        <div className="relative px-3.5 pb-4 space-y-2.5 overflow-y-auto">
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
                                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            delay: reduced ? 0 : 0.12 + index * 0.07,
                                            duration: 0.3,
                                            ease: EASE,
                                        }}
                                        whileTap={isOpen ? { scale: 0.985 } : undefined}
                                        className={cn(
                                            'w-full text-left rounded-[18px] p-4 border transition-colors duration-200',
                                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                                            isOpen
                                                ? 'border-[hsl(142_38%_24%)] bg-[hsl(142_30%_10%)] hover:bg-[hsl(142_32%_12%)]'
                                                : 'border-[hsl(142_18%_14%)] bg-[hsl(140_24%_7%)] cursor-default'
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={cn(
                                                    'w-11 h-11 rounded-[14px] flex items-center justify-center',
                                                    'text-xl flex-shrink-0 border border-white/[0.07]',
                                                    !isOpen && 'grayscale opacity-40'
                                                )}
                                                style={{
                                                    background: isOpen
                                                        ? 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))'
                                                        : 'hsl(142 20% 11%)',
                                                    boxShadow: isOpen
                                                        ? 'inset 0 1px 0 hsl(0 0% 100% / 0.1)'
                                                        : undefined,
                                                }}
                                            >
                                                {course.icon}
                                            </span>

                                            <span className="flex-1 min-w-0">
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className="font-semibold text-[15px] tracking-[-0.01em] truncate"
                                                        style={{ color: isOpen ? TITLE_COLOR : CAPTION_COLOR }}
                                                    >
                                                        {course.title}
                                                    </span>
                                                    {isOpen && (
                                                        <span className="ml-auto font-mono font-bold text-[13px]
                                                                         tabular-nums text-primary flex-shrink-0">
                                                            {percent}%
                                                        </span>
                                                    )}
                                                </span>

                                                <span
                                                    className="text-[12px] mt-1 line-clamp-2"
                                                    style={{ color: CAPTION_COLOR }}
                                                >
                                                    {course.description}
                                                </span>
                                            </span>
                                        </div>

                                        {isOpen ? (
                                            <>
                                                <div
                                                    className="h-[3px] rounded-full overflow-hidden mt-3.5"
                                                    style={{ background: 'hsl(142 28% 16%)' }}
                                                >
                                                    <motion.div
                                                        className="h-full rounded-full bg-primary origin-left"
                                                        style={{ boxShadow: '0 0 8px hsl(142 76% 52% / 0.55)' }}
                                                        initial={{ scaleX: reduced ? percent / 100 : 0 }}
                                                        animate={{ scaleX: percent / 100 }}
                                                        transition={{
                                                            delay: reduced ? 0 : 0.3 + index * 0.07,
                                                            duration: 0.6,
                                                            ease: EASE,
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between mt-2.5">
                                                    <span
                                                        className="font-mono text-[11.5px] tabular-nums"
                                                        style={{ color: CAPTION_COLOR }}
                                                    >
                                                        {done} из {total} уроков
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[12px]
                                                                     font-semibold text-primary">
                                                        {done > 0 ? 'Продолжить' : 'Начать'}
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-3">
                                                {state === 'pending' ? (
                                                    <>
                                                        <Clock className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                                                        <span className="text-[12px] text-amber-400/80">
                                                            ID отправлен, ждём подтверждения
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock
                                                            className="w-3.5 h-3.5 flex-shrink-0"
                                                            style={{ color: 'hsl(142 15% 38%)' }}
                                                        />
                                                        <span className="text-[12px]" style={{ color: CAPTION_COLOR }}>
                                                            {partners[course.id]
                                                                ? `Откроет счёт на ${partners[course.id]}`
                                                                : `${total} уроков, курс закрыт`}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
