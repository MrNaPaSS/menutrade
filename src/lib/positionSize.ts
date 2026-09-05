/**
 * Расчёт размера позиции.
 *
 * Вынесено из компонента: формулы одинаковы для всех трёх рынков в
 * части «сколько денег в риске», а дальше расходятся, и держать это
 * в разметке значит потерять их из виду при первой же правке вёрстки.
 *
 * Все функции чистые и работают с числами - никаких строк из полей
 * ввода. Разбор ввода живёт в компоненте.
 */

export type CalcMarket = 'binary' | 'forex' | 'crypto';

/** Сколько денег в риске на одну сделку */
export function riskMoney(deposit: number, riskPercent: number): number {
    if (!(deposit > 0) || !(riskPercent > 0)) return 0;
    return (deposit * riskPercent) / 100;
}

export interface BinaryResult {
    stake: number;
    /** Сколько убыточных сделок подряд выдержит счёт при этой ставке */
    lossesToHalf: number;
}

/**
 * Бинарные опционы: риск равен ставке, потерять больше нельзя.
 *
 * Серия считается по фиксированной ставке от начального депозита -
 * так её считает большинство, и так её проще проверить в уме.
 */
export function calcBinary(deposit: number, riskPercent: number): BinaryResult | null {
    const stake = riskMoney(deposit, riskPercent);
    if (stake <= 0) return null;

    return {
        stake,
        lossesToHalf: Math.floor(deposit / 2 / stake),
    };
}

export interface ForexResult {
    lots: number;
    /** Цена одного пункта на рассчитанном объёме */
    pipCost: number;
    risk: number;
}

/**
 * Форекс: объём считается от расстояния до стопа и цены пункта.
 *
 * pipValue - цена пункта на один стандартный лот. Для пар с долларом
 * на конце это 10 $, для остальных зависит от котировки, поэтому
 * значение задаёт человек, а не подставляем вслепую.
 */
export function calcForex(
    deposit: number,
    riskPercent: number,
    stopPips: number,
    pipValue: number,
): ForexResult | null {
    const risk = riskMoney(deposit, riskPercent);
    if (risk <= 0 || !(stopPips > 0) || !(pipValue > 0)) return null;

    const lots = risk / (stopPips * pipValue);
    return { lots, pipCost: lots * pipValue, risk };
}

export interface CryptoResult {
    /** Размер позиции в монетах */
    units: number;
    /** Объём позиции в деньгах */
    notional: number;
    /** Залог при выбранном плече */
    margin: number;
    /** Ориентировочная цена ликвидации, изолированная маржа, без комиссий */
    liquidation: number;
    stopDistancePercent: number;
    risk: number;
}

/**
 * Крипта: от расстояния до стопа считаем объём, от плеча - залог.
 *
 * Цена ликвидации приблизительная: биржи считают её со своими
 * комиссиями, ставкой финансирования и поддерживающей маржой. Показываем
 * ориентир, а не обещание - в интерфейсе это оговорено.
 */
export function calcCrypto(
    deposit: number,
    riskPercent: number,
    entry: number,
    stop: number,
    leverage: number,
): CryptoResult | null {
    const risk = riskMoney(deposit, riskPercent);
    const distance = Math.abs(entry - stop);
    if (risk <= 0 || !(entry > 0) || distance <= 0 || !(leverage > 0)) return null;

    const units = risk / distance;
    const notional = units * entry;
    const isLong = stop < entry;

    return {
        units,
        notional,
        margin: notional / leverage,
        liquidation: isLong
            ? entry * (1 - 1 / leverage)
            : entry * (1 + 1 / leverage),
        stopDistancePercent: (distance / entry) * 100,
        risk,
    };
}

/** Число под показ: без хвоста нулей, но и без потери мелких значений */
export function formatNumber(value: number, maxDecimals = 2): string {
    if (!Number.isFinite(value)) return '-';

    // Мелкие величины теряют смысл при округлении до сотых: 0.0004 лота
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
