import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MANAGER_URL = 'https://t.me/NMNH_MANAGER';

/**
 * Частые вопросы. Ответы описывают текущую схему: регистрация по нашей
 * ссылке, депозит, отправка ID в бот. Прежние про уровни PRO/MENTOR/ELITE
 * устарели вместе с самими уровнями.
 */
const FAQ = [
    {
        id: 'start',
        question: 'Как получить полный доступ?',
        answer: 'Открой «Торгуем здесь» внизу и выбери рынок.\n\n'
            + 'FOREX - Pocket Option от $20 с промокодом (+50% к депозиту) '
            + 'или FxPro от $101, классический форекс с MT4, MT5 и cTrader.\n\n'
            + 'CRYPTO - биржа WEEX от $100, фьючерсы и спот.\n\n'
            + 'Условие одно на любой площадке: зарегистрироваться по нашей ссылке, '
            + 'пополнить счёт и отправить ID аккаунта в бот. После проверки откроются '
            + 'живые сессии, разборы рынка и закрытый форум.',
    },
    {
        id: 'existing',
        question: 'У меня уже есть аккаунт на платформе',
        answer: 'Удалить и завести заново можно только на Pocket Option: Настройки - '
            + 'Удалить учётную запись, дальше регистрация по нашей ссылке.\n\n'
            + 'На FxPro и WEEX такой возможности нет - напиши в поддержку, привяжем '
            + 'существующий аккаунт вручную.',
    },
    {
        id: 'indicator',
        question: 'Как получить индикаторы и софт?',
        answer: 'Два пути.\n\n'
            + 'Подписка - оформляется через менеджера, напиши в поддержку.\n\n'
            + 'Бонусом за друзей - бесплатно. Раздел «Подарок» внизу: двое приглашённых '
            + 'дают BM Ultra и NMNH.VISION на неделю, пятеро - на месяц, десятеро - '
            + 'софт с менторством.',
    },
    {
        id: 'timing',
        question: 'Сколько идёт проверка?',
        answer: 'Обычно до 30 минут. Если прошло больше - напиши в поддержку, разберёмся вручную.',
    },
    {
        id: 'money',
        question: 'Депозит - это оплата за обучение?',
        answer: 'Нет. Деньги остаются на твоём торговом счёте, ты торгуешь ими сам и можешь вывести '
            + 'в любой момент. Академия ничего с депозита не удерживает.',
    },
];

const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

function openManager(): void {
    const tg = (window as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } })
        .Telegram?.WebApp;
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(MANAGER_URL);
    } else {
        window.open(MANAGER_URL, '_blank', 'noopener');
    }
}

interface SupportDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Поддержка.
 *
 * Окно, как и остальные разделы. Вопросы раскрываются на месте: ответы
 * короткие, и уводить ради каждого на отдельный шаг незачем - человек
 * потеряет список из виду.
 */
export function SupportDrawer({ open, onOpenChange }: SupportDrawerProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <ModalWindow
            open={open}
            onClose={() => onOpenChange(false)}
            title="Поддержка"
            subtitle="Ответы на частые вопросы - или напиши напрямую"
        >
            <Button className="w-full min-h-[44px]" onClick={openManager}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Написать в поддержку
            </Button>

            {FAQ.map(item => {
                const isOpen = openId === item.id;

                return (
                    <div
                        key={item.id}
                        className="rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden"
                        style={PANEL_BG}
                    >
                        <button
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left
                                       transition-colors hover:bg-white/[0.035]
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                                       focus-visible:ring-inset"
                        >
                            <span className="text-[14px] font-medium text-foreground">{item.question}</span>
                            <ChevronDown
                                className={cn(
                                    'w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-200',
                                    isOpen && 'rotate-180'
                                )}
                            />
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-4 pb-3.5 text-[12.5px] text-muted-foreground
                                                  leading-relaxed whitespace-pre-line">
                                        {item.answer}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </ModalWindow>
    );
}
