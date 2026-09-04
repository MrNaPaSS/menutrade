import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalWindowProps {
    open: boolean;
    onClose: () => void;
    title: string;
    /** Одна строка о том, что внутри */
    subtitle?: string;
    /**
     * Развернуть на весь экран.
     *
     * Нужно там, где внутри окна разворачивается материал урока: ему
     * нужна вся высота, посреди экрана он не помещается.
     */
    fullscreen?: boolean;
    /** Шаг назад внутри окна. Задан - вместо крестика стрелка */
    onBack?: () => void;
    /** Содержимое само отвечает за отступы и прокрутку */
    bare?: boolean;
    children: ReactNode;
}

export const MODAL_EASE = [0.23, 1, 0.32, 1] as const;
export const MODAL_TITLE = 'hsl(var(--foreground))';
export const MODAL_CAPTION = 'hsl(var(--muted-foreground))';

/**
 * Окно по центру экрана.
 *
 * Общая оболочка для всех разделов, которые раскрываются окном:
 * направления обучения, стратегии, софт. Одинаковая постановка важнее
 * разнообразия - человек должен узнавать движение, а не разгадывать
 * его заново в каждом разделе.
 *
 * Не шторка снизу: та поднимается из-за края, и на телефоне в неё не
 * помещается список из трёх-четырёх карточек.
 */
export function ModalWindow({
    open,
    onClose,
    title,
    subtitle,
    fullscreen = false,
    onBack,
    bare = false,
    children,
}: ModalWindowProps) {
    const reduced = useReducedMotion();

    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        // Фон не прокручивается, пока окно открыто: иначе страница
        // уезжает под пальцем, пока человек читает
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
                <div className={cn(
                    "fixed inset-0 z-[90] flex items-center justify-center",
                    fullscreen ? "p-0" : "p-4"
                )}>
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
                        aria-label={title}
                        className={cn(
                            "relative overflow-hidden border border-[hsl(142_30%_20%)] flex flex-col",
                            fullscreen
                                ? "w-full h-full rounded-none border-0"
                                : "w-full max-w-md max-h-[82dvh] rounded-[26px]"
                        )}
                        style={{
                            background: 'linear-gradient(180deg, hsl(142 22% 12%) 0%, hsl(140 28% 6.5%) 100%)',
                            boxShadow: '0 30px 70px -30px hsl(0 0% 0%), inset 0 1px 0 hsl(142 50% 45% / 0.16)',
                        }}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
                        transition={{ duration: reduced ? 0.15 : 0.32, ease: MODAL_EASE }}
                    >
                        <span
                            aria-hidden="true"
                            className="absolute -top-24 left-10 w-64 h-48 rounded-full blur-3xl pointer-events-none"
                            style={{ background: 'hsl(142 76% 52% / 0.14)' }}
                        />

                        <header className="relative flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                            <div className="min-w-0">
                                <h2
                                    className="font-display font-bold text-[18px] tracking-tight leading-none"
                                    style={{ color: MODAL_TITLE }}
                                >
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-[12px] mt-2" style={{ color: MODAL_CAPTION }}>
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={onBack ?? onClose}
                                aria-label={onBack ? 'Назад' : 'Закрыть'}
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                           border border-white/[0.08] bg-white/[0.04]
                                           transition-colors duration-200 hover:bg-white/[0.09]
                                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                {onBack
                                    ? <ArrowLeft className="w-4 h-4" style={{ color: MODAL_CAPTION }} />
                                    : <X className="w-4 h-4" style={{ color: MODAL_CAPTION }} />}
                            </button>
                        </header>

                        <div className={cn(
                            "relative overflow-y-auto flex-1 min-h-0",
                            bare ? "" : "px-3.5 pb-4 space-y-2.5"
                        )}>
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
