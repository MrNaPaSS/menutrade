import { useState } from 'react';
import {
    Award, BarChart3, CalendarDays, KeyRound, LineChart, ListOrdered, Notebook, PlugZap, WifiOff,
} from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow, type RowTone } from '@/components/trader-menu/TerminalRow';
import { Empty } from '@/components/trader-menu/trading/TradingPanels';
import { SummaryTab } from '@/components/trader-menu/trading/SummaryTab';
import { DaysTab } from '@/components/trader-menu/trading/DaysTab';
import { TradesTab } from '@/components/trader-menu/trading/TradesTab';
import { JournalTab } from '@/components/trader-menu/trading/JournalTab';
import { CertificateTab } from '@/components/trader-menu/trading/CertificateTab';
import { useTradingStats } from '@/hooks/useTradingStats';
import { useJournal } from '@/hooks/useJournal';
import { openLink, PANEL, PANEL_BG, LIST } from '@/lib/tradingUi';
import { money, pnlColor, tradeWord, TRADING_WINDOWS } from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

interface TraderProfileModalProps {
    open: boolean;
    onClose: () => void;
}

type Section = 'summary' | 'days' | 'trades' | 'journal' | 'cert';
type Step = 'menu' | Section;

interface SectionMeta {
    id: Section;
    icon: typeof BarChart3;
    tone: RowTone;
    /** Название в списке и в шапке открытого раздела */
    title: string;
    /** Подпись в списке: что внутри */
    caption: string;
    /** Строка под названием, когда раздел открыт */
    subtitle: string;
}

const SECTIONS: SectionMeta[] = [
    {
        id: 'summary',
        icon: BarChart3,
        tone: 'green',
        title: 'Итог торговли',
        caption: 'Заработок, винрейт и качество сделок',
        subtitle: 'Ваши сделки через терминал NMNH',
    },
    {
        id: 'days',
        icon: CalendarDays,
        tone: 'cyan',
        title: 'Дни',
        caption: 'Ритм по дням: терминал и дневник',
        subtitle: 'Итог каждого дня, а не отдельной сделки',
    },
    {
        id: 'trades',
        icon: ListOrdered,
        tone: 'cyan',
        title: 'Сделки',
        caption: 'Биржи, пары и последние сделки',
        subtitle: 'Где и чем вы торгуете',
    },
    {
        id: 'journal',
        icon: Notebook,
        tone: 'amber',
        title: 'Дневник сделок',
        caption: 'Ваши записи и почему вошли',
        subtitle: 'То, что вы ведёте сами',
    },
    {
        id: 'cert',
        icon: Award,
        tone: 'violet',
        title: 'Сертификат',
        caption: 'Документ со статистикой за период',
        subtitle: 'Что в него попадёт',
    },
];

/** Разделы, где числа считает терминал: там же выбирают окно. */
const TERMINAL_SECTIONS: Step[] = ['summary', 'days', 'trades'];

/**
 * Профиль трейдера.
 *
 * Список разделов, каждый открывается шагом внутри того же окна: итог
 * из терминала, дни, сделки, собственный дневник и будущий сертификат.
 *
 * Списком, а не одним полотном и не вкладками: по списку сразу видно,
 * что вообще есть внутри, а на телефоне длинная страница прячет нижнюю
 * половину за прокруткой.
 *
 * Цифры считает платформа - теми же формулами, что и раздел аналитики
 * в кабинете: одни и те же числа на двух экранах, иначе разный винрейт
 * читался бы как поломка.
 */
export function TraderProfileModal({ open, onClose }: TraderProfileModalProps) {
    const [step, setStep] = useState<Step>('menu');
    const { days, setDays, stats, loading, offline, reload } = useTradingStats(open);
    const { trades, add, remove } = useJournal(open);

    const close = () => {
        onClose();
        // Шаг сбрасываем после закрытия: следующий заход начинается со
        // списка, а не с того раздела, из которого вышли
        setTimeout(() => setStep('menu'), 300);
    };

    const cabinet = stats?.cabinetUrl ?? 'https://www.nmnh.trade/login';
    const ready = stats?.state === 'ok' ? stats : null;

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
                    className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')}
                    style={PANEL_BG}
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

    /* ── Открытый раздел ─────────────────────────────────────────── */
    if (step !== 'menu') {
        const meta = SECTIONS.find(section => section.id === step)!;

        return (
            <ModalWindow
                open={open}
                onClose={close}
                onBack={() => setStep('menu')}
                title={meta.title}
                subtitle={meta.subtitle}
            >
                {TERMINAL_SECTIONS.includes(step) && (
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
                    Дни живут и на записях дневника, поэтому раздел
                    открыт всегда, а пустой терминал он объясняет сам */}
                {step === 'summary' && (blocker ?? <SummaryTab stats={ready!} />)}
                {step === 'trades' && (blocker ?? <TradesTab stats={ready!} />)}
                {step === 'days' && <DaysTab stats={ready} trades={trades} />}
                {step === 'journal' && <JournalTab trades={trades} add={add} remove={remove} />}
                {step === 'cert' && <CertificateTab stats={ready} />}
            </ModalWindow>
        );
    }

    /* ── Список разделов ─────────────────────────────────────────── */

    /** Число справа в строке: список не только ведёт, но и рассказывает. */
    const valueOf = (id: Section): string | undefined => {
        if (id === 'summary') return ready ? money(ready.summary.net) : undefined;
        if (id === 'days') return ready && ready.byDay.length > 0 ? String(ready.byDay.length) : undefined;
        if (id === 'trades') return ready && ready.summary.trades > 0 ? String(ready.summary.trades) : undefined;
        if (id === 'journal') return trades && trades.length > 0 ? String(trades.length) : undefined;
        return undefined;
    };

    return (
        <ModalWindow
            open={open}
            onClose={close}
            title="Профиль трейдера"
            subtitle="Ваша торговля, дни и записи"
        >
            {/* Итог сразу над списком: ради этого числа профиль и
                открывают, и ради него не стоит заходить в раздел */}
            {ready && (
                <div
                    className="rounded-[20px] border border-[hsl(142_34%_22%)] px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: 'linear-gradient(168deg, hsl(142 26% 12%), hsl(140 28% 8%))' }}
                >
                    <div className="min-w-0">
                        <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                            Итог за {ready.days} дней
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1 tabular-nums truncate">
                            {ready.summary.trades} {tradeWord(ready.summary.trades)} через терминал
                        </p>
                    </div>
                    <span
                        className="font-mono font-bold text-[19px] tabular-nums whitespace-nowrap flex-shrink-0"
                        style={{ color: pnlColor(ready.summary.net) }}
                    >
                        {money(ready.summary.net)}
                    </span>
                </div>
            )}

            <div className={LIST} style={PANEL_BG}>
                {SECTIONS.map((section, index) => (
                    <TerminalRow
                        key={section.id}
                        index={index}
                        icon={<section.icon className="w-[18px] h-[18px]" />}
                        tone={section.tone}
                        title={section.title}
                        caption={section.caption}
                        value={valueOf(section.id)}
                        valueLive={section.id === 'summary'}
                        badge={section.id === 'cert' ? { text: 'Скоро', tone: 'sky' } : undefined}
                        onClick={() => setStep(section.id)}
                    />
                ))}
            </div>
        </ModalWindow>
    );
}
