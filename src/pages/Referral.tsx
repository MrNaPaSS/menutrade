import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Target, UserPlus } from 'lucide-react';
import { AppBackground } from '@/components/AppBackground';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useCoinBalance } from '@/hooks/useCoinBalance';
import { useCountUp } from '@/hooks/useCountUp';
import { DailyCalendar } from '@/components/DailyCalendar';
import { PartnerQuests } from '@/components/PartnerQuests';
import { InviteModal, type ReferralData } from '@/components/bonuses/InviteModal';
import { GraffitiSpray, GraffitiStar } from '@/components/graffiti/Graffiti';
import { fetchQuests, type PartnerQuest } from '@/lib/quests';

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;
const PANEL_CLASS =
    'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';

function getBotApiBase(): string {
    return import.meta.env.DEV
        ? '/bot-api'
        : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

/**
 * Приглашение, которое уйдёт другу.
 *
 * Ссылка идёт в поле url - так Telegram делает её кликабельной и
 * подтягивает карточку бота. В тексте её нет: там она печаталась бы
 * вторым адресом подряд.
 *
 * Слово-ссылку «NMNH» здесь получить нельзя: окно «поделиться»
 * принимает только простой текст. Так умеет лишь сообщение от бота, но
 * тогда нажатие перестанет сразу открывать список чатов.
 */
const SHARE_TEXT = [
    'NMNH - Академия здравого трейдинга',
    '',
    'Живые сессии, разборы рынка и закрытый форум трейдеров.',
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
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}`
        + `&text=${encodeURIComponent(SHARE_TEXT)}`;
    const tg = (window as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } })
        .Telegram?.WebApp;
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

type Section = 'invite' | 'quests';

/**
 * Бонусы.
 *
 * Раздел собран как меню трейдера: короткий экран со строками, каждая
 * открывается своим окном. Раньше подарок за день, задания за
 * партнёрок и вся лестница наград за друзей лежали одним свитком - до
 * нужного приходилось листать, и ни одно из трёх не было видно целиком.
 *
 * В строках стоят живые числа: серия дней, монеты за незакрытые
 * задания, число верификаций. По ним видно, где сейчас есть что взять,
 * не открывая ни одного окна.
 */
const Referral = () => {
    const { userId } = useUserAccess();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [quests, setQuests] = useState<PartnerQuest[] | null>(null);

    // Монеты NMNH. Хук слушает начисления, поэтому число растёт сразу
    // после того, как забрали подарок, - раньше оно ждало, пока человек
    // уйдёт с экрана и вернётся
    const { coins } = useCoinBalance();
    const shownCoins = useCountUp(coins?.balance ?? 0);

    useEffect(() => {
        let cancelled = false;
        fetchQuests().then(list => {
            if (!cancelled) setQuests(list);
        });
        return () => { cancelled = true; };
    }, []);

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

    /** Отправляет заявку на награду. Дальше её подтверждает админ в боте. */
    const claimBonus = useCallback(async (bonusId: string, tradingview: string): Promise<string | null> => {
        if (!userId) return 'Откройте приложение из бота';
        try {
            const res = await fetch(`${getBotApiBase()}/claim-bonus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ userId, bonusId, tradingview }),
            });
            const json = await res.json();
            if (json.success) {
                setData(prev => (prev ? { ...prev, pending_request: true } : prev));
                return null;
            }
            return json.error || 'Не удалось отправить заявку';
        } catch {
            return 'Нет связи с ботом';
        }
    }, [userId]);

    const questsLeft = quests?.filter(q => !q.done).reduce((sum, q) => sum + q.coins, 0) ?? 0;
    const questsDone = quests?.filter(q => q.done).length ?? 0;

    return (
        <div className="min-h-[100dvh] scanline pb-24">
            <AppBackground />

            <div className="relative z-10">
                <main
                    className="px-4 sm:px-5 pb-24 flex justify-center"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}
                >
                    <div className="max-w-lg w-full mx-auto">
                        {/* Название в полосе кнопок Telegram, как в чате
                            агента: середина полосы пустует, и подпись
                            занимает её, не отнимая высоты у содержимого.
                            Отступ --tg-content-top здесь намеренно не
                            применяется - иначе название опустится под
                            кнопки */}
                        <div
                            className="fixed inset-x-0 px-3 flex justify-center z-30 pointer-events-none"
                            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 9px)' }}
                        >
                            <span className="ml-[34px] font-display font-bold text-[19px] tracking-tight
                                             neon-text-subtle">
                                Бонусы
                            </span>
                        </div>

                        <div className="relative mb-4 text-center">
                            <GraffitiSpray className="-top-10 left-1/2 -translate-x-1/2 w-56 h-32" opacity={0.08} />
                            <p className="relative text-[12.5px] text-muted-foreground">
                                Монеты за учёбу, серию дней, задания и друзей
                            </p>
                        </div>

                        {/* Баланс - валюта всего раздела, поэтому стоит первым
                            и целиком, а не строкой в списке */}
                        {coins && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                className={`${PANEL} p-4 mb-3`}
                                style={PANEL_BG}
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
                                        {/* Счётчик набегает: так видно, что число
                                            живое, а не нарисовано на картинке */}
                                        <p
                                            className="font-mono font-bold text-[26px] leading-none tabular-nums mt-1"
                                            style={{ color: 'hsl(142 76% 58%)' }}
                                        >
                                            {shownCoins}
                                        </p>
                                    </div>

                                    <GraffitiStar className="w-10 h-10 flex-shrink-0" delay={0.2} />
                                </div>

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

                        {/* Календарь стоит на самой странице, а не за
                            строкой: подарок забирают каждый день, и прятать
                            за нажатием то, ради чего сюда заходят, незачем */}
                        <div className="mb-3">
                            <DailyCalendar />
                        </div>

                        <div className={PANEL_CLASS} style={PANEL_BG}>
                            <TerminalRow
                                index={0}
                                icon={<Target className="w-[18px] h-[18px]" />}
                                tone="violet"
                                title="Задания"
                                caption={questsLeft > 0
                                    ? `Не закрыто монет: ${questsLeft}`
                                    : 'Все задания закрыты'}
                                value={quests ? `${questsDone}/${quests.length}` : undefined}
                                valueLive={questsLeft > 0}
                                onClick={() => setSection('quests')}
                            />
                            <TerminalRow
                                index={1}
                                icon={<UserPlus className="w-[18px] h-[18px]" />}
                                tone="cyan"
                                title="Пригласить друга"
                                caption={data?.remaining
                                    ? `До награды осталось привести: ${data.remaining}`
                                    : 'Ссылка, награды и статистика'}
                                value={data ? String(data.activated) : undefined}
                                valueLive={Boolean(data?.activated)}
                                onClick={() => setSection('invite')}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <ModalWindow
                open={section === 'quests'}
                onClose={() => setSection(null)}
                title="Задания"
                subtitle="Каждая площадка приносит монеты один раз"
            >
                <PartnerQuests />
            </ModalWindow>

            <InviteModal
                open={section === 'invite'}
                onClose={() => setSection(null)}
                data={data}
                loading={loading}
                error={error}
                hasUser={Boolean(userId)}
                onShare={shareLink}
                onClaim={claimBonus}
            />

            <BottomNav />
        </div>
    );
};

export default Referral;
