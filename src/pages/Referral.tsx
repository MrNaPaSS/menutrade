import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins, Copy, Gift, Lock, Share2, Users } from 'lucide-react';
import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useCoinBalance } from '@/hooks/useCoinBalance';
import { DailyCalendar } from '@/components/DailyCalendar';
import { PartnerQuests } from '@/components/PartnerQuests';
import { GraffitiSpray, GraffitiStar } from '@/components/graffiti/Graffiti';
import { ProgressRing } from '@/components/ProgressRing';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

// Те же поверхности, что во всех окнах и панелях приложения
const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

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
    '73 урока, тренажёр графиков и AI-наставник - бесплатно.',
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
    // Монеты NMNH. Хук слушает начисления, поэтому число на этом же
    // экране растёт сразу после того, как забрали подарок, - раньше
    // оно ждало, пока человек уйдёт с экрана и вернётся
    const { coins } = useCoinBalance();
    const [copied, setCopied] = useState(false);

    // Какая награда сейчас забирается, ник в TradingView и состояние отправки
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [tradingview, setTradingview] = useState('');
    const [sending, setSending] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);

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
    const shownCoins = useCountUp(coins?.balance ?? 0);

    return (
        <div className="min-h-[100dvh] scanline pb-24">
            <AppBackground />
            <div className="relative z-10">
                <main className="px-4 sm:px-5 md:px-6 pb-24 flex justify-center
                               pt-[calc(env(safe-area-inset-top)+3.5rem)] sm:pt-16">
                    <div className="max-w-lg w-full mx-auto">
                        <div className="relative mb-4 sm:mb-5">
                            <GraffitiSpray className="-top-10 -left-8 w-56 h-36" opacity={0.08} />
                            <div className="relative">
                                <h2 className="font-display font-bold text-[21px] tracking-tight">
                                    Приводи друзей - получай бонусы
                                </h2>
                                <p className="text-[12.5px] text-muted-foreground mt-1.5">
                                    Друг засчитывается после регистрации и депозита
                                </p>
                            </div>
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
                            <div className={`${PANEL} p-6 text-center text-muted-foreground text-[13px]`} style={PANEL_BG}>
                                Загружаем данные...
                            </div>
                        )}

                        {!loading && !userId && (
                            <div className={`${PANEL} p-6 text-center text-[13px] text-muted-foreground`} style={PANEL_BG}>
                                Открой приложение из бота, чтобы увидеть свою ссылку
                            </div>
                        )}

                        {!loading && error && (
                            <div className={`${PANEL} p-6 text-center text-[13px] text-muted-foreground`} style={PANEL_BG}>
                                {error}
                            </div>
                        )}

                        {data && (
                            <div className="space-y-3 sm:space-y-4">
                                {coins && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`${PANEL} p-4 sm:p-5`} style={PANEL_BG}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-11 h-11 rounded-[14px] flex items-center justify-center
                                                           flex-shrink-0 border border-white/[0.07]"
                                                style={{
                                                    background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
                                                    color: 'hsl(142 76% 62%)',
                                                }}
                                            >
                                                <Coins className="w-5 h-5" />
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11.5px] text-muted-foreground">Монеты NMNH</p>
                                                {/* Счётчик набегает: так видно, что число живое,
                                                    а не нарисовано на картинке */}
                                                <p
                                                    className="font-mono font-bold text-[26px] leading-none tabular-nums mt-1"
                                                    style={{ color: 'hsl(142 76% 58%)' }}
                                                >
                                                    {shownCoins}
                                                </p>
                                            </div>
                                            <GraffitiStar className="w-10 h-10 flex-shrink-0" delay={0.2} />
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
                                    className={`${PANEL} p-4 sm:p-5`} style={PANEL_BG}
                                >
                                    {/* Кольцо вместо полосы: та же фигура, что
                                        показывает прогресс обучения на главной */}
                                    <div className="flex items-center gap-4">
                                        <ProgressRing percent={progress}>
                                            <span
                                                className="font-mono font-bold text-[17px] tabular-nums leading-none"
                                                style={{ color: 'hsl(142 76% 58%)' }}
                                            >
                                                {balance}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5">из {target}</span>
                                        </ProgressRing>

                                        <div className="min-w-0">
                                            <p className="font-semibold text-[15px] text-foreground">
                                                {data.next_level ? 'До награды' : 'Все награды открыты'}
                                            </p>
                                            {data.remaining > 0 && (
                                                <p className="text-[12px] text-muted-foreground mt-1">
                                                    Осталось привести: {data.remaining}
                                                </p>
                                            )}
                                            {data.spent > 0 && (
                                                <p className="text-[12px] text-muted-foreground mt-0.5">
                                                    Потрачено на награды: {data.spent}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Ссылка */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.06 }}
                                    className={`${PANEL} p-4 sm:p-5`} style={PANEL_BG}
                                >
                                    <h3 className="font-bold text-base mb-2">
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
                                    className="grid grid-cols-2 gap-2 sm:gap-3"
                                >
                                    <div className={`${PANEL} p-4 text-center`} style={PANEL_BG}>
                                        <div
                                            className="font-mono font-bold text-[24px] tabular-nums leading-none"
                                            style={{ color: 'hsl(142 76% 58%)' }}
                                        >
                                            {data.clicks}
                                        </div>
                                        <div className="text-[11.5px] text-muted-foreground mt-1.5">Переходов</div>
                                    </div>
                                    <div className={`${PANEL} p-4 text-center`} style={PANEL_BG}>
                                        <div
                                            className="font-mono font-bold text-[24px] tabular-nums leading-none"
                                            style={{ color: 'hsl(142 76% 58%)' }}
                                        >
                                            {data.activated}
                                        </div>
                                        <div className="text-[11.5px] text-muted-foreground mt-1.5">Верификаций</div>
                                    </div>
                                </motion.div>

                                {/* Награды */}
                                <div className="space-y-2 sm:space-y-3">
                                    <h3 className="font-bold text-base mt-5 mb-1">Награды</h3>

                                    {data.levels.map((level, index) => (
                                        <motion.div
                                            key={level.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.18 + index * 0.06 }}
                                            className={cn(
                                                'rounded-[18px] p-4 flex items-start gap-3 border',
                                                level.reached
                                                    ? 'border-[hsl(142_38%_24%)] bg-[hsl(142_30%_10%)]'
                                                    : 'border-[hsl(142_18%_14%)] bg-[hsl(140_24%_7%)]'
                                            )}
                                        >
                                            <span
                                                className="w-10 h-10 rounded-[13px] flex items-center justify-center
                                                           flex-shrink-0 border border-white/[0.07]"
                                                style={{
                                                    background: level.reached
                                                        ? 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))'
                                                        : 'hsl(142 20% 12%)',
                                                    color: level.reached ? 'hsl(142 76% 62%)' : 'hsl(142 15% 42%)',
                                                }}
                                            >
                                                {level.reached
                                                    ? <Gift className="w-5 h-5" />
                                                    : <Lock className="w-5 h-5" />}
                                            </span>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-sm">{level.name}</h4>
                                                    {level.claimed && (
                                                        <GraffitiStar className="w-6 h-6 flex-shrink-0" delay={0.24} />
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
                                                                className="w-full rounded-xl px-3 py-2.5 text-[14px]
                                                                           bg-[hsl(140_26%_8%)] border border-[hsl(142_26%_15%)]
                                                                           text-foreground outline-none
                                                                           focus:border-primary/50"
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
