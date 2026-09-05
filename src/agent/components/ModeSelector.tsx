import { BarChart3, Bitcoin, CandlestickChart, GraduationCap, LineChart, Wand2 } from 'lucide-react';
import { AIMode } from '@/agent/config/prompts';
import { MARKETS, MARKET_META, type MarketChoice } from '@/agent/config/markets';
import { ModalWindow } from '@/components/ui/modal-window';
import { TerminalRow } from '@/components/trader-menu/TerminalRow';

interface ModeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: AIMode;
    onSelectMode: (mode: AIMode) => void;
    currentMarket: MarketChoice;
    onSelectMarket: (market: MarketChoice) => void;
}

/** Порядок в списке: сперва «определи сам», дальше рынки как в академии */
const MARKET_CHOICES: { value: MarketChoice; label: string; hint: string }[] = [
    { value: 'auto', label: 'Определить сам', hint: 'По вопросу и графику' },
    ...MARKETS.map(market => ({
        value: market as MarketChoice,
        label: MARKET_META[market].label,
        hint: MARKET_META[market].hint,
    })),
];

/* Значок рынка - из набора: в данных о рынках его нет, а заводить
   ради двух мест отдельное поле незачем */
const MARKET_ICON: Record<string, JSX.Element> = {
    auto: <Wand2 className="w-[18px] h-[18px]" />,
    binary: <CandlestickChart className="w-[18px] h-[18px]" />,
    forex: <LineChart className="w-[18px] h-[18px]" />,
    crypto: <Bitcoin className="w-[18px] h-[18px]" />,
};

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/**
 * Выбор режима и рынка.
 *
 * Окно посреди экрана, как обучение и стратегии, а не выпадающий
 * список от кнопки. Список цеплялся к краю шапки и на телефоне
 * упирался в границу экрана; окно ведёт себя одинаково везде, и человек
 * узнаёт движение, а не разгадывает его заново.
 */
export function ModeSelector({
    isOpen,
    onClose,
    currentMode,
    onSelectMode,
    currentMarket,
    onSelectMarket,
}: ModeSelectorProps) {
    const choose = (mode: AIMode) => {
        onSelectMode(mode);
        onClose();
    };

    return (
        <ModalWindow
            open={isOpen}
            onClose={onClose}
            title="Режим и рынок"
            subtitle="От рынка зависит вердикт и расчёт риска: сигнал один, а сделка разная"
        >
            <div className={PANEL} style={PANEL_BG}>
                <TerminalRow
                    index={0}
                    icon={<GraduationCap className="w-[18px] h-[18px]" />}
                    tone={currentMode === 'teacher' ? 'green' : 'muted'}
                    title="AI Ментор"
                    caption="Обучение, уроки и проверка заданий"
                    value={currentMode === 'teacher' ? 'сейчас' : undefined}
                    valueLive={currentMode === 'teacher'}
                    onClick={() => choose('teacher')}
                />
                <TerminalRow
                    index={1}
                    icon={<BarChart3 className="w-[18px] h-[18px]" />}
                    tone={currentMode === 'analyst' ? 'cyan' : 'muted'}
                    title="AI Аналитик"
                    caption="Сигналы, разбор графиков и трендов"
                    value={currentMode === 'analyst' ? 'сейчас' : undefined}
                    valueLive={currentMode === 'analyst'}
                    onClick={() => choose('analyst')}
                />
            </div>

            <div className={PANEL} style={PANEL_BG}>
                {MARKET_CHOICES.map((choice, index) => (
                    <TerminalRow
                        key={choice.value}
                        index={index + 2}
                        icon={MARKET_ICON[choice.value]}
                        tone={currentMarket === choice.value ? 'violet' : 'muted'}
                        title={choice.label}
                        caption={choice.hint}
                        value={currentMarket === choice.value ? 'сейчас' : undefined}
                        valueLive={currentMarket === choice.value}
                        onClick={() => {
                            onSelectMarket(choice.value);
                            onClose();
                        }}
                    />
                ))}
            </div>
        </ModalWindow>
    );
}
