import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useTelegram } from '@/hooks/useTelegram';
import { Check, X, Sparkles, Lock, RefreshCw, ExternalLink, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCoinBalance } from '@/hooks/useCoinBalance';

interface UserProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
    const { userId, verified, deposited, hasFullAccess, aiMessagesLeft, isLoading, fetchUserStatus } = useUserAccess();
    const { user } = useTelegram();
    const { coins, reload: reloadCoins } = useCoinBalance();

    const handleRefresh = async () => {
        await fetchUserStatus();
        reloadCoins();
    };

    const handleGetAccess = () => {
        // Открываем инструкцию в Telegram
        window.open('https://t.me/moneyhoney7_bot', '_blank');
    };

    const handleRegister = () => {
        window.open('https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50', '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md glass-card neon-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        👤 Профиль пользователя
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* User Info */}
                    <div className="glass-card rounded-lg p-4 border border-white/10">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Telegram ID:</span>
                                <span className="font-mono text-sm font-semibold">{userId || 'N/A'}</span>
                            </div>
                            {user?.username && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Username:</span>
                                    <span className="text-sm font-semibold">@{user.username}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Монеты NMNH: заработок за учёбу, тратится в магазине
                        платформы. Показываем здесь же, где остальные итоги */}
                    {coins && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-lg p-4 border border-primary/25
                                       flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                            bg-primary/15 border border-primary/25 text-primary flex-shrink-0">
                                <Coins className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Монеты NMNH</p>
                                <p className="font-display font-bold text-2xl text-primary tabular-nums">
                                    {coins.balance}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(coins.shopUrl, '_blank')}
                            >
                                Магазин
                            </Button>
                        </motion.div>
                    )}

                    {/* Status Cards */}
                    <div className="space-y-2">
                        {/* Registration Status */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border",
                                verified
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-orange-500/10 border-orange-500/30"
                            )}
                        >
                            {verified ? (
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <X className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Регистрация</p>
                                <p className="text-xs text-muted-foreground">
                                    {verified ? 'Пройдена' : 'Не пройдена'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Deposit Status */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border",
                                deposited
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-orange-500/10 border-orange-500/30"
                            )}
                        >
                            {deposited ? (
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <X className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Депозит</p>
                                <p className="text-xs text-muted-foreground">
                                    {deposited ? 'Подтвержден' : 'Не подтвержден'}
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Access Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={cn(
                            "p-4 rounded-xl border-2",
                            hasFullAccess
                                ? "bg-gradient-to-br from-green-500/20 to-primary/20 border-green-500/40"
                                : "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/40"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            {hasFullAccess ? (
                                <Sparkles className="w-5 h-5 text-green-500" />
                            ) : (
                                <Lock className="w-5 h-5 text-orange-500" />
                            )}
                            <h3 className="font-bold text-lg">
                                {hasFullAccess ? '🎉 Полный доступ!' : '⚠️ Ограниченный доступ'}
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold mb-2">
                                {hasFullAccess ? 'Доступно:' : 'Доступно сейчас:'}
                            </p>

                            <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-sm">
                                    AI-чат {hasFullAccess ? '(безлимитный)' : `(${aiMessagesLeft} ${aiMessagesLeft === 1 ? 'вопрос' : 'вопроса'})`}
                                </p>
                            </div>

                            {hasFullAccess && (
                                <>
                                    <div className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">Все модули обучения</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">Раздел стратегий</p>
                                    </div>
                                </>
                            )}

                            {!hasFullAccess && (
                                <>
                                    <p className="text-sm font-semibold mb-2 mt-3 text-orange-400">
                                        Недоступно без регистрации:
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-muted-foreground">Модули обучения</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <X className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-muted-foreground">Раздел стратегий</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                                Обновить
                            </Button>

                            {!hasFullAccess && (
                                <Button
                                    onClick={handleGetAccess}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Получить доступ
                                </Button>
                            )}
                        </div>

                        {!hasFullAccess && (
                            <Button
                                onClick={handleRegister}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Зарегистрироваться на платформе
                            </Button>
                        )}
                    </div>

                    {/* Instructions for non-verified users */}
                    {!hasFullAccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xs text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/10"
                        >
                            <p className="font-semibold mb-1">Как получить полный доступ:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Перейдите в основной бот по кнопке выше</li>
                                <li>Пройдите регистрацию на платформе</li>
                                <li>Внесите депозит</li>
                                <li>Отправьте свой ID боту</li>
                                <li>Дождитесь подтверждения от администратора</li>
                            </ol>
                        </motion.div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
