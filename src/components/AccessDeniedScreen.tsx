import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Bot, GraduationCap, Layers, Lock, Radio, ShieldCheck, Sparkles, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppBackground } from '@/components/AppBackground';
import { GraffitiSpray } from '@/components/graffiti/Graffiti';
import { RegistrationGate } from './RegistrationGate';
import { useTelegram } from '@/hooks/useTelegram';

export type LockedFeature = 'обучение' | 'стратегии' | 'форум и live';

interface AccessDeniedScreenProps {
    feature: LockedFeature;
    onBack?: () => void;
}

/**
 * Что человек увидит, когда откроет раздел.
 *
 * Названия захардкожены, а не берутся из реестра уроков намеренно:
 * реестр весит мегабайты, и тянуть его в экран-заглушку значит
 * замедлить именно тот экран, где человек решает, платить или уйти.
 * Список короткий и меняется редко.
 */
const PITCH: Record<LockedFeature, {
    icon: typeof GraduationCap;
    headline: string;
    lead: string;
    stat: string;
    statLabel: string;
    peek: string[];
}> = {
    'обучение': {
        icon: GraduationCap,
        headline: 'Обучение закрыто',
        lead: 'Три направления - бинарные опционы, форекс и крипта. Каждое от первой свечи до готовой торговой системы, с разбором и проверкой в конце модуля.',
        stat: '48',
        statLabel: 'уроков в трёх направлениях',
        peek: [
            'Как читать свечи и объём',
            'Уровни: где цена разворачивается',
            'Управление риском и размер позиции',
            'Психология: почему сливают в плюсовой стратегии',
        ],
    },
    'стратегии': {
        icon: Layers,
        headline: 'Стратегии закрыты',
        lead: 'Готовые торговые системы с точками входа, стопами и разбором сделок, а не пересказ учебника. Читать можно в любом порядке.',
        stat: '4',
        statLabel: 'блока разборов',
        peek: [
            'Стратегия «Уровни - это всё»',
            'Отбой от границы канала',
            'Стратегия «Ложный пробой»',
            'Точки входа для скальп-режима',
        ],
    },
    'форум и live': {
        icon: Radio,
        headline: 'Форум и live закрыты',
        lead: 'Живые сессии и разборы рынка вместе с автором: сделки в моменте, а не постфактум. Плюс закрытый форум, где разбирают ваши графики.',
        stat: 'LIVE',
        statLabel: 'сессии и разборы вместе с автором',
        peek: [
            'Разбор рынка перед сессией',
            'Сделки автора в моменте',
            'Разбор ваших графиков на форуме',
            'Ответы на вопросы по своей торговле',
        ],
    },
};

const PERKS = [
    { icon: Radio, tone: 'hsl(0 72% 62%)', text: 'Форум и live-торговля с автором' },
    { icon: GraduationCap, tone: 'hsl(142 76% 62%)', text: '48 уроков и все стратегии' },
    { icon: Bot, tone: 'hsl(178 70% 62%)', text: 'AI-наставник без ограничений' },
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
 * Через него идут лиды, поэтому он не просто сообщает об отказе, а
 * показывает, что внутри: настоящие названия уроков и разборов под
 * замками. Обещание «полный доступ ко всем функциям» ничего не значит,
 * а «Стратегия „Ложный пробой“» - значит.
 *
 * Текст свой у каждого раздела: человек упёрся в конкретную дверь, и
 * рассказывать ему надо про неё, а не про приложение вообще.
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
        <div className="fixed inset-0 overflow-y-auto">
            <AppBackground />

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
                                <p className="text-[12.5px] text-muted-foreground leading-relaxed mt-1.5">
                                    {pitch.lead}
                                </p>
                            </div>
                        </div>

                        {/* Что именно внутри: настоящие названия под замками.
                            Абстрактное «полный доступ» ничего не обещает,
                            а конкретный разбор - обещает */}
                        <div
                            className="rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden mt-5"
                            style={{ background: 'hsl(140 26% 8%)' }}
                        >
                            <div className="flex items-baseline gap-2 px-3.5 pt-3.5 pb-2">
                                <span className="font-mono font-bold text-[22px] tabular-nums leading-none"
                                    style={{ color: 'hsl(142 76% 58%)' }}>
                                    {pitch.stat}
                                </span>
                                <span className="text-[11.5px] text-muted-foreground">{pitch.statLabel}</span>
                            </div>

                            <div className="divide-y divide-[hsl(142_22%_13%)] border-t border-[hsl(142_22%_13%)]">
                                {pitch.peek.map((title, index) => (
                                    <motion.div
                                        key={title}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.12 + index * 0.06,
                                            duration: 0.24,
                                            ease: [0.23, 1, 0.32, 1],
                                        }}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5"
                                    >
                                        <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'hsl(142 18% 40%)' }} />
                                        <span className="text-[13px] text-muted-foreground truncate">{title}</span>
                                    </motion.div>
                                ))}
                                <div className="px-3.5 py-2.5 text-[12px]" style={{ color: 'hsl(142 30% 46%)' }}>
                                    и остальное после подтверждения счёта
                                </div>
                            </div>
                        </div>

                        {/* Что открывает доступ целиком - коротко, строкой */}
                        <div className="flex flex-col gap-2 mt-4">
                            {PERKS.map(perk => {
                                const PerkIcon = perk.icon;
                                return (
                                    <div key={perk.text} className="flex items-center gap-2.5 text-[12.5px]">
                                        <PerkIcon className="w-4 h-4 flex-shrink-0" style={{ color: perk.tone }} />
                                        <span className="text-foreground/90">{perk.text}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            onClick={() => setShowGate(true)}
                            className="w-full h-12 font-semibold mt-5"
                        >
                            Открыть доступ
                        </Button>

                        {/* Возражение снимаем прямо здесь: главный страх не
                            «дорого», а «у меня заберут деньги» */}
                        <div className="flex items-start gap-2 mt-3">
                            <Wallet className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(142 40% 50%)' }} />
                            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                                Депозит от $20 остаётся на вашем торговом счёте - вы торгуете им сами и
                                выводите когда захотите. Академия с него ничего не удерживает.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground mt-3">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'hsl(142 40% 50%)' }} />
                                Без подписок
                            </span>
                            <span className="flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" style={{ color: 'hsl(142 40% 50%)' }} />
                                Около 5 минут
                            </span>
                        </div>

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
