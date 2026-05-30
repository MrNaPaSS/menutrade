// Генератор реалистичных свечных паттернов для игры "Куда пойдёт график".
// Строит настоящий OHLC: тело по ценам, фитили по волатильности + рыночный шум.
// Каждый вызов даёт новый график (seed), но детерминирован при одинаковом seed.

export interface Candle {
  time: number; // UTCTimestamp (сек)
  open: number;
  high: number;
  low: number;
  close: number;
}

// Точка для графика: реальная свеча или "пустышка" (резервирует слот по оси X)
export type ChartPoint = Candle | { time: number };

export interface GeneratedPattern {
  candles: Candle[];
  splitIndex: number; // последняя видимая до ответа свеча (включительно)
  direction: 'UP' | 'DOWN';
  name: string;
  explanation: string;
}

// Детерминированный ГПСЧ
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Линейный сегмент ценового пути с шумом (возвращает n точек, не включая стартовую)
function seg(from: number, to: number, n: number, rng: () => number, wobble: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    out.push(from + (to - from) * t + (rng() - 0.5) * wobble);
  }
  return out;
}

interface PatternSpec {
  closes: number[];
  splitIndex: number;
  direction: 'UP' | 'DOWN';
  name: string;
  explanation: string;
}

type Builder = (base: number, w: number, rng: () => number) => PatternSpec;

const bullFlag: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b + 20, 9, r, w));        // импульс вверх (флагшток)
  c.push(...seg(b + 20, b + 14, 10, r, w * 0.5)); // флаг: пологий откат
  const splitIndex = c.length - 1;
  c.push(...seg(b + 14, b + 31, 12, r, w));  // пробой вверх
  return {
    closes: c, splitIndex, direction: 'UP',
    name: 'Бычий флаг',
    explanation: 'После сильного импульса вверх цена ушла в пологую коррекцию (флаг). Такая фигура обычно продолжает тренд, то есть пробивается вверх.',
  };
};

const bearFlag: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b - 20, 9, r, w));
  c.push(...seg(b - 20, b - 14, 10, r, w * 0.5));
  const splitIndex = c.length - 1;
  c.push(...seg(b - 14, b - 31, 12, r, w));
  return {
    closes: c, splitIndex, direction: 'DOWN',
    name: 'Медвежий флаг',
    explanation: 'После сильного падения цена сделала пологий отскок (флаг). Такая фигура обычно продолжает тренд вниз.',
  };
};

const doubleTop: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b + 18, 7, r, w));        // первая вершина
  c.push(...seg(b + 18, b + 9, 5, r, w));    // откат к шее
  c.push(...seg(b + 9, b + 17, 7, r, w));    // вторая вершина (не выше первой)
  const splitIndex = c.length - 1;
  c.push(...seg(b + 17, b + 3, 12, r, w));   // пробой шеи вниз
  return {
    closes: c, splitIndex, direction: 'DOWN',
    name: 'Двойная вершина',
    explanation: 'Цена дважды уперлась в одно сопротивление и не смогла его пробить. Двойная вершина - сигнал разворота вниз.',
  };
};

const doubleBottom: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b - 18, 7, r, w));
  c.push(...seg(b - 18, b - 9, 5, r, w));
  c.push(...seg(b - 9, b - 17, 7, r, w));
  const splitIndex = c.length - 1;
  c.push(...seg(b - 17, b - 3, 12, r, w));
  return {
    closes: c, splitIndex, direction: 'UP',
    name: 'Двойное дно',
    explanation: 'Цена дважды оттолкнулась от одной поддержки и не пробила её. Двойное дно - сигнал разворота вверх.',
  };
};

const headShoulders: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b + 14, 5, r, w));        // левое плечо
  c.push(...seg(b + 14, b + 8, 4, r, w));    // к шее
  c.push(...seg(b + 8, b + 22, 5, r, w));    // голова
  c.push(...seg(b + 22, b + 8, 5, r, w));    // к шее
  c.push(...seg(b + 8, b + 15, 4, r, w));    // правое плечо
  const splitIndex = c.length - 1;
  c.push(...seg(b + 15, b + 2, 11, r, w));   // пробой шеи вниз
  return {
    closes: c, splitIndex, direction: 'DOWN',
    name: 'Голова и плечи',
    explanation: 'Классическая вершинная фигура: левое плечо, голова повыше, правое плечо. После неё цена обычно идёт вниз.',
  };
};

const invHeadShoulders: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b - 14, 5, r, w));
  c.push(...seg(b - 14, b - 8, 4, r, w));
  c.push(...seg(b - 8, b - 22, 5, r, w));
  c.push(...seg(b - 22, b - 8, 5, r, w));
  c.push(...seg(b - 8, b - 15, 4, r, w));
  const splitIndex = c.length - 1;
  c.push(...seg(b - 15, b - 2, 11, r, w));
  return {
    closes: c, splitIndex, direction: 'UP',
    name: 'Перевёрнутая голова и плечи',
    explanation: 'Донная фигура: впадина-голова между двумя плечами. После неё цена обычно разворачивается вверх.',
  };
};

