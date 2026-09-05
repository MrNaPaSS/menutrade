import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { calcTrade, formatNumber, parseAmount, type StopMode } from '@/lib/positionSize';
import { cn } from '@/lib/utils';

interface PositionCalculatorProps {
    open: boolean;
    onClose: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/** Поле ввода числа: одна разметка на все поля калькулятора */
function Field({
    label, value, onChange, suffix, hint, placeholder, optional = false,
}: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    suffix?: string;
    hint?: string;
    placeholder?: string;
    optional?: boolean;
}) {
    return (
        <label className="block">
            <span className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-[12px] text-muted-foreground">{label}</span>
                {optional && <span className="text-[10.5px] text-muted-foreground/60">можно позже</span>}
            </span>
            <span className="relative block">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    // Цифровая клавиатура: тут везде числа, а буквенная
                    // раскладка добавляет лишнее движение на каждое поле
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={placeholder}
                    className={cn(
                        'w-full h-11 rounded-xl px-3 text-[15px] font-mono tabular-nums',
                        'bg-[hsl(140_26%_8%)] border border-[hsl(142_26%_15%)] text-foreground',
                        'outline-none focus:border-primary/50 transition-colors',
                        suffix && 'pr-12'
                    )}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                        {suffix}
                    </span>
                )}
            </span>
            {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
        </label>
    );
}

/** Строка результата: подпись слева, число справа */
function Row({
    label, value, accent = false, tone,
}: {
    label: string;
    value: string;
    accent?: boolean;
    tone?: string;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-[12.5px] text-muted-foreground">{label}</span>
            <span
                className={cn(
                    'font-mono tabular-nums flex-shrink-0',
                    accent ? 'font-bold text-[19px]' : 'text-[14px]'
                )}
                style={{ color: tone ?? (accent ? 'hsl(142 76% 58%)' : 'hsl(var(--foreground))') }}
            >
                {value}
            </span>
        </div>
    );
}

const MODES: Array<{ id: StopMode; label: string }> = [
    { id: 'prices', label: 'Ценами' },
    { id: 'percent', label: 'В процентах' },
];

/**
 * Калькулятор сделки.
 *
 * Считает столько, на сколько хватает введённого. Депозит и процент
 * риска дают главную цифру сразу - сколько денег теряем на стопе; для
 * бинарных опционов это и есть ответ, там риск равен ставке.
 * Расстояние до стопа добавляет объём, цена входа - количество и
 * ликвидацию, цель - прибыль и отношение к риску.
 *
 * Стоп задаётся ценами с графика или процентом от входа: одни срисовывают
 * уровни, другие считают риск в голове, и заставлять вторых выдумывать
 * цены - значит сделать калькулятор бесполезным для них.
 *
 * Считает от риска, а не от желаемого объёма. Обратный счёт - «возьму
 * на весь депозит с плечом, стоп поставлю где-нибудь» - и есть то, что
 * приводит к сливу.
 */
