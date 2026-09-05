/**
 * Расчёт сделки от риска.
 *
 * Один расчёт на все рынки: цена входа, цена стопа и допустимый риск
 * задают объём везде одинаково - в крипте, на форексе и на акциях.
 * Разница только в том, как этот объём называют, поэтому объём выдаём
 * сразу в трёх видах: в единицах актива, в лотах и в деньгах.
 *
 * Вынесено из компонента: в разметке формулы теряются при первой же
 * правке вёрстки, а проверять их надо отдельно от неё.
 */

/** Стандартный лот - сто тысяч единиц базовой валюты */
const UNITS_PER_LOT = 100_000;

export interface TradeInput {
    deposit: number;
    riskPercent: number;
    entry: number;
    stop: number;
    /** Цель. Ноль - не задана, тогда прибыль и отношение не считаем */
    target: number;
    /** Плечо. Влияет только на залог и ликвидацию, не на риск */
    leverage: number;
}

export interface TradeResult {
    /** Направление выводим из того, где стоит стоп */
    isLong: boolean;
    /** Сколько денег теряем при срабатывании стопа */
    risk: number;
    /** Расстояние до стопа в цене и в процентах от входа */
    stopDistance: number;
    stopPercent: number;
    /** Объём: в единицах актива, в лотах и в деньгах */
    units: number;
    lots: number;
    notional: number;
    /** Залог при выбранном плече и во сколько раз объём больше депозита */
    margin: number;
    exposure: number;
    /** Ориентировочная цена ликвидации. Ноль - плечо не задано */
    liquidation: number;
    /** Прибыль по цели и отношение к риску. Ноль - цель не задана */
    reward: number;
    riskReward: number;
    /** Убытков подряд до потери половины счёта при этом риске */
    lossesToHalf: number;
    /** Сколько процентов счёта уносит одна такая сделка */
    accountRiskPercent: number;
}

/**
 * Считает сделку целиком. Возвращает null, пока не хватает данных для
 * главного - объёма: без депозита, риска, входа и стопа считать нечего.
 */
export function calcTrade(input: TradeInput): TradeResult | null {
    const { deposit, riskPercent, entry, stop, target, leverage } = input;

    const risk = (deposit * riskPercent) / 100;
    const stopDistance = Math.abs(entry - stop);

    if (!(deposit > 0) || !(riskPercent > 0) || !(entry > 0) || stopDistance <= 0) {
        return null;
    }

    const isLong = stop < entry;
    const units = risk / stopDistance;
    const notional = units * entry;

    // Плечо не задано - считаем как за свои: залог равен объёму,
    // ликвидации нет
    const lev = leverage > 0 ? leverage : 1;
    const margin = notional / lev;

    const reward = target > 0 ? Math.abs(target - entry) * units : 0;

    return {
        isLong,
        risk,
        stopDistance,
        stopPercent: (stopDistance / entry) * 100,
        units,
        lots: units / UNITS_PER_LOT,
        notional,
        margin,
        exposure: notional / deposit,
        liquidation: lev > 1
            ? (isLong ? entry * (1 - 1 / lev) : entry * (1 + 1 / lev))
            : 0,
        reward,
        riskReward: reward > 0 ? reward / risk : 0,
        lossesToHalf: Math.floor(deposit / 2 / risk),
        accountRiskPercent: riskPercent,
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
