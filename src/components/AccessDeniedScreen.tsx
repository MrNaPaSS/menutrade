import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Layers, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GraffitiSpray } from '@/components/graffiti/Graffiti';
import { RegistrationGate } from './RegistrationGate';
import { useTelegram } from '@/hooks/useTelegram';

export type LockedFeature = 'обучение' | 'стратегии' | 'форум и live';

interface AccessDeniedScreenProps {
    feature: LockedFeature;
    onBack?: () => void;
}

/** Чем закрыт раздел и сколько в нём материала */
const PITCH: Record<LockedFeature, {
    icon: typeof GraduationCap;
    headline: string;
    stat: string;
    statLabel: string;
}> = {
    'обучение': {
        icon: GraduationCap,
        headline: 'Обучение закрыто',
        stat: '48',
        statLabel: 'уроков в трёх направлениях',
    },
    'стратегии': {
        icon: Layers,
        headline: 'Стратегии закрыты',
        stat: '4',
        statLabel: 'блока готовых торговых систем',
    },
    'форум и live': {
        icon: Radio,
        headline: 'Форум и live закрыты',
        stat: 'LIVE',
        statLabel: 'сессии и разборы с трейдером',
    },
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

    useEffect(() => {
        reportPaywallHit(userId, feature);
    }, [userId, feature]);

    // Регистрация внутри аппа: человек не уходит в бота, проходит все шаги здесь.
    // Когда админ подтвердит депозит - hasFullAccess обновится и страница откроется сама.
    if (showGate) {
        return <RegistrationGate onBack={() => setShowGate(false)} />;
    }

    const pitch = PITCH[feature];
    const Icon = pitch.icon;

    return (
        /* z выше окон (90) и нижней панели (50): экран открывается
           поверх раздела, из которого его позвали. Без z-index он
           оказывался под содержимым страницы, и нажатие на замок
           выглядело как ничего не делающее */
        <div className="fixed inset-0 z-[95] overflow-y-auto">
            {/* Подложка как у окон: фон за экраном гаснет и мутнеет.
                Раньше здесь рисовался второй набор фоновых слоёв
                поверх страницы, и они складывались друг с другом */}
            <div className="absolute inset-0 bg-black/72 backdrop-blur-[6px]" />

            <div
                className="relative z-10 w-full max-w-md mx-auto px-4 pb-10"
                /* Верхний отступ считает полосу кнопок Telegram: экран
                   открывается во весь рост, и без этого шапка уезжала
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
                        <div className="flex items-start gap-3.5">
                            <span
                                className="w-12 h-12 rounded-[15px] flex items-center justify-center flex-shrink-0
                                           border border-white/[0.07]"
                                style={{
                                    background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 12%))',
                                    color: 'hsl(142 76% 62%)',
                                }}
                            >
                                <Icon className="w-6 h-6" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <h2 className="font-display font-bold text-[20px] tracking-tight text-foreground">
                                    {pitch.headline}
                                </h2>
                                <p className="flex items-baseline gap-2 mt-2">
                                    <span className="font-mono font-bold text-[26px] tabular-nums leading-none"
                                        style={{ color: 'hsl(142 76% 58%)' }}>
                                        {pitch.stat}
                                    </span>
                                    <span className="text-[12px] text-muted-foreground">{pitch.statLabel}</span>
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => setShowGate(true)}
                            className="w-full h-12 font-semibold mt-5"
                        >
                            Открыть доступ
                        </Button>

                        {onBack && (
                            <Button onClick={onBack} variant="outline" className="w-full h-11 mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
