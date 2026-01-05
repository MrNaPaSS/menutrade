import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BarChart3, Check } from 'lucide-react';
import { AIMode } from '@/config/prompts';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: AIMode;
    onSelectMode: (mode: AIMode) => void;
}

export function ModeSelector({ isOpen, onClose, currentMode, onSelectMode }: ModeSelectorProps) {
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
                        className="absolute right-0 top-full mt-2 w-[260px] z-50"
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
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
