import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BarChart3, Check, Wand2 } from 'lucide-react';
import { AIMode } from '@/agent/config/prompts';
import { MARKETS, MARKET_META, type MarketChoice } from '@/agent/config/markets';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: AIMode;
    onSelectMode: (mode: AIMode) => void;
    currentMarket: MarketChoice;
    onSelectMarket: (market: MarketChoice) => void;
}

/** Порядок в меню: сперва «определи сам», дальше рынки как в академии. */
const MARKET_CHOICES: { value: MarketChoice; label: string; hint: string }[] = [
    { value: 'auto', label: 'Определить сам', hint: 'По вопросу и графику' },
    ...MARKETS.map(market => ({
        value: market as MarketChoice,
        label: MARKET_META[market].label,
        hint: MARKET_META[market].hint,
    })),
];

export function ModeSelector({
    isOpen,
    onClose,
    currentMode,
    onSelectMode,
    currentMarket,
    onSelectMarket,
}: ModeSelectorProps) {
    const handleSelect = (mode: AIMode) => {
        onSelectMode(mode);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Invisible Backdrop for click-outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />

                    {/* Dropdown Menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-[280px] max-h-[70vh] overflow-y-auto z-50"
                    >
                        <div className="glass-card neon-border rounded-xl p-2 shadow-xl bg-background/95 backdrop-blur-xl">
                            <div className="px-2 py-1.5 mb-1 border-b border-border/30">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Выберите режим
                                </h3>
                            </div>

                            <div className="space-y-1">
                                {/* Mentor Option */}
                                <button
                                    onClick={() => handleSelect('teacher')}
                                    className={cn(
                                        'w-full p-2 rounded-lg transition-all text-left flex items-start gap-3 relative group',
                                        currentMode === 'teacher'
                                            ? 'bg-primary/10'
                                            : 'hover:bg-white/5'
                                    )}
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                                        currentMode === 'teacher'
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-muted/30 text-muted-foreground group-hover:text-foreground'
                                    )}>
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                currentMode === 'teacher' ? "text-primary" : "text-foreground"
                                            )}>
                                                AI Ментор
                                            </span>
                                            {currentMode === 'teacher' && (
                                                <Check className="w-3.5 h-3.5 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                            Обучение, уроки и проверка заданий
                                        </p>
                                    </div>
                                </button>

                                {/* Analyst Option */}
                                <button
                                    onClick={() => handleSelect('analyst')}
                                    className={cn(
                                        'w-full p-2 rounded-lg transition-all text-left flex items-start gap-3 relative group',
                                        currentMode === 'analyst'
                                            ? 'bg-accent/10'
                                            : 'hover:bg-white/5'
                                    )}
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                                        currentMode === 'analyst'
                                            ? 'bg-accent/20 text-accent'
                                            : 'bg-muted/30 text-muted-foreground group-hover:text-foreground'
                                    )}>
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                currentMode === 'analyst' ? "text-accent" : "text-foreground"
                                            )}>
                                                AI Аналитик
                                            </span>
                                            {currentMode === 'analyst' && (
                                                <Check className="w-3.5 h-3.5 text-accent" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                            Сигналы, анализ графиков и трендов
                                        </p>
                                    </div>
                                </button>
                            </div>

                            {/* Рынок: от него зависит вердикт и расчёт риска.
                                Сигнал индикатора один, а сделка разная */}
                            <div className="px-2 py-1.5 mt-2 mb-1 border-t border-b border-border/30">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Рынок
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-1">
                                {MARKET_CHOICES.map(choice => (
                                    <button
                                        key={choice.value}
                                        onClick={() => {
                                            onSelectMarket(choice.value);
                                            onClose();
                                        }}
                                        className={cn(
                                            'p-2 rounded-lg transition-all text-left group border',
                                            currentMarket === choice.value
                                                ? 'bg-primary/10 border-primary/30'
                                                : 'border-transparent hover:bg-white/5'
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {choice.value === 'auto' && (
                                                <Wand2 className={cn(
                                                    'w-3 h-3 flex-shrink-0',
                                                    currentMarket === choice.value
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground'
                                                )} />
                                            )}
                                            <span className={cn(
                                                'text-xs font-medium leading-tight',
                                                currentMarket === choice.value
                                                    ? 'text-primary'
                                                    : 'text-foreground'
                                            )}>
                                                {choice.label}
                                            </span>
                                            {currentMarket === choice.value && (
                                                <Check className="w-3 h-3 text-primary flex-shrink-0 ml-auto" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                            {choice.hint}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
