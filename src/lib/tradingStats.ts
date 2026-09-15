/**
 * Торговая статистика ученика из терминала NMNH.
 *
 * Считает её платформа - теми же формулами, что и раздел аналитики в
 * кабинете: один человек видит свои числа на двух экранах, и разный
 * винрейт читался бы как поломка.
 *
 * Ключ платформы в браузер не попадает: отсюда уходит подписанный
 * initData на сервер бота, а на платформу с ключом идёт уже он. Иначе
 * чужой PnL достаётся по одному номеру телеграма, который знает каждый,
 * кто был с учеником в общем чате.
 *
 * Важно: это торговля через терминал, а не вся торговля на бирже.
 * Сделки, сделанные руками в приложении биржи, сюда не попадают, и
 * экран обязан это подписать.
 */

import { postSigned } from '@/lib/botApi';
import { EXCHANGES } from '@/data/exchanges';

/** Окна, которые умеет показывать экран. Тот же список проверяет бот. */
export const TRADING_WINDOWS = [7, 30, 90] as const;
export const DEFAULT_WINDOW = 30;

export type TradingState = 'no_account' | 'no_keys' | 'no_trades' | 'ok';
export type TradeSide = 'long' | 'short';
export type TradeOutcome = 'stop' | 'take' | 'manual';

/** Деньги в USDT, доли - числом от 0 до 1. */
export interface TradingSummary {
    trades: number;
    wins: number;
    losses: number;
    /** Сделки ровно в ноль: ни победа, ни поражение */
    flat: number;
    win_rate: number;
    gross: number;
    drawn: number;
    net: number;
    fees: number;
    /** null - убытков не было, делить не на что */
    profit_factor: number | null;
    avg_win: number;
    avg_loss: number;
    expectancy: number;
    best: number;
    worst: number;
    volume: number;
    /** null - стопы не проставлены, риск считать не из чего */
    avg_r: number | null;
    drawdown: number;
    drawdown_pct: number;
    /** null - время сделок неизвестно */
    hold_minutes: number | null;
}

interface Cell {
    trades: number;
    wins: number;
    losses: number;
    pnl: number;
    volume: number;
}

export interface TradingDay extends Cell {
    /** Календарный день по UTC - так же, как в кабинете */
    date: string;
}

export interface TradingExchange extends Cell {
    exchange: string;
}

export interface TradingSymbol extends Cell {
    symbol: string;
}

export interface TradingTrade {
    symbol: string;
    side: TradeSide | null;
    outcome: TradeOutcome | null;
    exchange: string | null;
    pnl: number;
    closed_at: string | null;
}

export interface TradingStats {
    state: TradingState;
    days: number;
    /** Левая граница окна, UTC. null - платформа её не назвала */
    since: string | null;
    truncated: boolean;
    cabinetUrl: string;
    /** Заходил ли ученик в кабинет: если нет, стоит его туда позвать */
    visited: boolean;
    summary: TradingSummary;
    byDay: TradingDay[];
    byExchange: TradingExchange[];
    topSymbols: TradingSymbol[];
    lastTrades: TradingTrade[];
}

interface RawStats {
    state?: TradingState;
    days?: number;
    since?: string | null;
    truncated?: boolean;
    cabinet_url?: string;
    visited?: boolean;
    summary?: TradingSummary;
    by_day?: TradingDay[];
    by_exchange?: TradingExchange[];
    top_symbols?: TradingSymbol[];
    last_trades?: TradingTrade[];
}

const EMPTY_SUMMARY: TradingSummary = {
    trades: 0, wins: 0, losses: 0, flat: 0,
    win_rate: 0, gross: 0, drawn: 0, net: 0, fees: 0,
    profit_factor: null, avg_win: 0, avg_loss: 0, expectancy: 0,
    best: 0, worst: 0, volume: 0, avg_r: null,
    drawdown: 0, drawdown_pct: 0, hold_minutes: null,
};

/**
 * Куда вести кнопкой «вся история», если бот ссылки не дал.
 *
 * Именно /app/analytics: страницы /app/journal у платформы нет, а
 * /journal - это её страница под поисковый запрос, не кабинет. Бот
 * ломаный адрес подменяет у себя, здесь тот же адрес на случай, когда
 * ответа нет вовсе.
 */
const CABINET_URL = 'https://www.nmnh.trade/app/analytics';

/**
 * Сводка за окно. null - мы вне Telegram, связи нет или платформа
 * молчит: экран в этом случае говорит об этом прямо, а не рисует нули,
 * которые человек примет за свои.
 */
