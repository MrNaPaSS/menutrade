import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import {
    calcBinary, calcCrypto, calcForex, formatNumber, parseAmount, riskMoney,
    type CalcMarket,
} from '@/lib/positionSize';
import { cn } from '@/lib/utils';

interface PositionCalculatorProps {
    open: boolean;
    onClose: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

const MARKETS: Array<{ id: CalcMarket; label: string }> = [
    { id: 'binary', label: 'Бинарки' },
    { id: 'forex', label: 'Форекс' },
    { id: 'crypto', label: 'Крипта' },
];

/** Поле ввода числа: одна разметка на десяток полей калькулятора */
function Field({
    label, value, onChange, suffix, hint, placeholder,
}: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    suffix?: string;
    hint?: string;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <span className="block text-[12px] text-muted-foreground mb-1.5">{label}</span>
            <span className="relative block">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    // Цифровая клавиатура с точкой: тут везде числа, а
                    // буквенная раскладка добавляет лишнее движение
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
function Result({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-[12.5px] text-muted-foreground">{label}</span>
            <span
                className={cn(
                    'font-mono tabular-nums flex-shrink-0',
                    accent ? 'font-bold text-[19px]' : 'text-[14px]'
                )}
                style={{ color: accent ? 'hsl(142 76% 58%)' : 'hsl(var(--foreground))' }}
            >
                {value}
            </span>
        </div>
    );
}

/**
 * Калькулятор позиции.
 *
 * Считает не «сколько купить», а сколько можно потерять: объём выводится
 * из допустимого риска и расстояния до стопа. Это единственный порядок,
 * при котором убыток остаётся управляемым, - обратный счёт «возьму на
 * весь депозит с плечом» и приводит людей к сливу.
 *
 * Три рынка считаются по-разному: на бинарках риск равен ставке, на
 * форексе объём считается через цену пункта, в крипте - через
 * расстояние до стопа, а плечо влияет только на залог и ликвидацию.
 */
export function PositionCalculator({ open, onClose }: PositionCalculatorProps) {
    const [market, setMarket] = useState<CalcMarket>('binary');

    const [deposit, setDeposit] = useState('1000');
    const [risk, setRisk] = useState('2');
    const [stopPips, setStopPips] = useState('20');
    const [pipValue, setPipValue] = useState('10');
    const [entry, setEntry] = useState('');
    const [stop, setStop] = useState('');
    const [leverage, setLeverage] = useState('10');

    const d = parseAmount(deposit);
    const r = parseAmount(risk);

    const binary = useMemo(() => calcBinary(d, r), [d, r]);
    const forex = useMemo(
        () => calcForex(d, r, parseAmount(stopPips), parseAmount(pipValue)),
        [d, r, stopPips, pipValue]
    );
    const crypto = useMemo(
        () => calcCrypto(d, r, parseAmount(entry), parseAmount(stop), parseAmount(leverage)),
        [d, r, entry, stop, leverage]
    );

    const money = riskMoney(d, r);
    const riskTooHigh = r > 5;

    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Калькулятор позиции"
            subtitle="Объём считается от риска и стопа, а не наоборот"
        >
            {/* Рынок выбирается первым: от него зависит, какие поля вообще
                имеют смысл */}
            <div className="grid grid-cols-3 gap-2">
                {MARKETS.map(item => {
                    const active = market === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setMarket(item.id)}
                            className={cn(
                                'h-10 rounded-xl text-[13px] font-medium border transition-colors',
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

            <div className={cn(PANEL, 'p-4 space-y-3')} style={PANEL_BG}>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Депозит" value={deposit} onChange={setDeposit} suffix="$" />
                    <Field label="Риск на сделку" value={risk} onChange={setRisk} suffix="%" />
                </div>

                {market === 'forex' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label="Стоп"
                            value={stopPips}
                            onChange={setStopPips}
                            suffix="п."
                            hint="Расстояние до стопа в пунктах"
                        />
                        <Field
                            label="Цена пункта"
                            value={pipValue}
                            onChange={setPipValue}
                            suffix="$"
                            hint="За 1 лот. У пар с USD в конце - 10"
                        />
                    </div>
                )}

                {market === 'crypto' && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Вход" value={entry} onChange={setEntry} placeholder="0" />
                            <Field label="Стоп-лосс" value={stop} onChange={setStop} placeholder="0" />
                        </div>
                        <Field label="Плечо" value={leverage} onChange={setLeverage} suffix="x" />
                    </>
                )}
            </div>

            {/* Риск в деньгах виден всегда: это и есть та цифра, ради
                которой считают, и на неё смотрят до объёма */}
            <motion.div
                key={market}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                className={cn(PANEL, 'p-4 divide-y divide-[hsl(142_22%_13%)]')}
                style={PANEL_BG}
            >
                <Result label="В риске на сделку" value={money > 0 ? `${formatNumber(money)} $` : '-'} accent />

                {market === 'binary' && (
                    binary ? (
                        <>
                            <Result label="Ставка" value={`${formatNumber(binary.stake)} $`} />
                            <Result
                                label="Убытков подряд до потери половины счёта"
                                value={String(binary.lossesToHalf)}
                            />
                        </>
                    ) : (
                        <Result label="Ставка" value="-" />
                    )
                )}

                {market === 'forex' && (
                    forex ? (
                        <>
                            <Result label="Объём" value={`${formatNumber(forex.lots, 2)} лота`} />
                            <Result label="Цена пункта на этом объёме" value={`${formatNumber(forex.pipCost)} $`} />
                        </>
                    ) : (
                        <Result label="Объём" value="-" />
                    )
                )}

                {market === 'crypto' && (
                    crypto ? (
                        <>
                            <Result label="Размер позиции" value={formatNumber(crypto.units, 4)} />
                            <Result label="Объём позиции" value={`${formatNumber(crypto.notional)} $`} />
                            <Result label="Залог при плече" value={`${formatNumber(crypto.margin)} $`} />
                            <Result label="Стоп от входа" value={`${formatNumber(crypto.stopDistancePercent)} %`} />
                            <Result label="Ликвидация, ориентир" value={formatNumber(crypto.liquidation, 4)} />
                        </>
                    ) : (
                        <Result label="Размер позиции" value="-" />
                    )
                )}
            </motion.div>

            {riskTooHigh && (
                <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-500/25
                                bg-amber-500/[0.06] p-3.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-100/85 leading-relaxed">
                        Риск выше 5% на сделку: десять убытков подряд бывают у всех, и на таком
                        риске они забирают половину счёта.
                    </p>
                </div>
            )}

            {market === 'crypto' && crypto && (
                <p className="text-[11.5px] text-muted-foreground leading-relaxed px-1 pb-1">
                    Цена ликвидации ориентировочная: биржа считает её со своими комиссиями,
                    финансированием и поддерживающей маржой, поэтому запас всегда берите больше.
                </p>
            )}
        </ModalWindow>
    );
}
