import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';

interface Metric {
    value: number;
    /** Что означает цифра - одним словом под ней */
    label: string;
    /** Приписка к числу: «%», «дн» */
    suffix?: string;
    onClick?: () => void;
}

interface StatusStripProps {
    metrics: Metric[];
    /**
     * Ячейка перед цифрами: профиль трейдера.
     *
     * Внутри той же панели, а не отдельной кнопкой рядом: это один
     * блок «кто я и как иду», и двумя плитками он читался как два
     * разных элемента.
     */
    leading?: React.ReactNode;
}

const VALUE_COLOR = 'hsl(var(--foreground))';
const LABEL_COLOR = 'hsl(var(--muted-foreground))';

function Figure({ metric }: { metric: Metric }) {
    const shown = useCountUp(metric.value);

    return (
        <span className="flex-1 flex flex-col items-center justify-center py-3.5 min-w-0">
            <span
                className="font-bold text-[24px] leading-none tabular-nums tracking-[-0.02em]"
                style={{ color: VALUE_COLOR }}
            >
                {shown}
                {metric.suffix && (
                    <span className="text-[13px] ml-0.5" style={{ color: LABEL_COLOR }}>
                        {metric.suffix}
                    </span>
                )}
            </span>
            <span
                className="text-[10.5px] uppercase tracking-[0.08em] mt-1.5 truncate"
                style={{ color: LABEL_COLOR }}
            >
                {metric.label}
            </span>
        </span>
    );
}

/**
 * Полоса показателей.
 *
 * Первое, что видно на экране: сколько монет, сколько дней подряд
 * заходил, сколько курса пройдено. Цифры крупные и досчитывают до
 * значения - это единственное движение здесь, и оно приходится на
 * момент, когда человек ещё смотрит на верх экрана.
 *
 * Разделители волосяные, без рамок вокруг каждой цифры: три числа в
 * коробочках выглядят как форма для заполнения, а не как приборная
 * панель.
 *
 * Крупные цифры набраны обычным Inter. Фирменный Orbitron рисует ноль
 * перечёркнутым, а тройку похожей на «Э»; у моноширинного ноль с
 * точкой внутри. Для главных чисел экрана нужен шрифт, в котором
 * цифру видно с одного взгляда.
 */
export const StatusStrip = memo(function StatusStrip({ metrics, leading }: StatusStripProps) {
    const reduced = useReducedMotion();

    return (
        <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="relative overflow-hidden rounded-[18px] border border-[hsl(142_28%_16%)] flex"
            style={{
                background: 'linear-gradient(180deg, hsl(142 22% 11%) 0%, hsl(140 28% 7%) 100%)',
                boxShadow: '0 10px 30px -20px hsl(0 0% 0%), inset 0 1px 0 hsl(142 45% 42% / 0.14)',
            }}
        >
            {leading}

            {metrics.map((metric, index) => (
                <span key={metric.label} className="flex flex-1 min-w-0">
                    {(index > 0 || leading) && (
                        <span
                            aria-hidden="true"
                            className="w-px my-3"
                            style={{ background: 'hsl(142 25% 18%)' }}
                        />
                    )}
                    {metric.onClick ? (
                        <button
                            onClick={metric.onClick}
                            className="flex-1 flex min-w-0 rounded-[14px] transition-colors duration-200
                                       hover:bg-white/[0.03] active:bg-white/[0.05]
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            <Figure metric={metric} />
                        </button>
                    ) : (
                        <Figure metric={metric} />
                    )}
                </span>
            ))}
        </motion.div>
    );
});
