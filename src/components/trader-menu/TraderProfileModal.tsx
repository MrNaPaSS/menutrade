import { useState } from 'react';
import { Activity, Award, BookOpen, CalendarDays, Notebook } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { TradeJournalModal } from '@/components/trader-menu/TradeJournalModal';
import { TradingStatsModal } from '@/components/trader-menu/TradingStatsModal';

interface TraderProfileModalProps {
    open: boolean;
    onClose: () => void;
}

const PANEL_CLASS =
    'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/**
 * Профиль трейдера.
 *
 * Здесь живёт то, что человек ведёт сам: дневник сделок, календарь по
 * дням, статистика. Отдельно от разделов академии - там материал,
 * который мы дали, здесь записи, которые он накопил.
 *
 * Рядом с его записями - счёт из терминала: дневник ведут руками и по
 * памяти, а терминал знает каждую сделку точно. Два источника стоят
 * рядом не случайно, расхождение между ними человеку полезно видеть.
 *
 * Открывается кнопкой рядом с монетами: строкой в списке инструментов
 * профиль читался бы как ещё один справочник.
 */
type Step = 'menu' | 'journal' | 'stats';

export function TraderProfileModal({ open, onClose }: TraderProfileModalProps) {
    const [step, setStep] = useState<Step>('menu');

    // Шаг сбрасываем после закрытия: иначе следующий заход откроется
    // сразу на том разделе, из которого вышли
    const close = () => {
        onClose();
        setTimeout(() => setStep('menu'), 300);
    };

    if (step === 'journal') {
        return (
            <TradeJournalModal
                open={open}
                onBack={() => setStep('menu')}
                onClose={close}
            />
        );
    }

    if (step === 'stats') {
        return (
            <TradingStatsModal
                open={open}
                onBack={() => setStep('menu')}
                onClose={close}
            />
        );
    }

    return (
        <ModalWindow
            open={open}
            onClose={close}
            title="Профиль трейдера"
            subtitle="Ваши сделки, дни и статистика"
        >
            <div className={PANEL_CLASS} style={PANEL_BG}>
                <TerminalRow
                    index={0}
                    icon={<Activity className="w-[18px] h-[18px]" />}
                    tone="green"
                    title="Статистика терминала"
                    caption="Итог, винрейт и сделки из NMNH"
                    onClick={() => setStep('stats')}
                />
                <TerminalRow
                    index={1}
                    icon={<Notebook className="w-[18px] h-[18px]" />}
                    tone="cyan"
                    title="Дневник сделок"
                    caption="Записи, итог и доля прибыльных"
                    onClick={() => setStep('journal')}
                />
                <TerminalRow
                    index={2}
                    icon={<CalendarDays className="w-[18px] h-[18px]" />}
                    tone="cyan"
                    title="Календарь сделок"
                    caption="Итог по дням"
                    onClick={() => setStep('journal')}
                />
                <TerminalRow
                    index={3}
                    icon={<Award className="w-[18px] h-[18px]" />}
                    tone="violet"
                    title="Сертификат"
                    caption="Скоро: документ со статистикой за период"
                />
                <TerminalRow
                    index={4}
                    icon={<BookOpen className="w-[18px] h-[18px]" />}
                    tone="muted"
                    title="Чек-лист перед входом"
                    caption="Скоро"
                />
            </div>
        </ModalWindow>
    );
}
