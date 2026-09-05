/**
 * Дневник сделок.
 *
 * Хранится в облаке Telegram, а не в памяти телефона: записи переживают
 * переустановку приложения и видны с любого устройства, где человек
 * вошёл в тот же аккаунт. Для дневника это не роскошь - потерянная
 * история обесценивает его целиком.
 *
 * Каждая сделка лежит отдельным ключом. Облако Telegram ограничивает
 * значение четырьмя тысячами символов, и одним общим списком дневник
 * упёрся бы в потолок на второй сотне записей; отдельными ключами
 * потолок - тысяча сделок, чего с запасом хватает.
 *
 * Когда облако недоступно (браузер вне Telegram), работаем с памятью
 * телефона. Это осознанный запасной путь для разработки, а не режим
 * для людей.
 */

export type TradeDirection = 'long' | 'short';
export type TradeOutcome = 'win' | 'loss' | 'breakeven';

export interface Trade {
    id: string;
    /** Дата сделки в виде ГГГГ-ММ-ДД: по ней строится календарь */
    date: string;
    instrument: string;
    direction: TradeDirection;
    outcome: TradeOutcome;
    /** Результат в деньгах: минус для убытка */
    pnl: number;
    /** Результат в кратности риска. Ноль - не задан */
    r: number;
    note: string;
}

const PREFIX = 'trade_';
const LOCAL_KEY = 'nmnh_journal_v1';

interface CloudStorage {
    setItem: (key: string, value: string, cb?: (err: string | null, ok?: boolean) => void) => void;
    getItems: (keys: string[], cb: (err: string | null, values?: Record<string, string>) => void) => void;
    getKeys: (cb: (err: string | null, keys?: string[]) => void) => void;
    removeItem: (key: string, cb?: (err: string | null, ok?: boolean) => void) => void;
}

function cloud(): CloudStorage | null {
    const storage = (window as { Telegram?: { WebApp?: { CloudStorage?: CloudStorage } } })
        .Telegram?.WebApp?.CloudStorage;
    // Проверяем сам метод, а не наличие объекта: в старых клиентах
    // CloudStorage объявлен, но ничего не умеет
    return typeof storage?.getKeys === 'function' ? storage : null;
}

/* ── Запасное хранилище: память телефона ─────────────────────────── */

function localRead(): Trade[] {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        return raw ? (JSON.parse(raw) as Trade[]) : [];
    } catch {
        return [];
    }
}

function localWrite(trades: Trade[]): void {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(trades));
    } catch {
        /* приватный режим - записать некуда */
    }
}

/* ── Чтение и запись ─────────────────────────────────────────────── */

export function loadTrades(): Promise<Trade[]> {
    const storage = cloud();
    if (!storage) return Promise.resolve(sortTrades(localRead()));

    return new Promise(resolve => {
        storage.getKeys((keysError, keys) => {
            const ours = (keys ?? []).filter(k => k.startsWith(PREFIX));
            if (keysError || ours.length === 0) {
                resolve([]);
                return;
            }

            storage.getItems(ours, (itemsError, values) => {
                if (itemsError || !values) {
                    resolve([]);
                    return;
                }

                const trades: Trade[] = [];
                for (const raw of Object.values(values)) {
                    try {
                        trades.push(JSON.parse(raw) as Trade);
                    } catch {
                        // Битую запись пропускаем: одна испорченная строка
                        // не должна прятать весь дневник
                    }
                }
                resolve(sortTrades(trades));
            });
        });
    });
}

export function saveTrade(trade: Trade): Promise<void> {
    const storage = cloud();
    if (!storage) {
        const rest = localRead().filter(t => t.id !== trade.id);
        localWrite([...rest, trade]);
        return Promise.resolve();
    }

    return new Promise(resolve => {
        storage.setItem(PREFIX + trade.id, JSON.stringify(trade), () => resolve());
    });
}

export function deleteTrade(id: string): Promise<void> {
    const storage = cloud();
    if (!storage) {
        localWrite(localRead().filter(t => t.id !== id));
        return Promise.resolve();
    }

    return new Promise(resolve => {
        storage.removeItem(PREFIX + id, () => resolve());
    });
}

/** Новые сверху: дневник читают с последней сделки */
function sortTrades(trades: Trade[]): Trade[] {
    return [...trades].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function newTradeId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ── Статистика ──────────────────────────────────────────────────── */

export interface JournalStats {
    total: number;
    wins: number;
    losses: number;
    breakeven: number;
    /** Доля прибыльных среди тех, где был результат */
    winrate: number;
    pnl: number;
    /** Средний результат в кратности риска среди заполненных */
    avgR: number;
    best: number;
    worst: number;
    /** Текущая серия: плюс - прибыльные подряд, минус - убыточные */
    streak: number;
}

export function calcStats(trades: Trade[]): JournalStats {
    const wins = trades.filter(t => t.outcome === 'win').length;
    const losses = trades.filter(t => t.outcome === 'loss').length;
    const breakeven = trades.filter(t => t.outcome === 'breakeven').length;

    const decided = wins + losses;
    const pnls = trades.map(t => t.pnl);
    // Средний R считаем только по заполненным: нули от незаполненных
    // занизили бы среднее и соврали бы о качестве сделок
    const withR = trades.filter(t => t.r !== 0).map(t => t.r);

    let streak = 0;
    for (const trade of trades) {
        if (trade.outcome === 'breakeven') break;
        const positive = trade.outcome === 'win';
        if (streak === 0) {
            streak = positive ? 1 : -1;
        } else if (positive === streak > 0) {
            streak += positive ? 1 : -1;
        } else {
            break;
        }
    }

    return {
        total: trades.length,
        wins,
        losses,
        breakeven,
        winrate: decided > 0 ? (wins / decided) * 100 : 0,
        pnl: pnls.reduce((sum, value) => sum + value, 0),
        avgR: withR.length > 0 ? withR.reduce((s, v) => s + v, 0) / withR.length : 0,
        best: pnls.length > 0 ? Math.max(...pnls) : 0,
        worst: pnls.length > 0 ? Math.min(...pnls) : 0,
        streak,
    };
}

/** Итог по дням: для календаря сделок */
export function pnlByDay(trades: Trade[]): Map<string, number> {
    const days = new Map<string, number>();
    for (const trade of trades) {
        days.set(trade.date, (days.get(trade.date) ?? 0) + trade.pnl);
    }
    return days;
}

/** Сегодняшняя дата в том же виде, что хранится в записях */
export function todayKey(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}
