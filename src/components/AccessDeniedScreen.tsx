import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GraffitiSpray } from '@/components/graffiti/Graffiti';
import { RegistrationGate } from './RegistrationGate';
import { useTelegram } from '@/hooks/useTelegram';

export type LockedFeature = 'обучение' | 'стратегии' | 'форум и live' | 'профиль трейдера';

interface AccessDeniedScreenProps {
    feature: LockedFeature;
    onBack?: () => void;
}

/** Чем закрыт раздел и сколько в нём материала */
const PITCH: Record<LockedFeature, { subject: string; stat: string; statLabel: string }> = {
    'обучение': { subject: 'Обучение', stat: '73', statLabel: 'урока в трёх направлениях' },
    'стратегии': { subject: 'Стратегии', stat: '4', statLabel: 'блока готовых систем' },
    'форум и live': { subject: 'Форум и live', stat: 'LIVE', statLabel: 'сессии с трейдером' },
    'профиль трейдера': { subject: 'Профиль', stat: '3', statLabel: 'дневник, календарь и статистика' },
};

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
 * Через него идут лиды, поэтому на нём нет ничего лишнего: чем
 * закрыт раздел, сколько там материала и кнопка. Абзацы с описанием
 * человек на этом экране не читает - он уже нажал на замок и хочет
 * знать, что делать дальше.
 *
 * Цифра своя у каждого раздела: она отвечает на «а много ли там»
 * быстрее любого текста.
 */
export function AccessDeniedScreen({ feature, onBack }: AccessDeniedScreenProps) {
    const [showGate, setShowGate] = useState(false);
    const { userId } = useTelegram();
    const reduced = useReducedMotion();

    useEffect(() => {
        reportPaywallHit(userId, feature);
    }, [userId, feature]);

    // Регистрация внутри аппа: человек не уходит в бота, проходит все шаги здесь.
    // Когда админ подтвердит депозит - hasFullAccess обновится и страница откроется сама.
    if (showGate) {
        return <RegistrationGate onBack={() => setShowGate(false)} />;
    }

    const pitch = PITCH[feature];

    return (
        /* z выше окон (90) и нижней панели (50): экран открывается
           поверх раздела, из которого его позвали. Без z-index он
           оказывался под содержимым страницы, и нажатие на замок
           выглядело как ничего не делающее */
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            {/* Подложка как у окон: фон за экраном гаснет и мутнеет.
                Нажатие мимо закрывает - как везде */}
            <motion.div
                className="absolute inset-0 bg-black/72 backdrop-blur-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onBack}
            />

            <motion.div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-sm overflow-hidden rounded-[26px]
                           border border-[hsl(142_30%_20%)] px-5 pt-7 pb-5 text-center"
                style={{
                    background: 'linear-gradient(180deg, hsl(142 22% 12%) 0%, hsl(140 28% 6.5%) 100%)',
                    boxShadow: '0 30px 70px -30px hsl(0 0% 0%), inset 0 1px 0 hsl(142 50% 45% / 0.16)',
                }}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: reduced ? 0.15 : 0.34, ease: [0.23, 1, 0.32, 1] }}
            >
                <GraffitiSpray className="-top-10 left-1/2 -translate-x-1/2 w-64 h-40" opacity={0.08} />

                <div className="relative">
                    {/* Замок качается один раз на входе, а не в цикле:
                        повторяющееся движение на экране-отказе читается
                        как тревога */}
                    <motion.span
                        className="mx-auto w-16 h-16 rounded-[20px] flex items-center justify-center
                                   border border-white/[0.07]"
                        style={{
                            background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
                            color: 'hsl(142 76% 62%)',
                        }}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -18 }}
                        animate={{ opacity: 1, scale: 1, rotate: [-18, 8, -4, 0] }}
                        transition={{ delay: 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <Lock className="w-7 h-7" />
                    </motion.span>

                    <motion.h2
                        className="font-display font-bold text-[21px] tracking-tight text-foreground mt-4"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Упс, вы не участник академии
                    </motion.h2>

                    <motion.p
                        className="text-[13px] text-muted-foreground mt-2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <span className="text-foreground font-semibold">{pitch.subject}</span>
                        {' '}- {pitch.stat} {pitch.statLabel}
                    </motion.p>

                    <motion.div
                        className="space-y-2 mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <Button onClick={() => setShowGate(true)} className="w-full h-12 font-semibold">
                            Получить доступ
                        </Button>

                        {onBack && (
                            <Button onClick={onBack} variant="outline" className="w-full h-11">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад
                            </Button>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
