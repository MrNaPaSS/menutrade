import { useCallback, useState } from 'react';
import { Lock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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

/**
 * Сколько уроков видно без доступа.
 *
 * Двух хватает, чтобы человек увидел настоящие названия и понял, что
 * материал не выдуман. Больше - и смотреть станет незачем.
 */
const PREVIEW_LESSONS = 2;

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

    // Модули выбранного курса берём из прогресса: там уже проставлены
    // пройденные уроки и блокировки. Но прогресс содержит только
    // открытые курсы - у закрытого он пуст, и список выходил нулевым.
    // Для такого курса берём состав из реестра
    const courseModules = (() => {
        if (!course) return [];
        const withProgress = modules.filter(m => course.modules.some(cm => cm.id === m.id));
        return withProgress.length > 0
            ? withProgress
            : course.modules.filter(m => !STRATEGY_MODULES.has(m.id));
    })();

    // Живая версия открытого модуля: после прохождения урока список
    // должен показывать галочку сразу, а не после переоткрытия
    const currentModule = module ? courseModules.find(m => m.id === module.id) ?? module : null;

    // Доступ к выбранному направлению. Без него человек всё равно
    // проходит вглубь до списка уроков - закрыт материал, а не витрина
    const courseState = course ? access[course.id] ?? 'closed' : 'closed';
    const courseOpen = courseState === 'open';
    const awaiting = courseState === 'pending';

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
                subtitle={courseOpen
                    ? `${done} из ${currentModule.lessons.length} уроков пройдено`
                    : `${currentModule.lessons.length} ${currentModule.lessons.length === 1 ? 'урок' : currentModule.lessons.length < 5 ? 'урока' : 'уроков'} в модуле`}
            >
                <div className="relative rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden
                                divide-y divide-[hsl(142_22%_13%)]"
                    style={{ background: 'hsl(140 26% 8%)' }}
                >
                    {currentModule.lessons.map((item, index) => {
                        const lessonLocked = !courseOpen || item.isLocked;
                        // Без доступа первые два урока видно целиком, дальше
                        // размытие: список должен показать, что материал
                        // настоящий, но не отдать его
                        const behindBlur = !courseOpen && !awaiting && index >= PREVIEW_LESSONS;

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'transition-[filter,opacity] duration-300',
                                    behindBlur && 'blur-[3.5px] opacity-45 select-none pointer-events-none'
                                )}
                                aria-hidden={behindBlur}
                            >
                                <TerminalRow
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
                                    locked={lessonLocked}
                                    onClick={
                                        !lessonLocked ? () => setLesson(item)
                                            // Замок из-за доступа ведёт на экран
                                            // доступа, замок по порядку уроков -
                                            // никуда: там просто рано
                                            : (!courseOpen && !awaiting ? onLocked : undefined)
                                    }
                                />
                            </div>
                        );
                    })}

                    {/* Кнопка поверх размытого хвоста: она и объясняет
                        размытие, и даёт выход */}
                    {!courseOpen && !awaiting && currentModule.lessons.length > PREVIEW_LESSONS && (
                        <motion.button
                            onClick={onLocked}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end
                                       gap-2.5 pb-5 pt-14 border-0
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            style={{
                                background: 'linear-gradient(180deg, transparent, hsl(140 26% 8% / 0.9) 55%)',
                                height: 'calc(100% - 132px)',
                            }}
                        >
                            <Lock className="w-5 h-5" style={{ color: 'hsl(142 40% 55%)' }} />
                            <span className="text-[13px] text-foreground font-medium">
                                Ещё {currentModule.lessons.length - PREVIEW_LESSONS}{' '}
                                {currentModule.lessons.length - PREVIEW_LESSONS === 1 ? 'урок' : 'уроков'} в модуле
                            </span>
                            <span className="text-[12.5px] font-semibold" style={{ color: 'hsl(142 76% 58%)' }}>
                                Открыть доступ
                            </span>
                        </motion.button>
                    )}
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
                subtitle={courseOpen
                    ? `${done} из ${courseLessons(course)} уроков пройдено`
                    : `${courseModules.length} модулей, ${courseLessons(course)} уроков`}
            >
                {courseModules.map((item, index) => {
                    const total = item.lessons.length;
                    const closed = item.lessons.filter(l => l.isCompleted).length;
                    const percent = total > 0 ? Math.round((closed / total) * 100) : 0;
                    const lockedByOrder = item.lessons[0]?.isLocked ?? false;
                    const locked = !courseOpen || lockedByOrder;

                    return (
                        <ModalCard
                            key={item.id}
                            index={index}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            // Модуль закрытого направления тоже живой:
                            // внутри виден список уроков, замки стоят на них
                            state={awaiting ? 'pending' : (lockedByOrder && courseOpen ? 'closed' : 'open')}
                            lockBadge={!courseOpen && !awaiting}
                            value={courseOpen ? `${percent}%` : undefined}
                            done={courseOpen && percent === 100}
                            progress={courseOpen ? percent : undefined}
                            footnote={courseOpen
                                ? `${closed} из ${total} уроков`
                                : `${total} ${total === 1 ? 'урок' : total < 5 ? 'урока' : 'уроков'}`}
                            action={courseOpen ? (closed > 0 ? 'Продолжить' : 'Начать') : 'Посмотреть'}
                            lockedNote={courseState === 'pending'
                                ? 'ID отправлен, ждём подтверждения'
                                : 'Откроется после предыдущего модуля'}
                            // Модуль открывается всегда, кроме ожидания
                            // подтверждения: внутри виден список уроков,
                            // и замки стоят уже на них
                            onClick={awaiting || (courseOpen && lockedByOrder)
                                ? undefined
                                : () => setModule(item)}
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
            subtitle="Загляните в любое: закрыт материал, а не список"
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
                        // Закрытое направление выглядит живым: войти
                        // можно, замок стоит отметкой. Серая карточка
                        // читалась как «сюда нельзя»
                        state={state === 'pending' ? 'pending' : 'open'}
                        lockBadge={state === 'closed'}
                        value={state === 'open' ? `${percent}%` : undefined}
                        progress={state === 'open' ? percent : undefined}
                        footnote={state === 'open'
                            ? `${done} из ${total} уроков`
                            : `${total} ${total === 1 ? 'урок' : total < 5 ? 'урока' : 'уроков'}`}
                        action={state === 'open' ? (done > 0 ? 'Продолжить' : 'Начать') : 'Посмотреть'}
                        lockedNote={state === 'pending' ? 'ID отправлен, ждём подтверждения' : undefined}
                        onClick={state === 'pending' ? undefined : () => setCourse(item)}
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
