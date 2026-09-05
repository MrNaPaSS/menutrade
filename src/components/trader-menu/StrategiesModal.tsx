import { useCallback, useState } from 'react';
import { strategyModules } from '@/data/strategies';
import type { Lesson, Module } from '@/types/lesson';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { LessonContent } from '@/components/LessonContent';

interface StrategiesModalProps {
    open: boolean;
    onClose: () => void;
    /** Полный доступ подтверждён счётом на площадке */
    hasAccess: boolean;
    /** Нажали на закрытый разбор - предлагаем выбрать площадку */
    onLocked: () => void;
    /** Возврат в направления обучения: стратегии открываются оттуда */
    onBackToLearning: () => void;
}

const TOTAL = strategyModules.reduce((sum, m) => sum + m.lessons.length, 0);

function plural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

/**
 * Торговые стратегии целиком в окне.
 *
 * Блоки, разборы и сам материал - всё внутри одного окна, как в
 * обучении. Материал показывает тот же компонент, что и уроки: у
 * стратегий такая же структура, и незачем держать для них вторую
 * реализацию карусели с разметкой.
 *
 * Прогресса здесь нет намеренно: это справочник, а не последовательный
 * курс, читать можно в любом порядке.
 *
 * Без подтверждённого счёта блоки видны, но закрыты: человек должен
 * знать, что внутри, - иначе непонятно, ради чего открывать доступ.
 */
export function StrategiesModal({ open, onClose, hasAccess, onLocked, onBackToLearning }: StrategiesModalProps) {
    const [module, setModule] = useState<Module | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);

    const close = useCallback(() => {
        onClose();
        // Сбрасываем шаги после закрытия: следующий заход начинается
        // со списка блоков
        setTimeout(() => {
            setModule(null);
            setLesson(null);
        }, 300);
    }, [onClose]);

    // Материал разбора
    if (lesson && module) {
        const index = module.lessons.findIndex(l => l.id === lesson.id);

        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={() => setLesson(null)}
                title={lesson.title}
                subtitle={`${module.title} · разбор ${index + 1} из ${module.lessons.length}`}
                fullscreen
                bare
            >
                <LessonContent
                    embedded
                    lesson={lesson}
                    onBack={() => setLesson(null)}
                />
            </ModalWindow>
        );
    }

    // Разборы блока
    if (module) {
        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={() => setModule(null)}
                title={module.title}
                subtitle={`${module.lessons.length} ${plural(module.lessons.length, 'разбор', 'разбора', 'разборов')}`}
            >
                <div className="rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden
                                divide-y divide-[hsl(142_22%_13%)]"
                    style={{ background: 'hsl(140 26% 8%)' }}
                >
                    {module.lessons.map((item, index) => (
                        <TerminalRow
                            key={item.id}
                            index={index}
                            icon={<span className="font-mono text-[13px] tabular-nums">{index + 1}</span>}
                            tone="cyan"
                            title={item.title}
                            caption={item.duration ?? 'Разбор'}
                            onClick={() => setLesson(item)}
                        />
                    ))}
                </div>
            </ModalWindow>
        );
    }

    // Блоки стратегий
    return (
        <ModalWindow
            open={open}
            onClose={close}
            onBack={onBackToLearning}
            title="Стратегии"
            subtitle={hasAccess
                ? `${TOTAL} ${plural(TOTAL, 'разбор', 'разбора', 'разборов')} в ${strategyModules.length} блоках. Читать можно в любом порядке`
                : `${TOTAL} ${plural(TOTAL, 'разбор', 'разбора', 'разборов')} в ${strategyModules.length} блоках. Откроются вместе с полным доступом`}
        >
            {strategyModules.map((item, index) => (
                <ModalCard
                    key={item.id}
                    index={index}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    state={hasAccess ? 'open' : 'closed'}
                    footnote={`${item.lessons.length} ${plural(item.lessons.length, 'разбор', 'разбора', 'разборов')}`}
                    action="Открыть"
                    onClick={hasAccess ? () => setModule(item) : onLocked}
                />
            ))}
        </ModalWindow>
    );
}