export function PositionCalculator({ open, onClose }: PositionCalculatorProps) {
    const [mode, setMode] = useState<StopMode>('prices');

    const [deposit, setDeposit] = useState('1000');
    const [risk, setRisk] = useState('2');
    const [entry, setEntry] = useState('');
    const [stop, setStop] = useState('');
    const [target, setTarget] = useState('');
    const [stopPercent, setStopPercent] = useState('');
    const [targetPercent, setTargetPercent] = useState('');
    const [leverage, setLeverage] = useState('');

    const result = useMemo(() => calcTrade({
        deposit: parseAmount(deposit),
        riskPercent: parseAmount(risk),
        mode,
        entry: parseAmount(entry),
        stop: parseAmount(stop),
        target: parseAmount(target),
        stopPercent: parseAmount(stopPercent),
        targetPercent: parseAmount(targetPercent),
        leverage: parseAmount(leverage),
    }), [deposit, risk, mode, entry, stop, target, stopPercent, targetPercent, leverage]);

    const riskPercent = parseAmount(risk);
    const lev = parseAmount(leverage);
    const riskTooHigh = riskPercent > 5;
    const poorRatio = result !== null && result.riskReward > 0 && result.riskReward < 1;

    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Калькулятор сделки"
            subtitle="Объём считается от риска и стопа, а не наоборот"
        >
            <div className={cn(PANEL, 'p-4 space-y-3')} style={PANEL_BG}>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Депозит" value={deposit} onChange={setDeposit} suffix="$" />
                    <Field label="Риск на сделку" value={risk} onChange={setRisk} suffix="%" />
                </div>
            </div>

            {/* Стоп задают по-разному: одни срисовывают уровни с графика,
                другие держат риск в процентах */}
            <div className={cn(PANEL, 'p-4 space-y-3')} style={PANEL_BG}>
                <div className="grid grid-cols-2 gap-2">
                    {MODES.map(item => {
                        const active = mode === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setMode(item.id)}
                                className={cn(
                                    'h-9 rounded-xl text-[12.5px] font-medium border transition-colors',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                    active
                                        ? 'bg-primary/12 border-primary/35 text-primary'
                                        : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground hover:bg-white/[0.06]'
                                )}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {mode === 'prices' ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Вход" value={entry} onChange={setEntry} placeholder="0" optional />
                            <Field label="Стоп-лосс" value={stop} onChange={setStop} placeholder="0" optional />
                        </div>
                        <Field label="Цель" value={target} onChange={setTarget} placeholder="0" optional />
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label="Стоп"
                                value={stopPercent}
                                onChange={setStopPercent}
                                suffix="%"
                                placeholder="0"
                                optional
                            />
                            <Field
                                label="Цель"
                                value={targetPercent}
                                onChange={setTargetPercent}
                                suffix="%"
                                placeholder="0"
                                optional
                            />
                        </div>
                        <Field
                            label="Вход"
                            value={entry}
                            onChange={setEntry}
                            placeholder="0"
                            optional
                            hint="Нужен только для количества в единицах и цены ликвидации"
                        />
                    </>
                )}

                <Field label="Плечо" value={leverage} onChange={setLeverage} suffix="x" optional />
            </div>

            {result ? (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(PANEL, 'p-4 divide-y divide-[hsl(142_22%_13%)]')}
                    style={PANEL_BG}
                >
                    {result.hasDirection && (
                        <div className="flex items-center justify-between gap-3 pb-2">
                            <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                {result.isLong
                                    ? <><ArrowUpRight className="w-4 h-4" style={{ color: 'hsl(142 76% 58%)' }} /> Покупка</>
                                    : <><ArrowDownRight className="w-4 h-4" style={{ color: 'hsl(0 72% 62%)' }} /> Продажа</>}
                            </span>
                            <span className="text-[11.5px] text-muted-foreground tabular-nums">
                                стоп {formatNumber(result.stopPercent)} % от входа
                            </span>
                        </div>
                    )}

                    <Row label="В риске" value={`${formatNumber(result.risk)} $`} accent />
                    <Row
                        label="Убытков подряд до потери половины счёта"
                        value={String(result.lossesToHalf)}
                    />

                    {result.hasVolume ? (
                        <>
                            <Row label="Объём позиции" value={`${formatNumber(result.notional)} $`} />
                            {result.hasUnits && (
                                <>
                                    <Row label="В единицах" value={formatNumber(result.units, 4)} />
                                    <Row label="В лотах" value={formatNumber(result.lots, 2)} />
                                </>
                            )}
                            {lev > 1 && (
                                <Row label="Залог при плече" value={`${formatNumber(result.margin)} $`} />
                            )}
                            {result.liquidation > 0 && (
                                <Row label="Ликвидация, ориентир" value={formatNumber(result.liquidation, 4)} />
                            )}
                            {result.hasTarget && (
                                <>
                                    <Row label="Прибыль по цели" value={`${formatNumber(result.reward)} $`} />
                                    <Row
                                        label="Риск к прибыли"
                                        value={`1 : ${formatNumber(result.riskReward)}`}
                                        tone={result.riskReward >= 2
                                            ? 'hsl(142 76% 58%)'
                                            : result.riskReward >= 1
                                                ? 'hsl(var(--foreground))'
                                                : 'hsl(38 92% 62%)'}
                                    />
                                </>
                            )}
                        </>
                    ) : (
                        <p className="text-[12px] text-muted-foreground pt-2 leading-relaxed">
                            Задайте стоп - и посчитается объём позиции. Если стопа нет, эта сумма
                            и есть ставка: на бинарных опционах терять больше нечего.
                        </p>
                    )}
                </motion.div>
            ) : (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Введите депозит и процент риска
                </div>
            )}

            {riskTooHigh && (
                <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-500/25
                                bg-amber-500/[0.06] p-3.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-100/85 leading-relaxed">
                        Риск {formatNumber(riskPercent)} % на сделку. Десять убытков подряд бывают
                        у всех, и на таком риске они забирают больше половины счёта.
                    </p>
                </div>
            )}

            {poorRatio && (
                <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-500/25
                                bg-amber-500/[0.06] p-3.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-100/85 leading-relaxed">
                        Цель ближе стопа: чтобы выйти в плюс, придётся угадывать чаще, чем
                        в двух случаях из трёх.
                    </p>
                </div>
            )}

            {result !== null && result.liquidation > 0 && (
                <p className="text-[11.5px] text-muted-foreground leading-relaxed px-1 pb-1">
                    Цена ликвидации ориентировочная: биржа считает её со своими комиссиями,
                    финансированием и поддерживающей маржой, поэтому запас берите больше.
                </p>
            )}
        </ModalWindow>
    );
}
