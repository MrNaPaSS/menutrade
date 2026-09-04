import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins, Copy, Gift, Lock, Share2, Users } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { fetchCoinBalance } from '@/lib/coins';
import { DailyCalendar } from '@/components/DailyCalendar';
import { PartnerQuests } from '@/components/PartnerQuests';
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
    balance: number;
    spent: number;
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

/** Приглашение, которое уйдёт другу вместе со ссылкой. */
const SHARE_TEXT = [
    'Академия здравого трейдера',
    '',
    '48 уроков, тренажёр графиков и AI-наставник - бесплатно.',
    'После верификации открываются живые сессии, разборы рынка',
    'и закрытый форум трейдеров.',
    '',
    'Заходи по ссылке:',
].join('\n');

/** Открывает внешнюю ссылку через Telegram, иначе обычной вкладкой. */
function shareOpen(url: string): void {
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } })
        .Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

/** Открывает окно «поделиться» Telegram, иначе обычную ссылку. */
function shareLink(link: string): void {
    // Ссылку кладём и в url, и в конец текста: клиенты Telegram по-разному
    // собирают сообщение, и без этого друг иногда получает текст без ссылки
    const text = `${SHARE_TEXT}\n${link}`;
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
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Какая награда сейчас забирается, ник в TradingView и состояние отправки
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [tradingview, setTradingview] = useState('');
    const [sending, setSending] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [coins, setCoins] = useState<Awaited<ReturnType<typeof fetchCoinBalance>>>(null);

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

    // Монеты NMNH: копятся за учёбу и торговлю, тратятся в магазине платформы
    useEffect(() => {
        let cancelled = false;
        fetchCoinBalance().then(data => {
            if (!cancelled) setCoins(data);
        });
        return () => { cancelled = true; };
    }, []);

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

    /** Отправляет заявку на награду. Дальше её подтверждает админ в боте. */
    const claimBonus = useCallback(async (bonusId: string) => {
        if (!userId) return;
        setSending(true);
        setClaimError(null);
        try {
            const res = await fetch(`${getBotApiBase()}/claim-bonus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ userId, bonusId, tradingview: tradingview.trim() }),
            });
            const json = await res.json();
            if (json.success) {
                setClaimingId(null);
                setTradingview('');
                setData(prev => (prev ? { ...prev, pending_request: true } : prev));
            } else {
                setClaimError(json.error || 'Не удалось отправить заявку');
            }
        } catch {
            setClaimError('Нет связи с ботом');
        } finally {
            setSending(false);
        }
    }, [userId, tradingview]);

    // Шкала идёт до высшей награды - так виден весь путь целиком.
    // Считаем по остатку: полученные награды тратят приглашённых.
    const target = data?.levels[data.levels.length - 1]?.friends ?? 10;
    const balance = data?.balance ?? data?.activated ?? 0;
    const progress = data ? Math.min(100, Math.round((balance / target) * 100)) : 0;

    return (
        <div className="min-h-[100dvh] scanline pb-24">
            <MatrixRain />
            <div className="relative z-10">
                <main className="px-4 sm:px-5 md:px-6 pb-24 flex justify-center
                               pt-[calc(env(safe-area-inset-top)+3.5rem)] sm:pt-16">
                    <div className="max-w-lg w-full mx-auto">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="font-display font-bold text-xl sm:text-2xl mb-1 sm:mb-2">
                                Приводи друзей - получай бонусы
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                За каждого квалифицированного реферала открывается награда
                            </p>
                        </div>

                        {/* Календарь не зависит от данных рефералки: если бот
                            недоступен, монеты за день всё равно можно забрать -
                            событие уйдёт из очереди позже */}
                        <div className="mb-3 sm:mb-4">
                            <DailyCalendar />
                        </div>

                        {/* Задания за партнёрок: отметки ставит бот, поэтому
                            блок живёт отдельно от данных рефералки */}
                        <div className="mb-3 sm:mb-4">
                            <PartnerQuests />
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
                                {coins && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card rounded-xl p-4 sm:p-5 neon-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center
                                                            bg-gradient-to-br from-primary/15 to-primary/25
                                                            border border-primary/20 text-primary flex-shrink-0">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground">Монеты NMNH</p>
                                                <p className="font-display font-bold text-2xl text-primary tabular-nums">
                                                    {coins.balance}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground mt-3">
                                            {coins.visited
                                                ? 'Копятся за уроки и торговлю, тратятся в магазине'
                                                : 'Копятся за уроки и торговлю. Потратить их можно на nmnh.trade'}
                                        </p>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center mt-3"
                                            onClick={() => shareOpen(coins.shopUrl)}
                                        >
                                            Открыть магазин
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Прогресс до награды */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card rounded-xl p-4 sm:p-5 neon-border"
                                >
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">
                                            {data.next_level ? 'До награды' : 'Все награды открыты'}
                                        </span>
                                        <span className="font-display font-bold text-lg text-primary tabular-nums">
                                            {balance}/{target}
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
                                            До ближайшей награды: {data.remaining}
                                        </p>
                                    )}
                                    {data.spent > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Потрачено на полученные награды: {data.spent}
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

                                                {level.reached && !level.claimed && !data.pending_request && (
                                                    claimingId === level.id ? (
                                                        <div className="mt-3 space-y-2">
                                                            <input
                                                                type="text"
                                                                value={tradingview}
                                                                onChange={(e) => setTradingview(e.target.value)}
                                                                placeholder="Ник в TradingView"
                                                                autoFocus
                                                                className="input-glass w-full rounded-lg px-3 py-2 text-sm"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="flex-1 justify-center"
                                                                    disabled={sending || !tradingview.trim()}
                                                                    onClick={() => claimBonus(level.id)}
                                                                >
                                                                    {sending ? 'Отправляем...' : 'Отправить'}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="justify-center"
                                                                    onClick={() => setClaimingId(null)}
                                                                >
                                                                    Отмена
                                                                </Button>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground">
                                                                Ник нужен, чтобы выдать доступ к индикатору
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="mt-3 w-full justify-center gap-2"
                                                            onClick={() => { setClaimingId(level.id); setClaimError(null); }}
                                                        >
                                                            <Gift className="w-4 h-4" /> Забрать награду
                                                        </Button>
                                                    )
                                                )}

                                                {claimError && claimingId === level.id && (
                                                    <p className="text-xs text-destructive mt-2">{claimError}</p>
                                                )}
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
                                    Друг засчитывается после регистрации и депозита
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
