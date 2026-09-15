import { useState } from 'react';
import { Award, BarChart3, CalendarDays, KeyRound, LineChart, ListOrdered, Notebook, PlugZap, WifiOff } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { Empty } from '@/components/trader-menu/trading/TradingPanels';
import { openLink } from '@/lib/tradingUi';
import { SummaryTab } from '@/components/trader-menu/trading/SummaryTab';
import { DaysTab } from '@/components/trader-menu/trading/DaysTab';
import { TradesTab } from '@/components/trader-menu/trading/TradesTab';
import { JournalTab } from '@/components/trader-menu/trading/JournalTab';
import { CertificateTab } from '@/components/trader-menu/trading/CertificateTab';
import { useTradingStats } from '@/hooks/useTradingStats';
import { useJournal } from '@/hooks/useJournal';
import { TRADING_WINDOWS } from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

interface TraderProfileModalProps {
    open: boolean;
    onClose: () => void;
}

type Tab = 'summary' | 'days' | 'trades' | 'journal' | 'cert';

const TABS = [
    ['summary', 'Итог', BarChart3],
    ['days', 'Дни', CalendarDays],
    ['trades', 'Сделки', ListOrdered],
    ['journal', 'Дневник', Notebook],
    ['cert', 'Сертификат', Award],
] as const;

/** На каких разделах числа считает терминал - там же выбирают окно. */
const TERMINAL_TABS: Tab[] = ['summary', 'days', 'trades'];

/**
 * Профиль трейдера.
 *
 * Один экран с разделами вместо списка ссылок на отдельные окна. Всё,
 * что человек про себя смотрит, лежит здесь: итог из терминала, дни,
 * сделки, собственный дневник и будущий сертификат. Раньше каждый из
 * них открывался своим окном, и чтобы сверить запись в дневнике с тем,
 * что показал терминал, нужно было выйти и зайти заново.
 *
 * Разделы, а не длинное полотно с прокруткой: на телефоне до нижней
 * трети такого полотна просто не доезжают.
 *
 * Считает цифры платформа - теми же формулами, что и раздел аналитики
 * в кабинете: одни и те же числа на двух экранах, иначе разный винрейт
 * читался бы как поломка.
 */
export function TraderProfileModal({ open, onClose }: TraderProfileModalProps) {
    const [tab, setTab] = useState<Tab>('summary');
    const { days, setDays, stats, loading, offline, reload } = useTradingStats(open);
    const { trades, add, remove } = useJournal(open);

    const close = () => {
        onClose();
        // Раздел сбрасываем после закрытия: следующий заход начинается с
        // итога, а не с того места, где вышли
        setTimeout(() => setTab('summary'), 300);
    };

    const cabinet = stats?.cabinetUrl ?? 'https://www.nmnh.trade/login';
    const ready = stats?.state === 'ok' ? stats : null;
    const showWindow = TERMINAL_TABS.includes(tab);

    /** Почему вместо цифр терминала нечего показать. null - всё в порядке. */
    const blocker = (() => {
        if (offline) {
            return (
                <Empty
                    icon={<WifiOff className="w-5 h-5" />}
                    title="Терминал не ответил"
                    text="Связи с платформой нет. Цифры целы, попробуйте ещё раз через минуту."
                    action="Повторить"
                    onAction={reload}
                />
            );
        }
        if (!stats) {
            return (
                <div
                    className="rounded-[18px] border border-[hsl(142_26%_15%)] p-5 text-center text-[13px] text-muted-foreground"
                    style={{ background: 'hsl(140 26% 8%)' }}
                >
                    Считаем вашу торговлю...
                </div>
            );
        }
        if (stats.state === 'no_account') {
            return (
                <Empty
                    icon={<LineChart className="w-5 h-5" />}
                    title="Торговли пока не видно"
                    text="Статистика собирается по сделкам через терминал NMNH. Откройте кабинет, подключите счёт биржи - и цифры появятся здесь сами."
                    action="Открыть кабинет"
                    onAction={() => openLink(cabinet)}
                />
            );
        }
        if (stats.state === 'no_keys') {
            return (
                <Empty
                    icon={<KeyRound className="w-5 h-5" />}
                    title="Счёт не подключён"
                    text="Терминал торгует через ключи вашей биржи. Подключите счёт в кабинете - и каждая сделка начнёт попадать сюда."
                    action="Подключить счёт"
                    onAction={() => openLink(cabinet)}
                />
            );
        }
        if (stats.state === 'no_trades') {
            return (
                <Empty
                    icon={<PlugZap className="w-5 h-5" />}
                    title={`За ${stats.days} дней сделок нет`}
                    text="Счёт подключён, но закрытых сделок в этом окне не было. Выберите период шире или откройте сделку в терминале."
                    action="Открыть терминал"
                    onAction={() => openLink(cabinet)}
                />
            );
        }
        return null;
    })();

    return (
        <ModalWindow
            open={open}
            onClose={close}
            title="Профиль трейдера"
            subtitle="Ваша торговля, дни и записи"
        >
            {/* Разделы строкой: пять помещаются на телефон, а при узком
                экране строка едет вбок - это привычнее, чем перенос на
                вторую строку, от которого прыгает высота */}
            <div className="flex gap-1.5 overflow-x-auto -mx-0.5 px-0.5 pb-0.5">
                {TABS.map(([id, label, Icon]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 h-9',
                            'text-[12px] font-semibold transition-colors',
                            tab === id
                                ? 'bg-primary/12 border-primary/35 text-primary'
                                : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground'
                        )}
                    >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {label}
                    </button>
                ))}
            </div>

            {showWindow && (
                <div className={cn('grid grid-cols-3 gap-2 transition-opacity', loading && 'opacity-60')}>
                    {TRADING_WINDOWS.map(window => (
                        <button
                            key={window}
                            onClick={() => setDays(window)}
                            className={cn(
                                'h-9 rounded-xl text-[12.5px] font-medium border transition-colors',
                                days === window
                                    ? 'bg-primary/12 border-primary/35 text-primary'
                                    : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground'
                            )}
                        >
                            {window} дней
                        </button>
                    ))}
                </div>
            )}

            {/* Итог и сделки без цифр терминала показывать нечего.
                Дни живут и на записях дневника, поэтому раздел открыт
                всегда, а пустой терминал он объясняет сам */}
            {tab === 'summary' && (blocker ?? <SummaryTab stats={ready!} />)}
            {tab === 'trades' && (blocker ?? <TradesTab stats={ready!} />)}
            {tab === 'days' && <DaysTab stats={ready} trades={trades} />}
            {tab === 'journal' && <JournalTab trades={trades} add={add} remove={remove} />}
            {tab === 'cert' && <CertificateTab stats={ready} />}
        </ModalWindow>
    );
}
