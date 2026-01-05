import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Code } from 'lucide-react';

interface TelegramAuthScreenProps {
    isLoading?: boolean;
    isTelegram: boolean;
}

export function TelegramAuthScreen({ isLoading, isTelegram }: TelegramAuthScreenProps) {
    const isDev = import.meta.env.DEV;

    const handleDevBypass = () => {
        localStorage.setItem('dev_bypass', 'true');
        window.location.reload();
    };

    // Загрузка
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"
                    >
                        <Loader2 className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="font-display font-bold text-xl mb-2 neon-text-subtle">Инициализация...</h2>
                    <p className="text-sm text-muted-foreground">Проверка Telegram</p>
                </motion.div>
            </div>
        );
    }

    // Не в Telegram
    if (!isTelegram) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-sm w-full glass-card rounded-2xl neon-border p-6 text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <AlertCircle className="w-10 h-10 text-primary" />
                    </div>

                    <h2 className="font-display font-bold text-xl mb-2 neon-text-subtle">
                        Требуется Telegram
                    </h2>

                    <p className="text-sm text-muted-foreground mb-6">
                        Это приложение доступно только через Telegram
                    </p>

                    <div className="p-4 rounded-xl bg-muted/20 border border-border/30 text-left mb-4">
                        <h3 className="font-semibold text-sm mb-2 text-foreground">Как открыть:</h3>
                        <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                            <li>Откройте Telegram</li>
                            <li>Найдите бота @moneyhoney7_bot</li>
                            <li>Нажмите "Открыть приложение"</li>
                        </ol>
                    </div>

                    <button
                        onClick={() => window.open('https://t.me/moneyhoney7_bot', '_blank')}
                        className="w-full py-3 px-4 rounded-xl btn-premium text-primary-foreground font-medium mb-3"
                    >
                        Открыть в Telegram
                    </button>

                    {/* Dev bypass button - только в режиме разработки */}
                    {isDev && (
                        <button
                            onClick={handleDevBypass}
                            className="w-full py-2 px-4 rounded-xl border border-accent/30 bg-accent/10 text-accent text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors"
                        >
                            <Code className="w-4 h-4" />
                            Debug Login (Dev)
                        </button>
                    )}
                </motion.div>
            </div>
        );
    }

    return null;
}
