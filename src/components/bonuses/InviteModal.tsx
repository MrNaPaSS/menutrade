import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Gift, Lock, Share2, Users } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { ProgressRing } from '@/components/ProgressRing';
import { GraffitiStar } from '@/components/graffiti/Graffiti';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface RewardLevel {
    id: string;
    friends: number;
    days: number;
    name: string;
    description: string;
    claimed: boolean;
    reached: boolean;
}

export interface ReferralData {
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

interface InviteModalProps {
    open: boolean;
    onClose: () => void;
    data: ReferralData | null;
    loading: boolean;
    error: string | null;
    hasUser: boolean;
    onShare: (link: string) => void;
    onClaim: (bonusId: string, tradingview: string) => Promise<string | null>;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/**
 * Приглашение друзей отдельным окном.
 *
 * Раньше ссылка, счётчики и лестница наград жили одним свитком вместе
 * с календарём и заданиями - экран приходилось листать, чтобы найти
 * нужное. Здесь только то, что относится к друзьям.
 */
export function InviteModal({
    open, onClose, data, loading, error, hasUser, onShare, onClaim,
}: InviteModalProps) {
    const [copied, setCopied] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [tradingview, setTradingview] = useState('');
    const [sending, setSending] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);

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

    const submitClaim = async (bonusId: string) => {
        setSending(true);
        const message = await onClaim(bonusId, tradingview.trim());
        setSending(false);
        if (message) {
            setClaimError(message);
        } else {
            setClaimingId(null);
            setTradingview('');
        }
    };

    const target = data?.levels[data.levels.length - 1]?.friends ?? 10;
    const balance = data?.balance ?? data?.activated ?? 0;
    const progress = data ? Math.min(100, Math.round((balance / target) * 100)) : 0;

    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Пригласить друга"
            subtitle="Друг засчитывается после регистрации и депозита"
        >
            {loading && (
                <div className={cn(PANEL, 'p-6 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Загружаем данные...
                </div>
            )}

            {!loading && !hasUser && (
                <div className={cn(PANEL, 'p-6 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Откройте приложение из бота, чтобы увидеть свою ссылку
                </div>
            )}

            {!loading && error && (
                <div className={cn(PANEL, 'p-6 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    {error}
                </div>
            )}

            {data && (
                <>
                    <div className={cn(PANEL, 'p-4')} style={PANEL_BG}>
                        <div className="flex items-center gap-4">
                            <ProgressRing percent={progress}>
                                <span className="font-mono font-bold text-[17px] tabular-nums leading-none"
                                    style={{ color: 'hsl(142 76% 58%)' }}>
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
                    </div>

                    <div className={cn(PANEL, 'p-4')} style={PANEL_BG}>
                        <p className="text-[12px] text-muted-foreground mb-2">Ваша ссылка</p>
                        <p className="font-mono text-[11.5px] text-foreground/80 break-all mb-3">{data.link}</p>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 justify-center gap-2" onClick={copyLink}>
                                {copied
                                    ? <><Check className="w-4 h-4" /> Скопировано</>
                                    : <><Copy className="w-4 h-4" /> Копировать</>}
                            </Button>
                            <Button size="sm" className="flex-1 justify-center gap-2" onClick={() => onShare(data.link)}>
                                <Share2 className="w-4 h-4" /> Поделиться
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { value: data.clicks, label: 'Переходов' },
                            { value: data.activated, label: 'Верификаций' },
                        ].map(stat => (
                            <div key={stat.label} className={cn(PANEL, 'p-3.5 text-center')} style={PANEL_BG}>
                                <div className="font-mono font-bold text-[22px] tabular-nums leading-none"
                                    style={{ color: 'hsl(142 76% 58%)' }}>
                                    {stat.value}
                                </div>
                                <div className="text-[11.5px] text-muted-foreground mt-1.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <p className="text-[12px] text-muted-foreground px-1 pt-1">Награды</p>

                    {data.levels.map((level, index) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.06 + index * 0.05, duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
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
                                {level.reached ? <Gift className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </span>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-[14.5px] text-foreground">{level.name}</h4>
                                    {level.claimed && <GraffitiStar className="w-6 h-6 flex-shrink-0" delay={0.2} />}
                                </div>
                                <p className="text-[12px] text-muted-foreground mt-0.5">{level.description}</p>
                                <p className="text-[11.5px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                    <Users className="w-3 h-3" />
                                    {level.friends} друзей
                                </p>

                                {level.reached && !level.claimed && !data.pending_request && (
                                    claimingId === level.id ? (
                                        <div className="mt-3 space-y-2">
                                            <input
                                                type="text"
                                                value={tradingview}
                                                onChange={(e) => {
                                                    setTradingview(e.target.value);
                                                    if (claimError) setClaimError(null);
                                                }}
                                                placeholder="Ник в TradingView"
                                                autoFocus
                                                className="w-full rounded-xl px-3 py-2.5 text-[14px]
                                                           bg-[hsl(140_26%_8%)] border border-[hsl(142_26%_15%)]
                                                           text-foreground outline-none focus:border-primary/50"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 justify-center"
                                                    disabled={sending || !tradingview.trim()}
                                                    onClick={() => submitClaim(level.id)}
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
                                    <p className="text-[12px] text-destructive mt-2">{claimError}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {data.pending_request && (
                        <p className="text-[12px] text-muted-foreground text-center pt-1 pb-1">
                            Заявка на награду отправлена - ждём подтверждения
                        </p>
                    )}
                </>
            )}
        </ModalWindow>
    );
}
