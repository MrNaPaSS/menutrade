/**
 * Расчёт сделки от риска.
 *
 * Считает столько, на сколько хватает введённого, а не требует всё
 * сразу. Депозит и процент риска дают главную цифру - сколько денег
 * теряем на стопе; она же ответ для бинарных опционов, где риск равен
 * ставке. Расстояние до стопа добавляет объём, цена входа - количество
 * в единицах и ликвидацию, цель - прибыль и отношение к риску.
 *
 * Стоп можно задать двумя способами: ценами с графика или процентом от
 * входа. Проценты нужны тем, кто считает риск в голове, а не срисовывает
 * уровни, и без них калькулятор бесполезен на бинарках.
 *
 * Вынесено из компонента: в разметке формулы теряются при первой же
 * правке вёрстки, а проверять их надо отдельно от неё.
 */

/** Стандартный лот - сто тысяч единиц базовой валюты */
const UNITS_PER_LOT = 100_000;

export type StopMode = 'prices' | 'percent';

export interface TradeInput {
    deposit: number;
    riskPercent: number;
    mode: StopMode;
    /** Режим цен: уровни с графика */
    entry: number;
    stop: number;
    target: number;
    /** Режим процентов: расстояние до стопа и до цели от входа */
    stopPercent: number;
    targetPercent: number;
    /** Плечо. Влияет только на залог и ликвидацию, не на риск */
    leverage: number;
}

export interface TradeResult {
    /** Сколько денег теряем на стопе. Есть всегда, если задан депозит */
    risk: number;
    /** Убытков подряд до потери половины счёта при этом риске */
    lossesToHalf: number;

    /** Дальше - только когда задано расстояние до стопа */
    stopPercent: number;
    notional: number;
    lots: number;

    /** Только когда известна цена входа */
    units: number;
    liquidation: number;
    isLong: boolean;
    hasDirection: boolean;

    /** Залог. Без плеча равен объёму позиции */
    margin: number;
    exposure: number;

    /** Только когда задана цель */
    reward: number;
    riskReward: number;

    hasVolume: boolean;
    hasUnits: boolean;
    hasTarget: boolean;
}

/**
 * Считает всё, что можно посчитать из введённого.
 *
 * Возвращает null, только если нет депозита или риска: без них не
 * считается даже главная цифра.
 */
export function calcTrade(input: TradeInput): TradeResult | null {
    const { deposit, riskPercent, mode, entry, stop, target, leverage } = input;

    if (!(deposit > 0) || !(riskPercent > 0)) return null;

    const risk = (deposit * riskPercent) / 100;
    const lev = leverage > 0 ? leverage : 1;

    // Расстояние до стопа: из цен либо из процента. В режиме процентов
    // цена входа не нужна для объёма в деньгах - только для единиц
    const byPrices = mode === 'prices';
    const priceDistance = Math.abs(entry - stop);
    const stopPercent = byPrices
        ? (entry > 0 && priceDistance > 0 ? (priceDistance / entry) * 100 : 0)
        : input.stopPercent;

    const hasVolume = stopPercent > 0;
    // Объём в деньгах: убыток равен объёму, умноженному на долю падения
    const notional = hasVolume ? risk / (stopPercent / 100) : 0;

    const hasUnits = hasVolume && entry > 0;
    const units = hasUnits ? notional / entry : 0;

    // Направление известно только из цен: процент сам по себе его не
    // задаёт, и гадать за человека не станем
    const hasDirection = byPrices && entry > 0 && priceDistance > 0;
    const isLong = hasDirection ? stop < entry : true;

    const targetPercent = byPrices
        ? (entry > 0 && target > 0 ? (Math.abs(target - entry) / entry) * 100 : 0)
        : input.targetPercent;

    const hasTarget = hasVolume && targetPercent > 0;
    const reward = hasTarget ? notional * (targetPercent / 100) : 0;

    return {
        risk,
        lossesToHalf: Math.floor(deposit / 2 / risk),

        stopPercent,
        notional,
        lots: hasUnits ? units / UNITS_PER_LOT : 0,

        units,
        liquidation: hasUnits && lev > 1 && hasDirection
            ? (isLong ? entry * (1 - 1 / lev) : entry * (1 + 1 / lev))
            : 0,
        isLong,
        hasDirection,

        margin: notional / lev,
        exposure: hasVolume ? notional / deposit : 0,

        reward,
        riskReward: reward > 0 ? reward / risk : 0,

        hasVolume,
        hasUnits,
        hasTarget,
    };
}

/** Число под показ: без хвоста нулей, но и без потери мелких значений */
export function formatNumber(value: number, maxDecimals = 2): string {
    if (!Number.isFinite(value)) return '-';

    // Мелкие величины теряют смысл при округлении до сотых: 0.0004
    // это не «0.00», а вполне рабочий объём
    const decimals = Math.abs(value) < 1 && value !== 0 ? Math.max(maxDecimals, 6) : maxDecimals;

    return value.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}

/** Разбирает то, что человек ввёл: запятая как разделитель - норма */
export function parseAmount(raw: string): number {
    const normalized = raw.replace(/\s/g, '').replace(',', '.');
    const value = Number(normalized);
    return Number.isFinite(value) ? value : 0;
}
