import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Gift, Lock, Share2, Users } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/lib/utils';

interface RewardLevel {
    id: string;
    friends: number;
    days: number;
    name: string;
    description: string;
    claimed: boolean;
    reached: boolean;
}

interface ReferralData {
    link: string;
    clicks: number;
    activated: number;
    remaining: number;
    next_level: string | null;
    next_level_friends: number | null;
    pending_request: boolean;
    levels: RewardLevel[];
}

function getBotApiBase(): string {
    return import.meta.env.DEV
        ? '/bot-api'
        : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

/** Открывает окно «поделиться» Telegram, иначе обычную ссылку. */
function shareLink(link: string): void {
    const text = 'Академия здравого трейдера - обучение, разборы и живые сессии';
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    const tg = (window as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } })
        .Telegram?.WebApp;
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

const Referral = () => {
    const { userId } = useUserAccess();
    const { getProgress } = useProgress();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${getBotApiBase()}/referral?user_id=${userId}`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                });
                const json = await res.json();
                if (cancelled) return;
                if (json.error) {
                    setError('Не удалось загрузить данные');
                } else {
                    setData(json);
                }
            } catch {
                if (!cancelled) setError('Нет связи с ботом');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [userId]);

    const copyLink = useCallback(async () => {
        if (!data?.link) return;
        try {
            await navigator.clipboard.writeText(data.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Буфер обмена может быть недоступен - ссылка видна на экране
        }
    }, [data?.link]);

    // Прогресс до следующей награды, а если все взяты - до последней
    const target = data?.next_level_friends
        ?? data?.levels[data.levels.length - 1]?.friends
        ?? 1;
    const progress = data ? Math.min(100, Math.round((data.activated / target) * 100)) : 0;

    return (
        <div className="min-h-[100dvh] scanline pb-24">
            <MatrixRain />
            <div className="relative z-10">
                <Header progress={getProgress()} />

                <main className="p-4 sm:p-5 md:p-6 pb-24 flex justify-center">
                    <div className="max-w-lg w-full mx-auto">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="font-display font-bold text-xl sm:text-2xl mb-1 sm:mb-2">
                                Приводи друзей
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                За каждого, кто пройдёт верификацию, открывается награда
                            </p>
                        </div>

                        {loading && (
                            <div className="glass-card rounded-xl p-6 neon-border text-center text-muted-foreground text-sm">
                                Загружаем данные...
                            </div>
                        )}

                        {!loading && !userId && (
                            <div className="glass-card rounded-xl p-6 neon-border text-center text-sm text-muted-foreground">
                                Открой приложение из бота, чтобы увидеть свою ссылку
                            </div>
                        )}

                        {!loading && error && (
                            <div className="glass-card rounded-xl p-6 neon-border text-center text-sm text-muted-foreground">
                                {error}
                            </div>
                        )}

                        {data && (
                            <div className="space-y-3 sm:space-y-4">
                                {/* Прогресс до награды */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card rounded-xl p-4 sm:p-5 neon-border"
                                >
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">
                                            {data.next_level
                                                ? `До награды «${data.next_level}»`
                                                : 'Все награды открыты'}
                                        </span>
                                        <span className="font-display font-bold text-lg text-primary tabular-nums">
                                            {data.activated}/{target}
                                        </span>
                                    </div>

                                    <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                                        />
                                    </div>

                                    {data.remaining > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Осталось пригласить: {data.remaining}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Ссылка */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.06 }}
                                    className="glass-card rounded-xl p-4 sm:p-5 neon-border"
                                >
                                    <h3 className="font-display font-bold text-base mb-2">
                                        Твоя ссылка
                                    </h3>
                                    <p className="font-mono text-xs text-muted-foreground break-all mb-3">
                                        {data.link}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 justify-center gap-2"
                                            onClick={copyLink}
                                        >
                                            {copied
                                                ? <><Check className="w-4 h-4" /> Скопировано</>
                                                : <><Copy className="w-4 h-4" /> Копировать</>}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 justify-center gap-2"
                                            onClick={() => shareLink(data.link)}
                                        >
                                            <Share2 className="w-4 h-4" /> Поделиться
                                        </Button>
                                    </div>
                                </motion.div>

                                {/* Счётчики */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.12 }}
                                    className="grid grid-cols-2 gap-2 sm:gap-4"
                                >
                                    <div className="glass-card rounded-xl p-4 neon-border text-center">
                                        <div className="text-2xl font-bold text-primary tabular-nums mb-1">
                                            {data.clicks}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Переходов</div>
                                    </div>
                                    <div className="glass-card rounded-xl p-4 neon-border text-center">
                                        <div className="text-2xl font-bold text-primary tabular-nums mb-1">
                                            {data.activated}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Прошли верификацию</div>
                                    </div>
                                </motion.div>

                                {/* Награды */}
                                <div className="space-y-2 sm:space-y-3">
                                    <h3 className="font-display font-bold text-base mt-5 mb-1">Награды</h3>

                                    {data.levels.map((level, index) => (
                                        <motion.div
                                            key={level.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.18 + index * 0.06 }}
                                            className={cn(
                                                'glass-card rounded-xl p-4 flex items-start gap-3',
                                                level.reached ? 'neon-border' : 'border border-border/40 opacity-70'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                                                level.reached
                                                    ? 'bg-gradient-to-br from-primary/15 to-primary/25 border-primary/20 text-primary'
                                                    : 'bg-muted/20 border-border/40 text-muted-foreground'
                                            )}>
                                                {level.reached
                                                    ? <Gift className="w-5 h-5" />
                                                    : <Lock className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-display font-bold text-sm">{level.name}</h4>
                                                    {level.claimed && (
                                                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                            получена
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {level.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                                    <Users className="w-3 h-3" />
                                                    {level.friends} друзей
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {data.pending_request && (
                                    <p className="text-xs text-muted-foreground text-center pt-1">
                                        Заявка на награду уже отправлена - ждём подтверждения
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground text-center pt-2">
                                    Друг засчитывается после регистрации и депозита. Забрать награду
                                    можно в боте - командой /referral
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <BottomNav />
        </div>
    );
};

export default Referral;
