import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

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
        answer: 'Открой «Торгуем здесь» внизу, выбери площадку и зарегистрируйся по нашей ссылке. '
            + 'Пополни счёт и отправь ID аккаунта в бот - после проверки откроются живые сессии, '
            + 'разборы рынка и закрытый форум.',
    },
    {
        id: 'existing',
        question: 'У меня уже есть аккаунт на платформе',
        answer: 'Старый аккаунт к Академии не привяжется. Удали его через Настройки - Удалить '
            + 'учётную запись и зарегистрируйся заново по нашей ссылке.',
    },
    {
        id: 'indicator',
        question: 'Как получить индикатор BM Ultra?',
        answer: 'Индикатор и NMNH.VISION выдаются за приглашённых друзей. Открой раздел «Подарок» '
            + 'внизу: двое друзей дают неделю, пятеро - месяц, десятеро - софт с менторством.',
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

export function SupportDrawer({ open, onOpenChange }: SupportDrawerProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[70vh] border-primary/20 bg-background/95 backdrop-blur-xl">
                <div className="mx-auto flex h-full w-full max-w-md flex-col pb-6">
                    <DrawerHeader className="text-center">
                        <DrawerTitle className="font-display text-xl">Поддержка</DrawerTitle>
                        <DrawerDescription className="text-xs">
                            Ответы на частые вопросы - или напиши напрямую
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 pb-3">
                        <button
                            onClick={openManager}
                            className="w-full rounded-xl bg-primary text-primary-foreground font-medium
                                       py-3 flex items-center justify-center gap-2
                                       transition-transform duration-100 active:scale-[0.98]"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Написать в поддержку
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 space-y-2">
                        {FAQ.map((item) => {
                            const isOpen = openId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="glass-card rounded-xl border border-border/40 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenId(isOpen ? null : item.id)}
                                        aria-expanded={isOpen}
                                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                                    >
                                        <span className="text-sm font-medium">{item.question}</span>
                                        <ChevronDown
                                            className={`w-4 h-4 flex-shrink-0 text-muted-foreground
                                                        transition-transform duration-200
                                                        ${isOpen ? 'rotate-180' : ''}`}
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
                                                <p className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
