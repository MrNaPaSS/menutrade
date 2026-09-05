import { useCallback, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Check, Lock, RefreshCw, Sparkles, Wallet, X } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { Button } from '@/components/ui/button';
import { RegistrationGate } from '@/components/RegistrationGate';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/**
 * Профиль окном.
 *
 * Раньше профиль был отдельным экраном: нажатие на фото уводило со
 * страницы, и обратно приходилось возвращаться. Теперь он открывается
 * тем же окном, что обучение, стратегии и софт - человек остаётся там,
 * где был, и закрывает окно одним движением.
 *
 * Получение доступа - шаг внутри этого же окна, а не третий экран.
 */
export function ProfileModal({ open, onClose }: ProfileModalProps) {
    const { userId, verified, deposited, hasFullAccess, aiMessagesLeft, isLoading, fetchUserStatus } =
        useUserAccess();
    const { user } = useTelegram();
    const [showGate, setShowGate] = useState(false);

    const close = useCallback(() => {
        onClose();
        // Сбрасываем шаг после закрытия: следующий заход начинается с профиля
        setTimeout(() => setShowGate(false), 300);
    }, [onClose]);

    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Трейдер';

    if (showGate) {
        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={() => setShowGate(false)}
                title="Получить доступ"
                fullscreen
                bare
            >
                <div className="h-full overflow-y-auto">
                    <RegistrationGate />
                </div>
            </ModalWindow>
        );
    }

    return (
        <ModalWindow
            open={open}
            onClose={close}
            title="Профиль"
            subtitle={hasFullAccess ? 'Полный доступ открыт' : 'Доступ ограничен до подтверждения счёта'}
        >
            {/* Кто вы: фото, имя и ID одним блоком */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                className={cn(PANEL, 'p-3.5 flex items-center gap-3.5')}
                style={PANEL_BG}
            >
                <span className="w-14 h-14 rounded-full flex-shrink-0 p-[3px] overflow-hidden
                                 flex items-center justify-center
                                 bg-background/60 border border-border/30">
                    {user?.photo_url ? (
                        <img src={user.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="font-display font-bold text-primary text-lg">
                            {name[0]?.toUpperCase() ?? 'Т'}
                        </span>
                    )}
                </span>

                <div className="min-w-0">
                    <p className="font-semibold text-[15.5px] text-foreground truncate">{name}</p>
                    {user?.username && (
                        <p className="text-[12px] text-muted-foreground truncate">@{user.username}</p>
                    )}
                    <p className="text-[11.5px] text-muted-foreground font-mono tabular-nums mt-0.5">
                        ID {userId || '-'}
                    </p>
                </div>
            </motion.div>

            {/* Что подтверждено */}
            <div className={cn(PANEL, 'divide-y divide-[hsl(142_22%_13%)]')} style={PANEL_BG}>
                <TerminalRow
                    index={0}
                    icon={<BadgeCheck className="w-[18px] h-[18px]" />}
                    tone={verified ? 'green' : 'amber'}
                    title="Регистрация"
                    caption={verified ? 'Счёт привязан к академии' : 'Счёт ещё не привязан'}
                    value={verified ? 'есть' : 'нет'}
                    valueLive={verified}
                />
                <TerminalRow
                    index={1}
                    icon={<Wallet className="w-[18px] h-[18px]" />}
                    tone={deposited ? 'green' : 'amber'}
                    title="Депозит"
                    caption={deposited ? 'Подтверждён' : 'Не подтверждён'}
                    value={deposited ? 'есть' : 'нет'}
                    valueLive={deposited}
                />
                <TerminalRow
                    index={2}
                    icon={hasFullAccess
                        ? <Sparkles className="w-[18px] h-[18px]" />
                        : <Lock className="w-[18px] h-[18px]" />}
                    tone={hasFullAccess ? 'green' : 'muted'}
                    title="Доступ"
                    caption={hasFullAccess ? 'Открыты все разделы' : 'Открыта часть разделов'}
                    value={hasFullAccess ? 'полный' : 'частичный'}
                    valueLive={hasFullAccess}
                />
            </div>

            {/* Что доступно прямо сейчас */}
            <div className={cn(PANEL, 'p-3.5')} style={PANEL_BG}>
                <p className="text-[12px] text-muted-foreground mb-2.5">Доступно сейчас</p>
                <ul className="space-y-1.5">
                    <Item ok>
                        AI-агент {hasFullAccess ? 'без ограничений' : `- осталось вопросов: ${aiMessagesLeft}`}
                    </Item>
                    <Item ok={hasFullAccess}>Модули обучения</Item>
                    <Item ok={hasFullAccess}>Торговые стратегии</Item>
                </ul>
            </div>

            <div className="flex gap-2 pt-0.5">
                <Button
                    onClick={() => { void fetchUserStatus(); }}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                >
                    <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                    Обновить
                </Button>

                {!hasFullAccess && (
                    <Button className="flex-1" onClick={() => setShowGate(true)}>
                        Получить доступ
                    </Button>
                )}
            </div>

            {!hasFullAccess && (
                <p className="text-[11.5px] text-muted-foreground leading-relaxed px-1 pb-1">
                    Доступ открывается после регистрации на платформе и депозита. Подтверждение
                    приходит от бота - обычно в течение нескольких минут.
                </p>
            )}
        </ModalWindow>
    );
}

function Item({ ok, children }: { ok?: boolean; children: ReactNode }) {
    return (
        <li className="flex items-start gap-2 text-[13px]">
            {ok ? (
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            ) : (
                <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            )}
            <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{children}</span>
        </li>
    );
}
