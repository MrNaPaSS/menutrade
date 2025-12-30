import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSurveyData } from './OnboardingSurvey';

interface TutorialStep {
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: TutorialStep[] = [
    {
        targetId: 'welcome',
        title: 'Добро пожаловать!',
        description: 'Рады видеть вас в Академии Здравого Трейдера! Давайте быстро пробежимся по основным функциям приложения.',
        position: 'center'
    },
    {
        targetId: 'learning',
        title: 'Обучение',
        description: 'Здесь находится ваш прогресс и доступ к урокам. Продолжайте обучение с того места, где остановились.',
        position: 'bottom'
    },
    {
        targetId: 'nav-strategies',
        title: 'Стратегии',
        description: 'В этом разделе собраны проверенные торговые стратегии.',
        position: 'center'
    },
    {
        targetId: 'trader-menu',
        title: 'Меню трейдера',
        description: 'Ваш личный кабинет: здесь вы найдете промокоды, FAQ, уровни доступа и ссылки на торговые платформы.',
        position: 'bottom'
    },
    {
        targetId: 'header-menu-button',
        title: 'Профиль и Настройки',
        description: 'В этом меню находятся настройки приложения и ваш профиль пользователя.',
        position: 'bottom'
    },
    {
        targetId: 'news',
        title: 'Новости',
        description: 'Будьте в курсе событий рынка. Экономический календарь и важные новости.',
        position: 'top'
    },
    {
        targetId: 'software',
        title: 'Софт',
        description: 'Полезные инструменты и программы для эффективной торговли.',
        position: 'top'
    },
    {
        targetId: 'library',
        title: 'Библиотека',
        description: 'База знаний: книги по психологии трейдинга и техническому анализу.',
        position: 'top'
    },
    {
        targetId: 'guess-chart',
        title: 'Мини-игра',
        description: 'Тренируйте свою насмотренность в игре "Куда пойдет график".',
        position: 'top'
    },
    {
        targetId: 'home-progress-stats',
        title: 'Статистика',
        description: 'Отслеживайте свой общий прогресс по модулям и урокам.',
        position: 'top'
    },
    {
        targetId: 'ai-agent-trigger',
        title: 'AI Агент',
        description: 'Ваш персональный помощник. Задавайте любые вопросы по трейдингу и обучению.',
        position: 'center'
    }
];

export function OnboardingTutorial() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Check if tutorial should run
    useEffect(() => {
        const checkTutorialStatus = () => {
            // Check if survey is completed
            const surveyData = getSurveyData();
            if (!surveyData?.completed) return;

            // Check if tutorial is already completed
            const tutorialCompleted = localStorage.getItem('tutorial_completed');
            if (tutorialCompleted) return;

            // Start tutorial
            setIsVisible(true);
        };

        // Small delay to ensure everything is loaded
        const timer = setTimeout(checkTutorialStatus, 1000);
        return () => clearTimeout(timer);
    }, []);

    const updateTargetRect = useCallback(() => {
        const step = steps[currentStep];
        if (step.targetId === 'welcome') {
            setTargetRect(null); // Center screen
            return;
        }

        const element = document.getElementById(step.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
        } else {
            // If element not found, skip to next step or fallback
            console.warn(`Tutorial target ${step.targetId} not found`);
        }
    }, [currentStep]);

