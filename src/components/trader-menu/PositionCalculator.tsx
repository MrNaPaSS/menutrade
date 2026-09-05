import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import {
    calcPlan, formatNumber, formatPrice, parseAmount,
    type Direction, type StopUnit,
} from '@/lib/tradePlan';
import { cn } from '@/lib/utils';

interface PositionCalculatorProps {
    open: boolean;
    onClose: () => void;
}

const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;

/** Сумма, депозит и плечо не меняются от сделки к сделке - помним их */
const STORE_KEY = 'nmnh_plan_v1';

const INPUT_CLASS =
    'w-full h-12 rounded-xl px-3 text-[16px] font-mono tabular-nums ' +
    'bg-[hsl(140_26%_7%)] border border-[hsl(142_26%_15%)] text-foreground ' +
    'outline-none focus:border-primary/50 transition-colors';

const LONG = 'hsl(142 76% 58%)';
const SHORT = 'hsl(0 72% 62%)';

function Label({ children }: { children: React.ReactNode }) {
    return <span className="block text-[12px] text-muted-foreground mb-1.5">{children}</span>;
}

/** Поле с единицей у правого края */
function Money({
    value, onChange, unit, placeholder, ariaLabel,
}: {
    value: string;
    onChange: (next: string) => void;
    unit?: string;
    placeholder?: string;
    ariaLabel?: string;
}) {
    return (
        <div className="relative">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                // Цифровая клавиатура: тут везде числа, а буквенная
                // раскладка добавляет лишнее движение на каждое поле
                inputMode="decimal"
                autoComplete="off"
                placeholder={placeholder}
                aria-label={ariaLabel}
                className={cn(INPUT_CLASS, unit && 'pr-10')}
            />
            {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                    {unit}
                </span>
            )}
        </div>
    );
}

/** Строка второстепенного показателя */
function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-2">
            <span className="text-[12.5px] text-muted-foreground">{label}</span>
            <span
                className="font-mono text-[14px] tabular-nums flex-shrink-0"
                style={{ color: tone ?? 'hsl(var(--foreground))' }}
            >
                {value}
            </span>
        </div>
    );
}

/**
 * Калькулятор сделки.
 *
 * Считает от входа к уровням: человек задаёт сумму, цену входа,
 * направление и стоп - получает цену стопа и цены тейков по кратности
 * риска, с деньгами на каждом.
 *
 * Кратность (R) - единственный честный способ сравнивать сделки между
 * собой: один R это то, чем рискуем. «Тейк на 2R» значит «беру вдвое
 * больше, чем готов потерять», и это сравнимо на любом рынке и любом
 * объёме, в отличие от «плюс 300 долларов».
 *
 * Сумма, депозит и плечо запоминаются: от сделки к сделке они не
 * меняются, и набирать их заново - лишняя работа на пустом месте.
 */
