import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, GraduationCap, Lock, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppBackground } from '@/components/AppBackground';
import { GraffitiSpray } from '@/components/graffiti/Graffiti';
import { RegistrationGate } from './RegistrationGate';
import { useTelegram } from '@/hooks/useTelegram';

interface AccessDeniedScreenProps {
    feature: 'обучение' | 'стратегии' | 'форум и live';
    onBack?: () => void;
}

const PERKS = [
    {
        icon: Radio,
        tone: 'hsl(0 72% 62%)',
        title: 'Форум с live-торговлей',
        caption: 'Разборы рынка и сделки вместе с автором',
    },
    {
        icon: GraduationCap,
        tone: 'hsl(142 76% 62%)',
        title: '48 уроков и все стратегии',
        caption: 'От свечей до готовых торговых систем',
    },
    {
        icon: Bot,
        tone: 'hsl(178 70% 62%)',
        title: 'Безлимитный AI-наставник',
        caption: 'Ответы на вопросы круглые сутки',
    },
];

function getBotApiBase(): string {
    return import.meta.env.DEV
        ? '/bot-api'
        : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
}

// Сообщаем боту, что человек упёрся в замок - на этом строится цепочка дожима.
// Fire-and-forget: неудача запроса не должна ломать экран.
function reportPaywallHit(userId: string | null, feature: string): void {
    if (!userId) return;
    fetch(`${getBotApiBase()}/hit-paywall`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ userId, feature }),
    }).catch(() => { /* аналитика не критична */ });
}

/**
 * Экран закрытого раздела.
 *
 * Та же поверхность, что у окон приложения: тёмный градиент, мягкая
 * рамка, спрей за заголовком. Раньше здесь были матовое стекло со
 * свечением по контуру, оранжевый замок в кружке и синяя плашка с
 * подсказкой - три чужих цвета на одном экране.
 *
 * Подсказка убрана: она повторяла строку про регистрацию и депозит,
 * стоявшую двумя абзацами выше.
 */
export function AccessDeniedScreen({ feature, onBack }: AccessDeniedScreenProps) {
    const [showGate, setShowGate] = useState(false);
    const { userId } = useTelegram();

    useEffect(() => {
        reportPaywallHit(userId, feature);
    }, [userId, feature]);

    // Регистрация внутри аппа: человек не уходит в бота, проходит все шаги здесь.
    // Когда админ подтвердит депозит - hasFullAccess обновится и страница откроется сама.
    if (showGate) {
        return <RegistrationGate onBack={() => setShowGate(false)} />;
    }

    return (
        <div className="fixed inset-0 overflow-y-auto">
            <AppBackground />

            <div
                className="relative z-10 w-full max-w-md mx-auto px-4 pb-10"
                /* Верхний отступ считает полосу кнопок Telegram: экран
                   открывается во весь рост, и без этого замок уезжал
                   под «Закрыть» */
                style={{
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-content-top, 0px) + 24px)',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                    className="relative overflow-hidden rounded-[26px] border border-[hsl(142_30%_20%)] p-5 sm:p-6"
                    style={{
                        background: 'linear-gradient(180deg, hsl(142 22% 12%) 0%, hsl(140 28% 6.5%) 100%)',
                        boxShadow: '0 30px 70px -30px hsl(0 0% 0%), inset 0 1px 0 hsl(142 50% 45% / 0.16)',
                    }}
                >
                    <GraffitiSpray className="-top-8 -left-6 w-56 h-36" opacity={0.07} />

                    <div className="relative">
                        <span
                            className="w-14 h-14 rounded-[18px] flex items-center justify-center
                                       border border-white/[0.07]"
                            style={{
                                background: 'hsl(142 20% 12%)',
                                color: 'hsl(142 18% 52%)',
                            }}
                        >
                            <Lock className="w-6 h-6" />
                        </span>

                        <h2 className="font-display font-bold text-[22px] tracking-tight mt-4 text-foreground">
                            Доступ ограничен
                        </h2>
                        <p className="text-[13px] text-muted-foreground leading-relaxed mt-2">
                            Раздел <span className="text-foreground font-semibold">«{feature}»</span> открывается
                            вместе с полным доступом к академии.
                        </p>

                        <div
                            className="rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden mt-5
                                       divide-y divide-[hsl(142_22%_13%)]"
                            style={{ background: 'hsl(140 26% 8%)' }}
                        >
                            {PERKS.map((perk, index) => {
                                const Icon = perk.icon;

                                return (
                                    <motion.div
                                        key={perk.title}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.1 + index * 0.06,
                                            duration: 0.24,
                                            ease: [0.23, 1, 0.32, 1],
                                        }}
                                        className="flex items-center gap-3 px-3.5 py-3"
                                    >
                                        <span
                                            className="w-9 h-9 rounded-[11px] flex items-center justify-center
                                                       flex-shrink-0 border border-white/[0.07]"
                                            style={{
                                                background: 'linear-gradient(160deg, hsl(142 40% 16%), hsl(142 38% 11%))',
                                                color: perk.tone,
                                            }}
                                        >
                                            <Icon className="w-[18px] h-[18px]" />
                                        </span>

                                        <span className="min-w-0">
                                            <span className="block font-semibold text-[14.5px] tracking-[-0.01em] text-foreground">
                                                {perk.title}
                                            </span>
                                            <span className="block text-[11.5px] text-muted-foreground mt-0.5">
                                                {perk.caption}
                                            </span>
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-4">
                            Регистрация счёта и депозит от $20 - весь путь занимает около пяти минут.
                            Деньги остаются вашими: академия с депозита ничего не удерживает.
                        </p>

                        <div className="space-y-2 mt-5">
                            <Button
                                onClick={() => setShowGate(true)}
                                className="w-full h-12 font-semibold"
                            >
                                Получить полный доступ
                            </Button>

                            {onBack && (
                                <Button
                                    onClick={onBack}
                                    variant="outline"
                                    className="w-full h-11"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
