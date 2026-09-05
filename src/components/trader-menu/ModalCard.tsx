import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Clock, Lock, type LucideIcon } from 'lucide-react';
import { MODAL_CAPTION, MODAL_EASE, MODAL_TITLE } from '@/components/ui/modal-window';
import { GraffitiStar } from '@/components/graffiti/Graffiti';
import { cn } from '@/lib/utils';

export type CardState = 'open' | 'pending' | 'closed';

interface ModalCardProps {
    /** Эмодзи курса или значок из набора */
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
    state?: CardState;
    /** Подпись под описанием: «12 из 26 уроков», «5 разборов» */
    footnote?: string;
    /** Правый показатель в шапке карточки: «46%» */
    value?: string;
    /** Полоса под описанием, 0-100 */
    progress?: number;
    /** Что написать, когда карточка закрыта */
    lockedNote?: string;
    /** Подпись действия справа внизу */
    action?: string;
    /** Всё пройдено: вместо процента ставим звезду */
    done?: boolean;
    onClick?: () => void;
}

/**
 * Карточка внутри окна.
 *
 * Одна на все окна - направления обучения, стратегии, софт. Разные
 * карточки в одинаковых окнах читались бы как разные приложения.
 */
export function ModalCard({
    icon,
    title,
    description,
    index,
    state = 'open',
    footnote,
    value,
    progress,
    lockedNote,
    action,
    done = false,
    onClick,
}: ModalCardProps) {
    const reduced = useReducedMotion();
    const isOpen = state === 'open';
    // Закрытую тоже можно нажать - она ведёт на выбор площадки. Не
    // нажимается только та, что ждёт подтверждения: там уже всё сделано
    const clickable = Boolean(onClick) && state !== 'pending';

    return (
        <motion.button
            onClick={() => clickable && onClick?.()}
            disabled={!clickable}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: reduced ? 0 : 0.12 + index * 0.07,
                duration: 0.3,
                ease: MODAL_EASE,
            }}
            whileTap={clickable ? { scale: 0.985 } : undefined}
            className={cn(
                'w-full text-left rounded-[18px] p-4 border transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isOpen
                    ? 'border-[hsl(142_38%_24%)] bg-[hsl(142_30%_10%)] hover:bg-[hsl(142_32%_12%)]'
                    : 'border-[hsl(142_18%_14%)] bg-[hsl(140_24%_7%)]',
                !isOpen && (clickable ? 'hover:bg-[hsl(140_26%_9%)]' : 'cursor-default')
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
                        boxShadow: isOpen ? 'inset 0 1px 0 hsl(0 0% 100% / 0.1)' : undefined,
                        color: 'hsl(142 76% 62%)',
                    }}
                >
                    {icon}
                </span>

                <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                        <span
                            className="font-semibold text-[15px] tracking-[-0.01em] truncate"
                            style={{ color: isOpen ? MODAL_TITLE : MODAL_CAPTION }}
                        >
                            {title}
                        </span>
                        {/* Пройденное отмечает звезда, а не «100%»: цифру
                            надо прочитать, звезду видно сразу */}
                        {done && isOpen ? (
                            <GraffitiStar
                                className="ml-auto w-7 h-7 flex-shrink-0"
                                delay={reduced ? 0 : 0.24 + index * 0.07}
                            />
                        ) : value && isOpen ? (
                            <span className="ml-auto font-mono font-bold text-[13px]
                                             tabular-nums text-primary flex-shrink-0">
                                {value}
                            </span>
                        ) : null}
                    </span>

                    <span className="text-[12px] mt-1 line-clamp-2" style={{ color: MODAL_CAPTION }}>
                        {description}
                    </span>
                </span>
            </div>

            {isOpen ? (
                <>
                    {typeof progress === 'number' && (
                        <div
                            className="h-[3px] rounded-full overflow-hidden mt-3.5"
                            style={{ background: 'hsl(142 28% 16%)' }}
                        >
                            <motion.div
                                className="h-full rounded-full bg-primary origin-left"
                                style={{ boxShadow: '0 0 8px hsl(142 76% 52% / 0.55)' }}
                                initial={{ scaleX: reduced ? progress / 100 : 0 }}
                                animate={{ scaleX: progress / 100 }}
                                transition={{
                                    delay: reduced ? 0 : 0.3 + index * 0.07,
                                    duration: 0.6,
                                    ease: MODAL_EASE,
                                }}
                            />
                        </div>
                    )}

                    {(footnote || action) && (
                        <div className="flex items-center justify-between mt-2.5 gap-3">
                            {footnote && (
                                <span
                                    className="font-mono text-[11.5px] tabular-nums truncate"
                                    style={{ color: MODAL_CAPTION }}
                                >
                                    {footnote}
                                </span>
                            )}
                            {action && (
                                <span className="ml-auto flex items-center gap-1 text-[12px]
                                                 font-semibold text-primary flex-shrink-0">
                                    {action}
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-2 mt-3">
                    {state === 'pending' ? (
                        <>
                            <Clock className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                            <span className="text-[12px] text-amber-400/80">
                                {lockedNote ?? 'Ждём подтверждения'}
                            </span>
                        </>
                    ) : (
                        /* У закрытого только замок. Подпись вида «откроет
                           счёт на X» объясняла условие раньше, чем человек
                           успел заинтересоваться курсом - условие он узнает,
                           когда нажмёт */
                        <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(142 18% 42%)' }} />
                    )}
                </div>
            )}
        </motion.button>
    );
}
