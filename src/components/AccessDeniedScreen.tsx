import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedScreenProps {
    feature: 'обучение' | 'стратегии';
    onBack?: () => void;
}

export function AccessDeniedScreen({ feature, onBack }: AccessDeniedScreenProps) {
    const handleGetAccess = () => {
        // Открываем бота для регистрации
        window.open('https://t.me/moneyhoney7_bot', '_blank');
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
                    <p className="text-muted-foreground mb-6">
                        Для доступа к разделу <span className="text-primary font-semibold">"{feature}"</span> необходимо:
                    </p>

                    {/* Steps */}
                    <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                        <ol className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                    1
                                </span>
                                <span>Пройти регистрацию в основном боте</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                    2
                                </span>
                                <span>Внести депозит на платформу</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                    3
                                </span>
                                <span>Отправить ID боту и дождаться подтверждения администратора</span>
                            </li>
                        </ol>
                    </div>

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
