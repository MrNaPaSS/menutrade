// Типы данных для визуализаций уроков

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength?: number; // 1-5, количество тестов (по умолчанию 1)
  touches?: number[]; // Индексы касаний
  zone?: {
    upper: number; // Верхняя граница зоны
    lower: number; // Нижняя граница зоны
  };
  isDynamic?: boolean; // Динамический уровень (трендовая линия)
  isPsychological?: boolean; // Психологический уровень (круглое число)
  description?: string; // Описание уровня
}

// Фигуры технического анализа
export interface ChartPattern {
  type: 'rectangle' | 'triangle' | 'flag' | 'pennant' | 'wedge' | 'head_shoulders' | 'double_top' | 'double_bottom' | 'triple_top' | 'triple_bottom' | 'diamond' | 'saucer';
  startTime: string;
  endTime: string;
  startPrice: number;
  endPrice: number;
  upperBound?: number; // Для прямоугольников, флагов
  lowerBound?: number;
  direction?: 'up' | 'down' | 'neutral';
  description?: string;
  breakoutPrice?: number; // Цена пробоя
  targetPrice?: number; // Целевая цена после пробоя
}

// Гармонические паттерны
export interface HarmonicPattern {
  type: 'butterfly' | 'bat' | 'crab' | 'shark' | 'five_zero';
  points: {
    x: { time: string; price: number };
    a: { time: string; price: number };
    b: { time: string; price: number };
    c: { time: string; price: number };
    d: { time: string; price: number };
  };
  direction: 'bullish' | 'bearish';
  ratios: {
    xb?: number; // XB / XA
    ac?: number; // AC / AB
    bd?: number; // BD / BC
    ad?: number; // AD / XA
  };
  description?: string;
  targetPrice?: number; // Целевая цена (обычно точка C или B)
}

export interface TrendLine {
  startPrice: number;
  endPrice: number;
  startTime: string;
  endTime: string;
  type: 'up' | 'down';
}

export interface IndicatorData {
  time: string;
  value: number;
  signal?: 'buy' | 'sell' | 'neutral';
}

export interface PatternData {
  type: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface ChartConfig {
  timeframe: 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4';
  showGrid?: boolean;
  showVolume?: boolean;
  interactive?: boolean;
  title?: string;
  description?: string;
  timeframeDescription?: Record<'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4', string>;
}

