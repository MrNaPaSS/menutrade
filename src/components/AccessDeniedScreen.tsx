import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ExternalLink, Radio, GraduationCap, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RegistrationGate } from './RegistrationGate';

interface AccessDeniedScreenProps {
    feature: 'обучение' | 'стратегии' | 'форум и live';
    onBack?: () => void;
}

export function AccessDeniedScreen({ feature, onBack }: AccessDeniedScreenProps) {
    const [showGate, setShowGate] = useState(false);

    // Регистрация внутри аппа: человек не уходит в бота, проходит все шаги здесь.
    // Когда админ подтвердит депозит - hasFullAccess обновится и страница откроется сама.
    if (showGate) {
        return <RegistrationGate onBack={() => setShowGate(false)} />;
    }

    const handleGetAccess = () => {
        setShowGate(true);
    };

    return (
        <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full"
            >
                <div className="glass-card rounded-2xl p-6 sm:p-8 neon-border text-center">
                    {/* Lock Icon */}
                    <motion.div
                        className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center mb-6"
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, -5, 5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                        }}
                    >
                        <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
                        🔒 Доступ ограничен
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground mb-5">
                        Раздел <span className="text-primary font-semibold">"{feature}"</span> открывается
                        вместе с полным доступом к Академии.
                    </p>

                    {/* Что открывает полный доступ */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4 text-left space-y-3">
                        <p className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                            Полный доступ открывает
                        </p>
                        <div className="flex items-start gap-3 text-sm">
                            <Radio className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>
                                <span className="text-foreground font-semibold">Форум с live-торговлей</span>
                                <span className="text-muted-foreground"> - разборы рынка и сделки вместе с автором</span>
                            </span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>
                                <span className="text-foreground font-semibold">48 уроков и все стратегии</span>
                                <span className="text-muted-foreground"> - от свечей до готовых торговых систем</span>
                            </span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Bot className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <span>
                                <span className="text-foreground font-semibold">Безлимитный AI-наставник</span>
                                <span className="text-muted-foreground"> - ответы на вопросы 24/7</span>
                            </span>
                        </div>
                    </div>

                    {/* Как получить */}
                    <p className="text-xs text-muted-foreground mb-6">
                        Регистрация аккаунта + депозит от $20 - весь путь займёт около 5 минут.
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleGetAccess}
                            className="w-full bg-primary hover:bg-primary/90 text-base py-6"
                            size="lg"
                        >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Получить полный доступ
                        </Button>

                        {onBack && (
                            <Button
                                onClick={onBack}
                                variant="outline"
                                className="w-full"
                                size="lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад
                            </Button>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-300">
                            💡 <span className="font-semibold">Подсказка:</span> После регистрации и депозита вы получите безлимитный доступ ко всем функциям приложения!
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