export function PositionCalculator({ open, onClose }: PositionCalculatorProps) {
    const [amount, setAmount] = useState('1000');
    const [entry, setEntry] = useState('');
    const [direction, setDirection] = useState<Direction>('long');
    const [stopUnit, setStopUnit] = useState<StopUnit>('percent');
    const [stopPercent, setStopPercent] = useState('1.5');
    const [stopPrice, setStopPrice] = useState('');

    const [more, setMore] = useState(false);
    const [leverage, setLeverage] = useState('');
    const [deposit, setDeposit] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORE_KEY);
            if (!saved) return;
            const parsed = JSON.parse(saved) as Record<string, string>;
            if (parsed.amount) setAmount(parsed.amount);
            if (parsed.deposit) setDeposit(parsed.deposit);
            if (parsed.leverage) setLeverage(parsed.leverage);
        } catch {
            /* хранилище недоступно - работаем со значениями по умолчанию */
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ amount, deposit, leverage }));
        } catch {
            /* приватный режим - посчитаем и без памяти */
        }
    }, [amount, deposit, leverage]);

    const plan = useMemo(() => calcPlan({
        amount: parseAmount(amount),
        entry: parseAmount(entry),
        direction,
        stopUnit,
        stopPercent: parseAmount(stopPercent),
        stopPrice: parseAmount(stopPrice),
        leverage: parseAmount(leverage),
        deposit: parseAmount(deposit),
    }), [amount, entry, direction, stopUnit, stopPercent, stopPrice, leverage, deposit]);

    const isLong = direction === 'long';
    const lev = parseAmount(leverage);
    // Стоп в неверную сторону: цена стопа выше входа в покупке и ниже
    // в продаже. Считаем по модулю, но сказать об этом надо
    const stopOnWrongSide = stopUnit === 'price'
        && parseAmount(entry) > 0 && parseAmount(stopPrice) > 0
        && (isLong
            ? parseAmount(stopPrice) > parseAmount(entry)
            : parseAmount(stopPrice) < parseAmount(entry));
    const riskyShare = plan !== null && plan.lossOfDeposit > 5;

    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Калькулятор сделки"
            subtitle="Уровни и деньги на каждом"
        >
            <div className={cn(PANEL, 'p-3.5 space-y-3')} style={PANEL_BG}>
                {/* Направление внутри панели, а не над ней: отдельной
                    полосой оно упиралось в крестик окна и отнимало
                    высоту у уровней, ради которых сюда заходят */}
                <div className="grid grid-cols-2 gap-2">
                    {([['long', 'Покупка', ArrowUpRight, LONG], ['short', 'Продажа', ArrowDownRight, SHORT]] as const)
                        .map(([id, label, Icon, tone]) => {
                            const active = direction === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setDirection(id)}
                                    className={cn(
                                        'h-10 rounded-xl flex items-center justify-center gap-2',
                                        'text-[13px] font-medium border transition-colors',
                                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                        active
                                            ? 'bg-white/[0.06] border-white/[0.14]'
                                            : 'bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.05]'
                                    )}
                                    style={active ? { color: tone } : undefined}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            );
                        })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>Сумма сделки</Label>
                        <Money value={amount} onChange={setAmount} unit="$" ariaLabel="Сумма сделки" />
                    </div>
                    <div>
                        <Label>Цена входа</Label>
                        <Money value={entry} onChange={setEntry} placeholder="0" ariaLabel="Цена входа" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="text-[12px] text-muted-foreground">Стоп</span>
                        {/* Единица прямо у поля: это свойство стопа, а не
                            всей формы */}
                        <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04]">
                            {([['percent', '%'], ['price', 'цена']] as const).map(([id, label]) => (
                                <button
                                    key={id}
                                    onClick={() => setStopUnit(id)}
                                    className={cn(
                                        'px-2.5 h-7 rounded-md text-[11.5px] transition-colors',
                                        stopUnit === id
                                            ? 'bg-primary/15 text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {stopUnit === 'percent' ? (
                        <Money
                            value={stopPercent}
                            onChange={setStopPercent}
                            unit="%"
                            placeholder="1.5"
                            ariaLabel="Стоп в процентах"
                        />
                    ) : (
                        <Money
                            value={stopPrice}
                            onChange={setStopPrice}
                            placeholder="Цена стопа"
                            ariaLabel="Цена стопа"
                        />
                    )}
                </div>

                <button
                    onClick={() => setMore(v => !v)}
                    className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground
                               hover:text-foreground transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
                >
                    Плечо и депозит
                    <ChevronDown className={cn('w-4 h-4 transition-transform', more && 'rotate-180')} />
                </button>

                {more && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <Label>Плечо</Label>
                                <Money value={leverage} onChange={setLeverage} unit="x" ariaLabel="Плечо" />
                            </div>
                            <div>
                                <Label>Депозит</Label>
                                <Money value={deposit} onChange={setDeposit} unit="$" ariaLabel="Депозит" />
                            </div>
                        </div>
                        {plan ? (
                            <div className="mt-3 pt-1 divide-y divide-[hsl(142_22%_13%)]">
                                <Row label="Количество" value={formatNumber(plan.units, 6)} />
                                {plan.lossOfDeposit > 0 && (
                                    <Row
                                        label="Убыток от депозита"
                                        value={`${formatNumber(plan.lossOfDeposit)} %`}
                                        tone={plan.lossOfDeposit > 5 ? 'hsl(38 92% 62%)' : undefined}
                                    />
                                )}
                                {lev > 1 && <Row label="Залог при плече" value={`${formatNumber(plan.margin)} $`} />}
                                {plan.liquidation > 0 && (
                                    <Row label="Ликвидация, ориентир" value={formatPrice(plan.liquidation)} />
                                )}
                            </div>
                        ) : (
                            <p className="text-[11px] text-muted-foreground mt-2">
                                Депозит нужен, чтобы показать убыток в долях счёта
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            {plan ? (
                <>
                    {/* Уровни: стоп и цели одной лестницей, как в терминале */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                        className={cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)]')}
                        style={PANEL_BG}
                    >
                        {[...plan.levels].reverse().map(level => (
                            <div key={level.r} className="flex items-center gap-3 px-3.5 py-2.5">
                                <span
                                    className="w-10 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0
                                               font-mono font-bold text-[12.5px] border border-white/[0.07]"
                                    style={{
                                        background: 'linear-gradient(160deg, hsl(142 45% 17%), hsl(142 42% 11%))',
                                        color: LONG,
                                    }}
                                >
                                    {level.r}R
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-mono font-bold text-[16px] tabular-nums text-foreground">
                                        {formatPrice(level.price)}
                                    </p>
                                    <p className="text-[11.5px] text-muted-foreground tabular-nums">
                                        {isLong ? '+' : '-'}{formatNumber(level.movePercent)} % от входа
                                    </p>
                                </div>
                                <span
                                    className="font-mono font-bold text-[15px] tabular-nums flex-shrink-0"
                                    style={{ color: LONG }}
                                >
                                    +{formatNumber(level.profit)} $
                                </span>
                            </div>
                        ))}

                        <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'hsl(0 40% 10% / 0.35)' }}>
                            <span
                                className="w-10 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0
                                           font-mono font-bold text-[11px] border border-white/[0.07]"
                                style={{ background: 'hsl(0 40% 16%)', color: SHORT }}
                            >
                                стоп
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-mono font-bold text-[16px] tabular-nums text-foreground">
                                    {formatPrice(plan.stopPrice)}
                                </p>
                                <p className="text-[11.5px] text-muted-foreground tabular-nums">
                                    {isLong ? '-' : '+'}{formatNumber(plan.stopPercent)} % от входа
                                </p>
                            </div>
                            <span
                                className="font-mono font-bold text-[15px] tabular-nums flex-shrink-0"
                                style={{ color: SHORT }}
                            >
                                -{formatNumber(plan.loss)} $
                            </span>
                        </div>
                    </motion.div>

                </>
            ) : (
                <div className={cn(PANEL, 'p-5 text-center text-[13px] text-muted-foreground')} style={PANEL_BG}>
                    Введите сумму, цену входа и стоп - посчитаются уровни
                </div>
            )}

            {stopOnWrongSide && (
                <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-500/25
                                bg-amber-500/[0.06] p-3.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-100/85 leading-relaxed">
                        {isLong
                            ? 'В покупке стоп ставится ниже входа, а не выше.'
                            : 'В продаже стоп ставится выше входа, а не ниже.'}
                        {' '}Расстояние взято по модулю, но проверьте цену.
                    </p>
                </div>
            )}

            {riskyShare && (
                <div className="flex items-start gap-2.5 rounded-[18px] border border-amber-500/25
                                bg-amber-500/[0.06] p-3.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-100/85 leading-relaxed">
                        Одна сделка уносит {formatNumber(plan!.lossOfDeposit)} % счёта. Десять убытков
                        подряд бывают у всех - на таком размере они забирают больше половины.
                    </p>
                </div>
            )}

            {plan !== null && plan.liquidation > 0 && (
                <p className="text-[11.5px] text-muted-foreground leading-relaxed px-1 pb-1">
                    Цена ликвидации ориентировочная: биржа считает её со своими комиссиями,
                    финансированием и поддерживающей маржой, поэтому запас берите больше.
                </p>
            )}
        </ModalWindow>
    );
}
