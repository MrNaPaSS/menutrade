import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { RegistrationGate } from '@/components/RegistrationGate';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useTelegram } from '@/hooks/useTelegram';
import { Check, X, Sparkles, Lock, RefreshCw, ExternalLink, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserProfile = () => {
    const navigate = useNavigate();
    const { userId, verified, deposited, hasFullAccess, aiMessagesLeft, isLoading, fetchUserStatus } = useUserAccess();
    const { user } = useTelegram();
    const [showGate, setShowGate] = useState(false);

    const handleRefresh = async () => {
        await fetchUserStatus();
    };

    // Получение доступа - весь путь внутри аппа через RegistrationGate
    const handleGetAccess = () => {
        setShowGate(true);
    };
    const handleRegister = () => {
        setShowGate(true);
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    if (showGate) {
        return <RegistrationGate onBack={() => setShowGate(false)} />;
    }

    return (
        <div className="min-h-[100dvh] scanline pb-16">
            <MatrixRain />
            <div className="relative z-10">
                {/* Header */}
                <motion.div
                    className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="relative flex items-center justify-center py-2 sm:py-3">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleHomeClick}
                                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                            >
                                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Назад</span>
                            </Button>
                        </div>
                        <h2 className="font-display font-bold text-lg sm:text-xl">👤 Профиль пользователя</h2>
                        <div className="absolute right-4 -top-3">
                            <SimpleMenu />
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <main className="p-4 sm:p-6 md:p-8 pb-16 flex justify-center">
                    <div className="max-w-md w-full mx-auto space-y-4">

                        {/* User Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card rounded-lg p-4 neon-border"
                        >
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
                        </motion.div>

                        {/* Status Cards */}
                        <div className="space-y-2">
                            {/* Registration Status */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border glass-card",
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
                                transition={{ delay: 0.3 }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border glass-card",
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
                            transition={{ delay: 0.4 }}
                            className={cn(
                                "p-4 rounded-xl border-2 glass-card",
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
                                transition={{ delay: 0.5 }}
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
                </main>
            </div>
            <BottomNav onHomeClick={handleHomeClick} />
        </div>
    );
};

export default UserProfile;
