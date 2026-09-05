import { useState } from 'react';
import { Award, BookOpen, CalendarDays, Notebook } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';
import { TradeJournalModal } from '@/components/trader-menu/TradeJournalModal';

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
 * Открывается кнопкой рядом с монетами: строкой в списке инструментов
 * профиль читался бы как ещё один справочник.
 */
export function TraderProfileModal({ open, onClose }: TraderProfileModalProps) {
    const [journalOpen, setJournalOpen] = useState(false);

    if (journalOpen) {
        return (
            <TradeJournalModal
                open={open}
                onBack={() => setJournalOpen(false)}
                onClose={() => {
                    onClose();
                    // Шаг сбрасываем после закрытия: иначе следующий заход
                    // откроется сразу на дневнике
                    setTimeout(() => setJournalOpen(false), 300);
                }}
            />
        );
    }

    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Профиль трейдера"
            subtitle="Ваши сделки, дни и статистика"
        >
            <div className={PANEL_CLASS} style={PANEL_BG}>
                <TerminalRow
                    index={0}
                    icon={<Notebook className="w-[18px] h-[18px]" />}
                    tone="green"
                    title="Дневник сделок"
                    caption="Записи, итог и доля прибыльных"
                    onClick={() => setJournalOpen(true)}
                />
                <TerminalRow
                    index={1}
                    icon={<CalendarDays className="w-[18px] h-[18px]" />}
                    tone="cyan"
                    title="Календарь сделок"
                    caption="Итог по дням"
                    onClick={() => setJournalOpen(true)}
                />
                <TerminalRow
                    index={2}
                    icon={<Award className="w-[18px] h-[18px]" />}
                    tone="violet"
                    title="Сертификат"
                    caption="Скоро: документ со статистикой за период"
                />
                <TerminalRow
                    index={3}
                    icon={<BookOpen className="w-[18px] h-[18px]" />}
                    tone="muted"
                    title="Чек-лист перед входом"
                    caption="Скоро"
                />
            </div>
        </ModalWindow>
    );
}