    useEffect(() => {
        if (isVisible) {
            // Scroll to element if needed
            const step = steps[currentStep];
            if (step.targetId !== 'welcome') {
                const element = document.getElementById(step.targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            // Wait for scroll/render then update rect
            const timer = setTimeout(updateTargetRect, 500);
            window.addEventListener('resize', updateTargetRect);
            window.addEventListener('scroll', updateTargetRect);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updateTargetRect);
                window.removeEventListener('scroll', updateTargetRect);
            };
        }
    }, [isVisible, currentStep, updateTargetRect]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishTutorial();
        }
    };

    const finishTutorial = () => {
        setIsVisible(false);
        localStorage.setItem('tutorial_completed', 'true');
    };

    if (!isVisible) return null;

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    // Determine positioning values
    const getPositionStyles = () => {
        if (currentStepData.position === 'center') {
            return {
                style: {
                    position: 'fixed' as const,
                    top: '50%',
                    left: '50%',
                    zIndex: 10002
                },
                initial: { opacity: 0, x: "-50%", y: "-40%", scale: 0.9 },
                animate: { opacity: 1, x: "-50%", y: "-50%", scale: 1 },
                exit: { opacity: 0, x: "-50%", y: "-40%", scale: 0.9 }
            };
        }

        // For non-center elements
        if (!targetRect) return {};

        if (currentStepData.position === 'top') {
            return {
                style: {
                    position: 'absolute' as const,
                    top: targetRect.top - 20,
                    // Horizontal centering provided by parent flex
                },
                initial: { opacity: 0, y: "0%", x: 0, scale: 0.9 },
                animate: { opacity: 1, y: "-100%", x: 0, scale: 1 },
                exit: { opacity: 0, y: "0%", x: 0, scale: 0.9 }
            };
        } else {
            // bottom
            return {
                style: {
                    position: 'absolute' as const,
                    top: targetRect.bottom + 20,
                },
                initial: { opacity: 0, y: "0%", x: 0, scale: 0.9 },
                animate: { opacity: 1, y: "0%", x: 0, scale: 1 },
                exit: { opacity: 0, y: "0%", x: 0, scale: 0.9 }
            };
        }
    };

    const pos = getPositionStyles();

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ pointerEvents: 'none' }}>
            {/* Backdrop with cutout */}
            <div
                className={cn(
                    "absolute inset-0 transition-all duration-500",
                    !targetRect && "bg-black/40"
                )}
                style={{ pointerEvents: 'auto' }}
            >
                {targetRect && (
                    <div
                        className="absolute transition-all duration-500 ease-out shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
                        style={{
                            left: targetRect.left - 10,
                            top: targetRect.top - 10,
                            width: targetRect.width + 20,
                            height: targetRect.height + 20,
                            borderRadius: '16px',
                        }}
                    />
                )}
            </div>

            {/* Spotlight highlight (border) */}
            <AnimatePresence>
                {targetRect && (
                    <motion.div
                        key="spotlight"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute border-2 border-primary rounded-xl box-content shadow-[0_0_30px_rgba(34,197,94,0.3)] pointer-events-none transition-all duration-500 ease-out"
                        style={{
                            left: targetRect.left - 10,
                            top: targetRect.top - 10,
                            width: targetRect.width + 20,
                            height: targetRect.height + 20,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Content Card */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Skip Button */}
                <div className="absolute top-4 right-4 pointer-events-auto z-[10000]">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={finishTutorial}
                        className="text-white hover:text-white/80 hover:bg-white/10"
                    >
                        Пропустить
                        <X className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={pos.initial}
                        animate={pos.animate}
                        exit={pos.exit}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="pointer-events-auto max-w-sm w-[90%] mx-auto"
                        style={pos.style}
                    >
                        <div className="glass-card bg-black/80 border border-primary/30 p-5 rounded-2xl shadow-xl backdrop-blur-xl">
                            <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary ring-1 ring-primary/50">
                                    {currentStep + 1}
                                </span>
                                {currentStepData.title}
                            </h3>
                            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                                {currentStepData.description}
                            </p>

                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    {steps.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full transition-colors",
                                                idx === currentStep ? "bg-primary" : "bg-white/20"
                                            )}
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={handleNext}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {isLastStep ? 'Начать' : 'Далее'}
                                    {isLastStep ? <Check className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </div>

                        {/* Pointer Arrow - Only show if NOT centered */}
                        {targetRect && currentStepData.position !== 'center' && (
                            <div
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-black/80 border-l border-t border-primary/30 rotate-45",
                                    currentStepData.position === 'top' ? "-bottom-2 border-l-0 border-t-0 border-r border-b" : "-top-2"
                                )}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