export async function fetchTradingStats(days: number): Promise<TradingStats | null> {
    const data = await postSigned<RawStats>('/trading-summary', { days });
    if (!data) return null;

    return {
        state: data.state ?? 'no_account',
        days: data.days ?? days,
        since: data.since ?? null,
        truncated: !!data.truncated,
        cabinetUrl: data.cabinet_url || CABINET_URL,
        visited: !!data.visited,
        summary: data.summary ?? EMPTY_SUMMARY,
        byDay: data.by_day ?? [],
        byExchange: data.by_exchange ?? [],
        topSymbols: data.top_symbols ?? [],
        lastTrades: data.last_trades ?? [],
    };
}

/* ── Как это показывать ──────────────────────────────────────────── */

export const WIN_COLOR = 'hsl(142 76% 58%)';
export const LOSS_COLOR = 'hsl(0 72% 62%)';
export const FLAT_COLOR = 'hsl(142 18% 42%)';

/** Цвет по знаку: плюс зелёный, минус красный, ноль приглушённый. */
export function pnlColor(value: number): string {
    if (value > 0) return WIN_COLOR;
    if (value < 0) return LOSS_COLOR;
    return FLAT_COLOR;
}

/**
 * «+36.35 $», «+8 724 $». Знак у плюса ставим явно: так виден итог.
 *
 * Копейки показываем только у мелких сумм. У четырёхзначных они не
 * несут смысла, зато удлиняют число на три знака - а строку на
 * телефоне оно перерастает быстро.
 */
export function money(value: number, digits?: number): string {
    const places = digits ?? (Math.abs(value) >= 1000 ? 0 : 2);
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    const body = Math.abs(value).toLocaleString('ru-RU', { maximumFractionDigits: places });
    return `${sign}${body} $`;
}

/** Оборот и комиссия - без знака: они всегда положительные. */
export function amount(value: number, digits = 0): string {
    return `${value.toLocaleString('ru-RU', { maximumFractionDigits: digits })} $`;
}

/**
 * Оборот коротко: «9,60M $», «95,9K $».
 *
 * Оборот скальпера идёт на миллионы, и полное число не помещается в
 * плитку ни при каком кегле. Сокращение то же, что в кабинете, - чтобы
 * два экрана читались одинаково.
 */
export function shortAmount(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace('.', ',')}M $`;
    if (abs >= 10_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}K $`;
    return amount(value, abs >= 1000 ? 0 : 2);
}

/**
 * Кегль под длину числа.
 *
 * Длинное число на крупном кегле переносится по словам, и знак доллара
 * уезжает на вторую строку - выглядит как поломка вёрстки. Уменьшить
 * шрифт честнее, чем обрезать сумму.
 */
export function fitSize(text: string, big: number, medium: number, small: number): number {
    if (text.length <= 9) return big;
    if (text.length <= 12) return medium;
    return small;
}

/** Доля 0..1 в проценты: 0.666667 - это 67%. */
export function percent(fraction: number): string {
    return `${Math.round(fraction * 100)}%`;
}

/** Число, которого может не быть. Прочерк честнее выдуманного нуля. */
export function maybeNumber(value: number | null, digits = 2, suffix = ''): string {
    return value === null || value === undefined ? '--' : `${value.toFixed(digits)}${suffix}`;
}

/** «18 мин», «2.4 ч» - сколько в среднем держал сделку. */
export function holdTime(minutes: number | null): string {
    if (minutes === null || minutes === undefined) return '--';
    if (minutes < 60) return `${Math.round(minutes)} мин`;
    return `${(minutes / 60).toFixed(1)} ч`;
}

/** «3 сделки», «21 сделка» - число рядом со словом в нужном падеже. */
export function tradeWord(count: number): string {
    const tail = Math.abs(count) % 100;
    if (tail >= 11 && tail <= 14) return 'сделок';
    switch (tail % 10) {
        case 1: return 'сделка';
        case 2:
        case 3:
        case 4: return 'сделки';
        default: return 'сделок';
    }
}

/**
 * Название биржи по коду.
 *
 * Список бирж академии лежит в data/exchanges, но платформа знает и те,
 * которых там ещё нет: незнакомый код показываем как есть, а не подменяем
 * первой из списка - иначе сделки OKX подпишутся как WEEX.
 */
export function exchangeLabel(code: string | null): string {
    if (!code) return 'Биржа';
    return EXCHANGES.find(item => item.code === code)?.label ?? code.toUpperCase();
}

/** «14 сен» - короткая дата дня из by_day. Дни считаются по UTC. */
export function dayLabel(date: string): string {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** «14 сен, 17:47» - когда закрылась сделка, тоже по UTC. */
export function closedLabel(iso: string | null): string {
    if (!iso) return '';
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString('ru-RU', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
    });
}

export const SIDE_LABEL: Record<TradeSide, string> = {
    long: 'покупка',
    short: 'продажа',
};

export const OUTCOME_LABEL: Record<TradeOutcome, string> = {
    take: 'по цели',
    stop: 'по стопу',
    manual: 'закрыл сам',
};
