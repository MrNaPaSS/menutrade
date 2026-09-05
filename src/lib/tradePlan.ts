/**
 * План сделки: от входа к уровням.
 *
 * Человек задаёт сумму, цену входа, направление и расстояние до стопа -
 * получает цену стопа, цены тейков по кратности риска и деньги на
 * каждом уровне.
 *
 * Кратность риска (R) - единственный честный способ сравнивать сделки
 * между собой: один R это то, чем рискуем. Тейк на 2R значит «беру
 * вдвое больше, чем готов потерять», и это сравнимо на любом рынке и
 * любом объёме.
 *
 * Вынесено из компонента: в разметке формулы теряются при первой же
 * правке вёрстки, а проверять их надо отдельно от неё.
 */

export type Direction = 'long' | 'short';
export type StopUnit = 'percent' | 'price';

/** Кратности, по которым считаем цели */
export const R_LEVELS = [1, 2, 3] as const;

export interface PlanInput {
    /** Объём позиции в деньгах */
    amount: number;
    entry: number;
    direction: Direction;
    stopUnit: StopUnit;
    /** Расстояние до стопа в процентах от входа */
    stopPercent: number;
    /** Либо цена стопа - тогда процент считаем сами */
    stopPrice: number;
    /** Плечо: влияет на залог, не на риск */
    leverage: number;
    /** Депозит: нужен, чтобы показать убыток в долях счёта */
    deposit: number;
}

export interface PlanLevel {
    /** Кратность риска */
    r: number;
    price: number;
    profit: number;
    /** Движение цены от входа в процентах */
    movePercent: number;
}

export interface PlanResult {
    direction: Direction;
    units: number;
    stopPrice: number;
    stopPercent: number;
    /** Убыток на стопе в деньгах */
    loss: number;
    /** Доля счёта в этом убытке. Ноль - депозит не задан */
    lossOfDeposit: number;
    margin: number;
    /** Ориентировочная цена ликвидации. Ноль - плечо не задано */
    liquidation: number;
    levels: PlanLevel[];
}

/**
 * Считает план. Возвращает null, пока не хватает главного: суммы,
 * цены входа и расстояния до стопа.
 */
export function calcPlan(input: PlanInput): PlanResult | null {
    const { amount, entry, direction, stopUnit, leverage, deposit } = input;

    if (!(amount > 0) || !(entry > 0)) return null;

    const isLong = direction === 'long';

    // Расстояние до стопа приводим к процентам: дальше всё считается
    // от него, независимо от того, как человек его задал
    const stopPercent = stopUnit === 'percent'
        ? input.stopPercent
        : (input.stopPrice > 0 ? (Math.abs(entry - input.stopPrice) / entry) * 100 : 0);

    if (!(stopPercent > 0)) return null;

    const move = stopPercent / 100;
    const stopPrice = isLong ? entry * (1 - move) : entry * (1 + move);
    const loss = amount * move;

    const lev = leverage > 0 ? leverage : 1;

    return {
        direction,
        units: amount / entry,
        stopPrice,
        stopPercent,
        loss,
        lossOfDeposit: deposit > 0 ? (loss / deposit) * 100 : 0,
        margin: amount / lev,
        liquidation: lev > 1
            ? (isLong ? entry * (1 - 1 / lev) : entry * (1 + 1 / lev))
            : 0,
        levels: R_LEVELS.map(r => ({
            r,
            price: isLong ? entry * (1 + move * r) : entry * (1 - move * r),
            profit: loss * r,
            movePercent: stopPercent * r,
        })),
    };
}

/** Число под показ: без хвоста нулей, но и без потери мелких значений */
export function formatNumber(value: number, maxDecimals = 2): string {
    if (!Number.isFinite(value)) return '-';

    // Мелкие величины теряют смысл при округлении до сотых: цена
    // 0.00042 это не «0.00»
    const decimals = Math.abs(value) < 1 && value !== 0 ? Math.max(maxDecimals, 6) : maxDecimals;

    return value.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });
}

/**
 * Цена под показ: число знаков подбираем по величине.
 *
 * У биткоина цена в десятках тысяч, у мелкой монеты - в тысячных.
 * Один формат на оба случая либо теряет знаки, либо тащит нули.
 */
export function formatPrice(value: number): string {
    if (!Number.isFinite(value)) return '-';

    const abs = Math.abs(value);
    const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : 8;

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
