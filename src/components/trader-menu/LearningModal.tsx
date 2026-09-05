import { useCallback, useState } from 'react';
import { Target } from 'lucide-react';
import { GraffitiCheck } from '@/components/graffiti/Graffiti';
import { courses, type Course } from '@/data/courses';
import type { AccessState, CourseId } from '@/lib/courseAccess';
import type { Lesson, Module } from '@/types/lesson';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { LessonContent } from '@/components/LessonContent';

interface LearningModalProps {
    open: boolean;
    onClose: () => void;
    access: Record<CourseId, AccessState>;
    completedByCourse: Record<string, number>;
    /** Модули с проставленным прогрессом - из useProgress */
    modules: Module[];
    onLessonComplete: (moduleId: string, lessonId: string) => void;
    /** Нажали на закрытый курс - предлагаем выбрать площадку */
    onLocked: () => void;
    /** Стратегии - четвёртая карточка в списке направлений */
    onOpenStrategies: () => void;
    strategyLessons: number;
}

const STRATEGY_MODULES = new Set(['module-3', 'module-4', 'module-5']);

function courseLessons(course: Course): number {
    return course.modules
        .filter(m => !STRATEGY_MODULES.has(m.id))
        .reduce((sum, m) => sum + m.lessons.length, 0);
}

/**
 * Обучение целиком в окне.
 *
 * Направление, модули, уроки и сам материал с квизом - всё внутри
 * одного окна, без ухода на отдельные экраны. Стрелка в шапке ведёт на
 * шаг назад, а не закрывает всё разом.
 *
 * На уровне материала окно разворачивается во весь экран: карточкам
 * урока нужна вся высота, посреди экрана они не помещаются.
 */
export function LearningModal({
    open,
    onClose,
    access,
    completedByCourse,
    modules,
    onLessonComplete,
    onLocked,
    onOpenStrategies,
    strategyLessons,
}: LearningModalProps) {
    const [course, setCourse] = useState<Course | null>(null);
    const [module, setModule] = useState<Module | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);

    // Модули выбранного курса берём из прогресса, а не из реестра:
    // там уже проставлены пройденные уроки и блокировки
    const courseModules = course
        ? modules.filter(m => course.modules.some(cm => cm.id === m.id))
        : [];

    // Живая версия открытого модуля: после прохождения урока список
    // должен показывать галочку сразу, а не после переоткрытия
    const currentModule = module ? courseModules.find(m => m.id === module.id) ?? module : null;

    const close = useCallback(() => {
        onClose();
        // Сбрасываем шаги после закрытия: следующий заход начинается
        // с выбора направления
        setTimeout(() => {
            setCourse(null);
            setModule(null);
            setLesson(null);
        }, 300);
    }, [onClose]);

    const back = lesson
        ? () => setLesson(null)
        : module
            ? () => setModule(null)
            : course
                ? () => setCourse(null)
                : undefined;

    // Материал урока
    if (lesson && currentModule && course) {
        const index = currentModule.lessons.findIndex(l => l.id === lesson.id);
        const isLast = index === currentModule.lessons.length - 1;

        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={() => setLesson(null)}
                title={lesson.title}
                subtitle={`${currentModule.title} · урок ${index + 1} из ${currentModule.lessons.length}`}
                fullscreen
                bare
            >
                <LessonContent
                    embedded
                    lesson={lesson}
                    onBack={() => setLesson(null)}
                    onComplete={() => {
                        onLessonComplete(currentModule.id, lesson.id);
                        setLesson(null);
                    }}
                    offerModuleTest={isLast}
                />
            </ModalWindow>
        );
    }

    // Уроки модуля
    if (currentModule && course) {
        const done = currentModule.lessons.filter(l => l.isCompleted).length;

        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={back}
                title={currentModule.title}
                subtitle={`${done} из ${currentModule.lessons.length} уроков пройдено`}
            >
                <div className="rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden
                                divide-y divide-[hsl(142_22%_13%)]"
                    style={{ background: 'hsl(140 26% 8%)' }}
                >
                    {currentModule.lessons.map((item, index) => (
                        <TerminalRow
                            key={item.id}
                            index={index}
                            icon={
                                item.isCompleted
                                    ? <GraffitiCheck className="w-[19px] h-[19px]" delay={0.06 + index * 0.04} />
                                    : <span className="font-mono text-[13px] tabular-nums">{index + 1}</span>
                            }
                            tone="green"
                            title={item.title}
                            caption={item.duration ?? 'Урок'}
                            value={item.isCompleted ? 'пройден' : undefined}
                            valueLive={item.isCompleted}
                            locked={item.isLocked}
                            onClick={item.isLocked ? undefined : () => setLesson(item)}
                        />
                    ))}
                </div>
            </ModalWindow>
        );
    }

    // Модули курса
    if (course) {
        const done = completedByCourse[course.id] ?? 0;

        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={back}
                title={course.title}
                subtitle={`${done} из ${courseLessons(course)} уроков пройдено`}
            >
                {courseModules.map((item, index) => {
                    const total = item.lessons.length;
                    const closed = item.lessons.filter(l => l.isCompleted).length;
                    const percent = total > 0 ? Math.round((closed / total) * 100) : 0;
                    const locked = item.lessons[0]?.isLocked ?? false;

                    return (
                        <ModalCard
                            key={item.id}
                            index={index}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            state={locked ? 'closed' : 'open'}
                            value={`${percent}%`}
                            done={percent === 100}
                            progress={percent}
                            footnote={`${closed} из ${total} уроков`}
                            action={closed > 0 ? 'Продолжить' : 'Начать'}
                            lockedNote="Откроется после предыдущего модуля"
                            onClick={() => setModule(item)}
                        />
                    );
                })}
            </ModalWindow>
        );
    }

    // Направления
    return (
        <ModalWindow
            open={open}
            onClose={close}
            title="Направления"
            subtitle="Закрытые направления открываются счётом на площадке"
        >
            {courses.map((item, index) => {
                const state = access[item.id] ?? 'closed';
                const total = courseLessons(item);
                const done = completedByCourse[item.id] ?? 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                    <ModalCard
                        key={item.id}
                        index={index}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        state={state}
                        value={`${percent}%`}
                        progress={percent}
                        footnote={`${done} из ${total} уроков`}
                        action={done > 0 ? 'Продолжить' : 'Начать'}
                        lockedNote={state === 'pending' ? 'ID отправлен, ждём подтверждения' : undefined}
                        onClick={state === 'open' ? () => setCourse(item) : onLocked}
                    />
                );
            })}

            {/* Стратегии здесь же: это тот же материал, только без
                последовательности - отдельной строкой в меню они
                выглядели как другой раздел */}
            <ModalCard
                index={courses.length}
                icon={<Target className="w-5 h-5" />}
                title="Торговые стратегии"
                description="Готовые схемы входа и выхода. Читать можно в любом порядке"
                footnote={`${strategyLessons} разборов`}
                action="Открыть"
                onClick={onOpenStrategies}
            />
        </ModalWindow>
    );
}
