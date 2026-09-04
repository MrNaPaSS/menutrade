import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';

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

/** Направления обучения: открытые с прогрессом, закрытые с площадкой. */
export function CoursesModal({
    open,
    onClose,
    access,
    partners,
    completedByCourse,
    onSelect,
}: CoursesModalProps) {
    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Направления"
            subtitle="Курс открывает счёт на площадке, подтверждённый в боте"
        >
            {courses.map((course, index) => {
                const state = access[course.id] ?? 'closed';
                const isOpen = state === 'open';
                const total = lessonCount(course);
                const done = completedByCourse[course.id] ?? 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                    <ModalCard
                        key={course.id}
                        index={index}
                        icon={course.icon}
                        title={course.title}
                        description={course.description}
                        state={state}
                        value={`${percent}%`}
                        progress={percent}
                        footnote={`${done} из ${total} уроков`}
                        action={done > 0 ? 'Продолжить' : 'Начать'}
                        lockedNote={
                            state === 'pending'
                                ? 'ID отправлен, ждём подтверждения'
                                : partners[course.id]
                                    ? `Откроет счёт на ${partners[course.id]}`
                                    : `${total} уроков, курс закрыт`
                        }
                        onClick={isOpen ? () => onSelect(course) : undefined}
                    />
                );
            })}
        </ModalWindow>
    );
}
