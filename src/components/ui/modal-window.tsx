import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { GraffitiSpray } from '@/components/graffiti/Graffiti';
import { cn } from '@/lib/utils';
import { useBackAction } from '@/contexts/BackNavigationContext';

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
    /**
     * Не рисовать шапку окна.
     *
     * Нужно там, где у содержимого своя шапка с органами управления -
     * например у AI-агента с выбором режима и историей чатов. Две
     * шапки подряд читаются как ошибка вёрстки.
     */
    hideHeader?: boolean;
    /** Окно пошире: для чата и всего, где текст идёт длинными строками */
    wide?: boolean;
    /**
     * Прокрутку берёт на себя содержимое.
     *
     * У чата своя область прокрутки; если прокручивать ещё и тело
     * окна, полос становится две и они мешают друг другу.
     */
    noScroll?: boolean;
    children: ReactNode;
}

/** Круглая кнопка в углу шапки: назад слева, закрыть справа */
const CORNER_BUTTON =
    'absolute w-8 h-8 rounded-full flex items-center justify-center ' +
    'border border-white/[0.08] bg-white/[0.04] ' +
    'transition-colors duration-200 hover:bg-white/[0.09] ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

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
    hideHeader = false,
    wide = false,
    noScroll = false,
    children,
}: ModalWindowProps) {
    const reduced = useReducedMotion();

    // Полосу кнопок Telegram обходит только окно во весь экран. Окно
    // посреди экрана и так ниже них, а с этими отступами кнопка съезжала
    // вниз, на содержимое, - ниже собственной шапки
    const cornerTop = fullscreen
        ? 'top-[calc(env(safe-area-inset-top)+var(--tg-content-top,0px)+12px)]'
        : 'top-5';

    // Пока окно открыто, «назад» - и жестом от края, и кнопкой -
    // делает шаг внутри окна или закрывает его, а не уводит со
    // страницы. Здесь одно место на все окна сразу
    useBackAction(() => (onBack ?? onClose)(), open);

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

    // Рисуем окно в body, а не там, где стоит кнопка. Любой предок с
    // transform, filter или backdrop-filter делает себя точкой отсчёта
    // для fixed-потомков, и окно вместо экрана раскрывается внутри
    // такого предка - например от кнопки в шапке вверх
    return createPortal(
        <AnimatePresence>
            {open && (
                <div
                    className={cn(
                        "fixed inset-x-0 z-[90] flex items-center justify-center",
                        fullscreen ? "p-0" : "p-4"
                    )}
                    /* Держимся видимой части экрана, а не всего окна: при
                       открытой клавиатуре окно центрировалось по области,
                       половина которой уже под клавиатурой, и уезжало вниз */
                    style={{
                        top: 'var(--app-vtop, 0px)',
                        height: 'var(--app-vh, 100dvh)',
                    }}
                >
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
                                : cn(
                                    "w-full rounded-[26px]",
                                    wide ? "max-w-3xl h-[86%]" : "max-w-md max-h-[92%]"
                                )
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

                        {!hideHeader && (
                        <header className={cn(
                            "relative px-5 pb-4",
                            fullscreen
                                ? "pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,12px)+12px)]"
                                : "pt-5"
                        )}>
                            {/* Шаг назад слева, как в любом экране: стрелка
                                справа читается как «вперёд». Крестик, наоборот,
                                привычен справа */}
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    aria-label="Назад"
                                    className={cn(CORNER_BUTTON, 'left-4', cornerTop)}
                                >
                                    <ArrowLeft className="w-4 h-4" style={{ color: MODAL_CAPTION }} />
                                </button>
                            )}

                            {!onBack && (
                                <button
                                    onClick={onClose}
                                    aria-label="Закрыть"
                                    className={cn(CORNER_BUTTON, 'right-4', cornerTop)}
                                >
                                    <X className="w-4 h-4" style={{ color: MODAL_CAPTION }} />
                                </button>
                            )}

                            {/* Мазок за названием, а не за списком: под
                                плотным текстом он рушит читаемость */}
                            <GraffitiSpray className="-top-6 -left-4 w-52 h-32" opacity={0.07} />

                            <div className={cn('relative min-w-0', onBack ? 'text-center px-10' : 'pr-12')}>
                                <h2
                                    className="font-display font-bold text-[18px] tracking-tight leading-tight"
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
                        </header>
                        )}

                        <div className={cn(
                            "relative flex-1 min-h-0",
                            noScroll ? "flex flex-col" : "overflow-y-auto",
                            bare ? "" : "px-3.5 pb-4 space-y-2.5"
                        )}>
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
