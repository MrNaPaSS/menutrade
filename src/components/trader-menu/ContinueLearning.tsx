import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueLearningProps {
    /** Пройдено уроков */
    completed: number;
    total: number;
    /** Куда человек вернётся: название следующего урока */
    nextLesson: string | null;
    /** Номер модуля со следующим уроком, считая с единицы */
    nextModule: number | null;
    /** Сколько всего модулей - курс растёт, число вписывать нельзя */
    moduleCount: number;
    onClick: () => void;
}

/**
 * Возврат к учёбе - главное на этом экране.
 *
 * Единственная карточка с зелёным: цвет здесь означает «твой прогресс»,
 * а не украшение. У остальных разделов он приглушён, поэтому взгляд
 * сразу находит то, что человек не дочитал.
 */
export const ContinueLearning = memo(function ContinueLearning({
    completed,
    total,
    nextLesson,
    nextModule,
    moduleCount,
    onClick,
}: ContinueLearningProps) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const started = completed > 0;
    const finished = total > 0 && completed >= total;

    return (
        <button
            onClick={onClick}
            className={cn(
                'group w-full text-left rounded-2xl p-4 sm:p-5',
                'bg-primary/[0.07] border border-primary/25',
                'transition-colors duration-200 hover:bg-primary/[0.11]',
                'active:scale-[0.99] touch-manipulation',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
        >
            <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="font-display font-bold text-base sm:text-lg tracking-wide">
                    {finished ? 'Курс пройден' : started ? 'Продолжить обучение' : 'Начать обучение'}
                </h3>
                <span className="font-mono text-sm text-primary tabular-nums flex-shrink-0">
                    {percent}%
                </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-1">
                {finished
                    ? `Все ${total} уроков закрыты. Впереди итоговый тест`
                    : nextLesson
                        ? `Модуль ${nextModule} · ${nextLesson}`
                        : `${total} уроков в ${moduleCount} модулях`}
            </p>

            {/* Полоса показывает не «сколько осталось до конца», а сколько
                уже сделано: у наполовину пустой шкалы вид упрёка */}
            <div
                className="h-1 rounded-full bg-primary/15 overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${Math.max(percent, 2)}%` }}
                />
            </div>

            <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    {completed} из {total}
                </span>
                <ChevronRight className="w-4 h-4 text-primary/60 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
        </button>
    );
});
