import { useCallback, useState } from 'react';
import { strategyModules } from '@/data/strategies';
import type { Lesson, Module } from '@/types/lesson';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { LessonContent } from '@/components/LessonContent';
import { cn } from '@/lib/utils';

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

/** Сколько разборов видно без доступа */
const PREVIEW_LESSONS = 2;

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

    // Материал разбора. Без доступа сюда не попасть: строки ведут на
    // экран доступа, а не в текст
    if (lesson && module && hasAccess) {
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
                <div className="relative rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden
                                divide-y divide-[hsl(142_22%_13%)]"
                    style={{ background: 'hsl(140 26% 8%)' }}
                >
                    {module.lessons.map((item, index) => {
                        // Без доступа первые два разбора видно целиком,
                        // дальше размытие: список показывает, что материал
                        // настоящий, но не отдаёт его
                        const behindBlur = !hasAccess && index >= PREVIEW_LESSONS;

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
                                    icon={<span className="font-mono text-[13px] tabular-nums">{index + 1}</span>}
                                    tone="cyan"
                                    title={item.title}
                                    caption={item.duration ?? 'Разбор'}
                                    locked={!hasAccess}
                                    onClick={hasAccess ? () => setLesson(item) : onLocked}
                                />
                            </div>
                        );
                    })}

                    {!hasAccess && module.lessons.length > PREVIEW_LESSONS && (
                        <motion.button
                            onClick={onLocked}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end
                                       gap-2.5 pb-5 pt-14
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            style={{
                                background: 'linear-gradient(180deg, transparent, hsl(140 26% 8% / 0.9) 55%)',
                                height: 'calc(100% - 132px)',
                            }}
                        >
                            <Lock className="w-5 h-5" style={{ color: 'hsl(142 40% 55%)' }} />
                            <span className="text-[13px] text-foreground font-medium">
                                Ещё {module.lessons.length - PREVIEW_LESSONS}{' '}
                                {plural(module.lessons.length - PREVIEW_LESSONS, 'разбор', 'разбора', 'разборов')}
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
                    // Блок открывается и без доступа: внутри виден список
                    // разборов, а замки стоят уже на них. Серая карточка
                    // читалась как «сюда нельзя»
                    lockBadge={!hasAccess}
                    footnote={`${item.lessons.length} ${plural(item.lessons.length, 'разбор', 'разбора', 'разборов')}`}
                    action={hasAccess ? 'Открыть' : 'Посмотреть'}
                    onClick={() => setModule(item)}
                />
            ))}
        </ModalWindow>
    );
}
