import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { COIN_EVENT } from '@/lib/coins';

interface Grant {
    id: number;
    amount: number;
    label: string;
}

const LABELS: Record<string, string> = {
    lesson_watched: 'за урок',
    module_completed: 'за модуль',
    test_passed: 'за тест',
    course_completed: 'за курс',
    academy_joined: 'за вход в академию',
};

/**
 * Всплывающая подсказка о начислении монет.
 *
 * Монтируется один раз рядом с приложением и слушает событие, которое
 * шлёт lib/coins после подтверждения от бота. Так подсказка появляется
 * везде, где начисляют, и её не нужно вставлять в каждый экран.
 */
export function CoinToast() {
    const [grants, setGrants] = useState<Grant[]>([]);

    useEffect(() => {
        let counter = 0;

        const onGrant = (e: Event) => {
            const detail = (e as CustomEvent).detail as { amount: number; reason: string };
            if (!detail?.amount) return;

            const id = ++counter;
            setGrants(prev => [...prev, {
                id,
                amount: detail.amount,
                label: LABELS[detail.reason] || 'монет',
            }]);

            // Подсказка живёт недолго: это подтверждение, а не сообщение
            setTimeout(() => {
                setGrants(prev => prev.filter(g => g.id !== id));
            }, 2600);
        };

        window.addEventListener(COIN_EVENT, onGrant);
        return () => window.removeEventListener(COIN_EVENT, onGrant);
    }, []);

    return (
        <div className="fixed inset-x-0 z-[80] flex flex-col items-center gap-2 pointer-events-none
                        top-[calc(var(--tg-content-top,3rem)+0.5rem)]">
            <AnimatePresence>
                {grants.map(grant => (
                    <motion.div
                        key={grant.id}
                        initial={{ opacity: 0, y: -12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="flex items-center gap-2 rounded-full px-4 py-2
                                   bg-background/90 backdrop-blur-md
                                   border border-primary/40 shadow-lg"
                    >
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="font-display font-bold text-sm text-primary tabular-nums">
                            +{grant.amount}
                        </span>
                        <span className="text-xs text-muted-foreground">{grant.label}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