const ascTriangle: Builder = (b, w, r) => {
  const R = b + 16; // плоское сопротивление
  const c = [b];
  c.push(...seg(b, R, 3, r, w));
  c.push(...seg(R, b + 7, 3, r, w));
  c.push(...seg(b + 7, R, 3, r, w));
  c.push(...seg(R, b + 10, 3, r, w));
  c.push(...seg(b + 10, R, 3, r, w));
  c.push(...seg(R, b + 13, 3, r, w));        // растущие минимумы поджимают к сопротивлению
  const splitIndex = c.length - 1;
  c.push(...seg(b + 13, b + 30, 12, r, w));  // пробой вверх
  return {
    closes: c, splitIndex, direction: 'UP',
    name: 'Восходящий треугольник',
    explanation: 'Плоское сопротивление и растущие минимумы - покупатели поджимают цену. Обычно пробивается вверх.',
  };
};

const descTriangle: Builder = (b, w, r) => {
  const S = b - 16; // плоская поддержка
  const c = [b];
  c.push(...seg(b, S, 3, r, w));
  c.push(...seg(S, b - 7, 3, r, w));
  c.push(...seg(b - 7, S, 3, r, w));
  c.push(...seg(S, b - 10, 3, r, w));
  c.push(...seg(b - 10, S, 3, r, w));
  c.push(...seg(S, b - 13, 3, r, w));
  const splitIndex = c.length - 1;
  c.push(...seg(b - 13, b - 30, 12, r, w));
  return {
    closes: c, splitIndex, direction: 'DOWN',
    name: 'Нисходящий треугольник',
    explanation: 'Плоская поддержка и снижающиеся максимумы - продавцы давят цену. Обычно пробивается вниз.',
  };
};

const supportBounce: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b + 16, 8, r, w));        // восходящий тренд
  c.push(...seg(b + 16, b + 6, 8, r, w));    // откат к поддержке
  const splitIndex = c.length - 1;
  c.push(...seg(b + 6, b + 23, 12, r, w));   // отскок вверх
  return {
    closes: c, splitIndex, direction: 'UP',
    name: 'Отскок от поддержки',
    explanation: 'В восходящем тренде цена откатилась к поддержке. По тренду вероятнее отскок вверх.',
  };
};

const resistanceReject: Builder = (b, w, r) => {
  const c = [b];
  c.push(...seg(b, b - 16, 8, r, w));
  c.push(...seg(b - 16, b - 6, 8, r, w));
  const splitIndex = c.length - 1;
  c.push(...seg(b - 6, b - 23, 12, r, w));
  return {
    closes: c, splitIndex, direction: 'DOWN',
    name: 'Отбой от сопротивления',
    explanation: 'В нисходящем тренде цена поднялась к сопротивлению. По тренду вероятнее отбой вниз.',
  };
};

const BUILDERS: Builder[] = [
  bullFlag, bearFlag, doubleTop, doubleBottom, headShoulders,
  invHeadShoulders, ascTriangle, descTriangle, supportBounce, resistanceReject,
];

const BASE_TIME = 1_700_000_000;
const STEP_SEC = 300;

const r2 = (n: number): number => Math.round(n * 100) / 100;

// Превращает путь цен (closes) в реалистичные OHLC-свечи
function buildCandles(closes: number[], rng: () => number): Candle[] {
  const candles: Candle[] = [];
  let prevClose = closes[0];

  for (let i = 0; i < closes.length; i++) {
    const close = closes[i];
    const open = i === 0 ? close - (rng() - 0.5) * 2 : prevClose;
    const price = Math.max(1, (open + close) / 2);
    const wickScale = price * 0.012; // ~1.2% типичный фитиль
    const upWick = rng() * wickScale * 1.4;
    const downWick = rng() * wickScale * 1.4;

    const high = Math.max(open, close) + upWick;
    const low = Math.min(open, close) - downWick;

    candles.push({
      time: BASE_TIME + i * STEP_SEC,
      open: r2(open),
      high: r2(high),
      low: r2(low),
      close: r2(close),
    });
    prevClose = close;
  }
  return candles;
}

export function generatePattern(seed: number = Math.floor(Math.random() * 1_000_000_000)): GeneratedPattern {
  const rng = mulberry32(seed);
  const builder = BUILDERS[Math.floor(rng() * BUILDERS.length)];
  const spec = builder(100, 1.1, rng);
  const candles = buildCandles(spec.closes, rng);
  return {
    candles,
    splitIndex: spec.splitIndex,
    direction: spec.direction,
    name: spec.name,
    explanation: spec.explanation,
  };
}
