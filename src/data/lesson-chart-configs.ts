// Конфигурации графиков для уроков

import type {
  CandlestickData,
  SupportResistanceLevel,
  TrendLine,
  IndicatorData,
  PatternData,
  ChartConfig,
} from '@/components/lesson-visuals/types';

export type ChartType = 
  | 'CandlestickChart' 
  | 'SupportResistanceChart' 
  | 'TrendChart' 
  | 'IndicatorChart' 
  | 'PatternChart' 
  | 'StrategyExample' 
  | 'SessionActivityChart' 
  | 'NewsImpactChart' 
  | 'TimeframeComparison'
  | 'InteractiveExample';

export interface LessonChartConfig {
  lessonId: string;
  chartType: ChartType;
  data?: CandlestickData[] | SupportResistanceLevel[] | TrendLine[] | IndicatorData[] | PatternData[];
  config: ChartConfig & {
    showLevels?: boolean;
    showVolume?: boolean;
    showPatterns?: boolean;
    interactive?: boolean;
    indicatorType?: 'rsi' | 'macd' | 'stochastic' | 'bollinger';
    trendType?: 'up' | 'down' | 'both';
    strategy?: 'trend' | 'bounce' | 'breakout' | 'news' | 'strike_zone';
    pattern?: string;
    title?: string;
    description?: string;
    timeframeDescription?: Record<'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4', string>;
  };
}

// Конфигурации графиков для каждого урока
const lessonChartConfigs: Record<string, LessonChartConfig> = {
  // lesson-2-1: Графики и таймфреймы - TimeframeComparison
  'lesson-2-1': {
    lessonId: 'lesson-2-1',
    chartType: 'TimeframeComparison',
    config: {
      timeframe: 'M15',
      interactive: true,
    },
  },

  // lesson-2-2: Поддержка и сопротивление
  'lesson-2-2': {
    lessonId: 'lesson-2-2',
    chartType: 'SupportResistanceChart',
    data: (() => {
      const basePrice = 1.1000;
      const levels: SupportResistanceLevel[] = [];
      const now = new Date();
      
      // Создаём уровни поддержки и сопротивления
      for (let i = 0; i < 30; i++) {
        const time = new Date(now.getTime() - (29 - i) * 15 * 60 * 1000);
        const price = basePrice + (Math.sin(i / 5) * 0.001) + (Math.random() - 0.5) * 0.0003;
        
        if (i % 8 === 0) {
          levels.push({
            price: price + 0.0005,
            type: 'resistance',
            strength: Math.floor(Math.random() * 3) + 2,
            touches: [i],
          });
        } else if (i % 8 === 4) {
          levels.push({
            price: price - 0.0005,
            type: 'support',
            strength: Math.floor(Math.random() * 3) + 2,
            touches: [i],
          });
        }
      }
      
      return levels;
    })(),
    config: {
      timeframe: 'M15',
      showLevels: true,
      interactive: true,
    },
  },

  // lesson-2-3: Тренды
  'lesson-2-3': {
    lessonId: 'lesson-2-3',
    chartType: 'TrendChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      let currentPrice = basePrice;
      let trend = 0.00005;
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        
        if (i % 10 === 0) {
          trend = (Math.random() - 0.5) * 0.0001;
        }
        
        currentPrice += trend + (Math.random() - 0.5) * 0.0002;
        
        const open = i === 29 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = Math.abs(trend) * 10 + 0.0002;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      trendType: 'both',
      showPatterns: false,
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-10-1: RSI
  'lesson-10-1': {
    lessonId: 'lesson-10-1',
    chartType: 'IndicatorChart',
    data: (() => {
      const basePrice = 1.1050;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        let trend = 0.00003;
        const volatility = 0.0005;
        
        if (i > 20) {
          trend = 0.00008;
        } else if (i > 10) {
          trend = -0.00005;
        } else {
          trend = 0.00006;
        }
        
        const change = trend + (Math.random() - 0.5) * volatility;
        const open = i === 29 ? basePrice : data[data.length - 1].close;
        const close = open + change;
        const bodySize = Math.abs(close - open);
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      indicatorType: 'rsi',
      timeframe: 'M15',
      showPatterns: false,
      interactive: true,
    },
  },

  // lesson-10-2: MACD
  'lesson-10-2': {
    lessonId: 'lesson-10-2',
    chartType: 'IndicatorChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        const trend = i > 15 ? 0.0001 : 0.00005;
        const volatility = 0.0004;
        const change = trend + (Math.random() - 0.5) * volatility;
        
        const open = i === 29 ? basePrice : data[data.length - 1].close;
        const close = open + change;
        const bodySize = Math.abs(close - open);
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      indicatorType: 'macd',
      timeframe: 'M15',
      showPatterns: false,
      interactive: true,
    },
  },

  // lesson-10-3: Stochastic
  'lesson-10-3': {
    lessonId: 'lesson-10-3',
    chartType: 'IndicatorChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      let currentPrice = basePrice;
      let trend = 0.00005;
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        
        if (i % 8 === 0) {
          trend = -trend;
        }
        
        currentPrice += trend + (Math.random() - 0.5) * 0.0003;
        
        const open = i === 29 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = 0.0005;
        const change = trend + (Math.random() - 0.5) * volatility;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      indicatorType: 'stochastic',
      timeframe: 'M15',
      showPatterns: false,
      interactive: true,
    },
  },

  // lesson-10-4: Bollinger Bands
  'lesson-10-4': {
    lessonId: 'lesson-10-4',
    chartType: 'IndicatorChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        let volatility = 0.0003;
        let trend = 0;
        
        if (i > 18) {
          volatility = 0.0002;
          trend = (Math.random() - 0.5) * 0.0001;
        } else {
          volatility = 0.0006;
          trend = 0.0001;
        }
        
        const change = trend + (Math.random() - 0.5) * volatility;
        const open = i === 29 ? basePrice : data[data.length - 1].close;
        const close = open + change;
        const bodySize = Math.abs(close - open);
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      indicatorType: 'bollinger',
      timeframe: 'M15',
      showPatterns: false,
      interactive: true,
    },
  },

  // lesson-11-1: Разворотные паттерны свечей
  'lesson-11-1': {
    lessonId: 'lesson-11-1',
    chartType: 'CandlestickChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        let open = i === 29 ? basePrice : data[data.length - 1].close;
        let close = open;
        let high = open;
        let low = open;
        
        if (i > 20) {
          close = open - 0.0003 + (Math.random() - 0.5) * 0.0002;
          high = Math.max(open, close) + Math.random() * 0.0001;
          low = Math.min(open, close) - Math.random() * 0.0001;
        } else if (i === 20) {
          const bodySize = 0.00005;
          close = open - bodySize;
          high = open + 0.0001;
          low = open - 0.0008;
        } else if (i === 19 || i === 18) {
          close = open + 0.0004 + (Math.random() - 0.5) * 0.0001;
          high = Math.max(open, close) + Math.random() * 0.0001;
          low = Math.min(open, close) - Math.random() * 0.0001;
        } else {
          close = open + 0.0002 + (Math.random() - 0.5) * 0.0001;
          high = Math.max(open, close) + Math.random() * 0.0001;
          low = Math.min(open, close) - Math.random() * 0.0001;
        }
        
        data.push({
          time: time.toISOString(),
          open,
          high,
          low,
          close,
          volume: Math.floor((Math.random() * 500 + 300)),
        });
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      showLevels: true,
      showPatterns: false,
      interactive: true,
    },
  },

  // lesson-11-2: Продолжающие паттерны (Флаг)
  'lesson-11-2': {
    lessonId: 'lesson-11-2',
    chartType: 'PatternChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      const poleStart = basePrice;
      const poleEnd = basePrice + 0.002;
      const flagTopStart = poleEnd;
      const flagTopEnd = poleEnd - 0.0002;
      const flagBottomStart = poleEnd - 0.0005;
      const flagBottomEnd = poleEnd - 0.0007;
      
      for (let i = 49; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        let open, close, high, low;
        
        if (i > 35) {
          const progress = (i - 35) / 15;
          open = i === 49 ? poleStart : data[data.length - 1].close;
          close = poleStart + (poleEnd - poleStart) * progress;
          high = close + 0.0001;
          low = open - 0.00005;
        } else if (i > 15) {
          const progress = (i - 15) / 20;
          const flagTop = flagTopStart - (flagTopStart - flagTopEnd) * progress;
          const flagBottom = flagBottomStart - (flagBottomStart - flagBottomEnd) * progress;
          open = data[data.length - 1].close;
          close = flagBottom + (flagTop - flagBottom) * (0.3 + Math.sin(progress * Math.PI * 4) * 0.2);
          high = Math.min(flagTop, close + 0.00005);
          low = Math.max(flagBottom, close - 0.00005);
        } else {
          const progress = i / 15;
          const breakoutStart = flagTopEnd;
          open = data[data.length - 1].close;
          close = breakoutStart + 0.00015 * (1 - progress);
          high = close + 0.0001;
          low = open - 0.00005;
        }
        
        data.push({
          time: time.toISOString(),
          open,
          high,
          low,
          close,
          volume: Math.floor((Math.random() * 500 + 300)),
        });
      }
      
      return data;
    })(),
    config: {
      pattern: 'flag',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-11-3: Графические фигуры (Голова и плечи)
  'lesson-11-3': {
    lessonId: 'lesson-11-3',
    chartType: 'PatternChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      const necklineStart = 1.1000;
      const necklineEnd = 1.1005;
      const leftShoulderPeak = 1.1015;
      const headPeak = 1.1025;
      const rightShoulderPeak = 1.1015;
      
      for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        let open, close, high, low;
        
        if (i > 50) {
          const progress = (i - 50) / 10;
          const targetPrice = necklineStart + (leftShoulderPeak - necklineStart) * progress;
          open = i === 59 ? basePrice : data[data.length - 1].close;
          close = targetPrice;
          high = close + 0.0001;
          low = open - 0.00005;
        } else if (i === 50) {
          open = data[data.length - 1].close;
          close = leftShoulderPeak;
          high = leftShoulderPeak + 0.00005;
          low = open - 0.00005;
        } else if (i > 40) {
          const progress = (i - 40) / 10;
          const necklinePrice = necklineStart + (necklineEnd - necklineStart) * (progress * 0.3);
          open = data[data.length - 1].close;
          close = leftShoulderPeak - (leftShoulderPeak - necklinePrice) * progress;
          high = open + 0.00005;
          low = close - 0.0001;
        } else if (i > 30) {
          const progress = (i - 30) / 10;
          const necklinePrice = necklineStart + (necklineEnd - necklineStart) * 0.3;
          open = data[data.length - 1].close;
          close = necklinePrice + (headPeak - necklinePrice) * progress;
          high = close + 0.0001;
          low = open - 0.00005;
        } else if (i === 30) {
          open = data[data.length - 1].close;
          close = headPeak;
          high = headPeak + 0.00005;
          low = open - 0.00005;
        } else if (i > 20) {
          const progress = (i - 20) / 10;
          const necklinePrice = necklineStart + (necklineEnd - necklineStart) * 0.6;
          open = data[data.length - 1].close;
          close = headPeak - (headPeak - necklinePrice) * progress;
          high = open + 0.00005;
          low = close - 0.0001;
        } else if (i > 10) {
          const progress = (i - 10) / 10;
          const necklinePrice = necklineStart + (necklineEnd - necklineStart) * 0.6;
          open = data[data.length - 1].close;
          close = necklinePrice + (rightShoulderPeak - necklinePrice) * progress;
          high = close + 0.0001;
          low = open - 0.00005;
        } else if (i === 10) {
          open = data[data.length - 1].close;
          close = rightShoulderPeak;
          high = rightShoulderPeak + 0.00005;
          low = open - 0.00005;
        } else {
          const progress = i / 10;
          const necklinePrice = necklineStart + (necklineEnd - necklineStart) * 0.9;
          open = data[data.length - 1].close;
          close = rightShoulderPeak - (rightShoulderPeak - (necklinePrice - 0.001)) * progress;
          high = open + 0.00005;
          low = close - 0.00015;
        }
        
        data.push({
          time: time.toISOString(),
          open,
          high,
          low,
          close,
          volume: Math.floor((Math.random() * 500 + 300)),
        });
      }
      
      return data;
    })(),
    config: {
      pattern: 'head_shoulders',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-11-5: Гармонические паттерны (Бабочка)
  'lesson-11-5': {
    lessonId: 'lesson-11-5',
    chartType: 'PatternChart',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      let currentPrice = basePrice;
      const pointX = basePrice;
      const pointA = basePrice + 0.002;
      const pointB = basePrice + 0.0008;
      const pointC = basePrice + 0.0015;
      const pointD = basePrice - 0.0005;
      
      for (let i = 49; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        const phase = Math.floor(i / 10);
        
        if (phase >= 4) {
          const progress = (i - 40) / 10;
          currentPrice = pointX + (pointA - pointX) * progress;
        } else if (phase === 3) {
          const progress = (i - 30) / 10;
          currentPrice = pointA - (pointA - pointB) * progress;
        } else if (phase === 2) {
          const progress = (i - 20) / 10;
          currentPrice = pointB + (pointC - pointB) * progress;
        } else if (phase === 1) {
          const progress = (i - 10) / 10;
          currentPrice = pointC - (pointC - pointD) * progress;
        } else {
          const progress = i / 10;
          currentPrice = pointD + (pointB - pointD) * progress * 0.3;
        }
        
        const open = i === 49 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = 0.0002;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      pattern: 'butterfly',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-3-1: Стратегия "Тренд - мой друг"
  'lesson-3-1': {
    lessonId: 'lesson-3-1',
    chartType: 'StrategyExample',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      let currentPrice = basePrice;
      let trend = 0.00008;
      
      for (let i = 39; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        const phase = Math.floor(i / 10);
        
        if (phase >= 3) {
          trend = 0.0001;
          currentPrice += trend + (Math.random() - 0.5) * 0.0003;
        } else if (phase === 2) {
          trend = -0.00005;
          currentPrice += trend + (Math.random() - 0.5) * 0.0002;
        } else {
          trend = 0.00008;
          currentPrice += trend + (Math.random() - 0.5) * 0.0003;
        }
        
        const open = i === 39 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = Math.abs(trend) + 0.0002;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      strategy: 'trend',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-3-2: Стратегия "Отскок от уровней"
  'lesson-3-2': {
    lessonId: 'lesson-3-2',
    chartType: 'StrategyExample',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      const supportLevel = 1.0980;
      let currentPrice = basePrice;
      
      for (let i = 39; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        
        if (currentPrice > supportLevel + 0.0005) {
          currentPrice -= 0.00005 + (Math.random() - 0.5) * 0.0003;
        } else if (currentPrice <= supportLevel + 0.0002) {
          currentPrice = supportLevel + 0.0004 + Math.random() * 0.0002;
        } else {
          currentPrice += 0.00006 + (Math.random() - 0.5) * 0.0002;
        }
        
        const open = i === 39 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = 0.0003;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      strategy: 'bounce',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-3-3: Стратегия "Пробой уровней"
  'lesson-3-3': {
    lessonId: 'lesson-3-3',
    chartType: 'StrategyExample',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      const resistanceLevel = 1.1020;
      let currentPrice = basePrice;
      
      for (let i = 39; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        
        if (i > 20) {
          currentPrice += 0.00003 + (Math.random() - 0.5) * 0.0002;
        } else if (i === 20) {
          currentPrice = resistanceLevel + 0.0001;
        } else {
          currentPrice += 0.00008 + (Math.random() - 0.5) * 0.0003;
        }
        
        const open = i === 39 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = 0.0003;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      strategy: 'breakout',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-3-4: Стратегия "Торговля на новостях"
  'lesson-3-4': {
    lessonId: 'lesson-3-4',
    chartType: 'StrategyExample',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      let currentPrice = basePrice;
      
      for (let i = 39; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        
        if (i === 20) {
          currentPrice += 0.0015;
        } else {
          currentPrice += (Math.random() - 0.5) * 0.0002;
        }
        
        const open = i === 39 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = i === 20 ? 0.0008 : 0.0002;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      strategy: 'news',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-3-5: Стратегия "Зона удара"
  'lesson-3-5': {
    lessonId: 'lesson-3-5',
    chartType: 'StrategyExample',
    data: (() => {
      const basePrice = 1.1000;
      const data: CandlestickData[] = [];
      const now = new Date();
      
      let currentPrice = basePrice;
      let trend = 0.00005;
      
      for (let i = 39; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 60 * 1000);
        
        if (i % 10 === 0) {
          trend = (Math.random() - 0.5) * 0.0001;
        }
        
        currentPrice += trend + (Math.random() - 0.5) * 0.0002;
        
        const open = i === 39 ? basePrice : data[data.length - 1].close;
        const close = currentPrice;
        const bodySize = Math.abs(close - open);
        const volatility = 0.0003;
        const upperShadow = Math.random() * volatility * 0.3;
        const lowerShadow = Math.random() * volatility * 0.3;
        
        data.push({
          time: time.toISOString(),
          open,
          high: Math.max(open, close) + upperShadow,
          low: Math.min(open, close) - lowerShadow,
          close,
          volume: Math.floor((Math.random() * 500 + 300) * (1 + bodySize / volatility)),
        });
      }
      
      return data;
    })(),
    config: {
      strategy: 'strike_zone',
      interactive: true,
      timeframe: 'M15',
    },
  },

  // lesson-8-1: Торговые сессии
  'lesson-8-1': {
    lessonId: 'lesson-8-1',
    chartType: 'SessionActivityChart',
    config: {
      timeframe: 'M15',
      interactive: true,
    },
  },

  // lesson-9-2: Торговля на новостях
  'lesson-9-2': {
    lessonId: 'lesson-9-2',
    chartType: 'NewsImpactChart',
    config: {
      timeframe: 'M15',
      interactive: true,
    },
  },
  // InteractiveExample конфигурации для каждого паттерна
  'lesson-11-1-hammer-InteractiveExample': {
    lessonId: 'lesson-11-1-hammer',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: нисходящий тренд от ~8 до ~5.5, молот на ~5.2-5.7, восходящий до ~7.5
      // Масштабируем для валютной пары: 1.0800 -> 1.0550 -> 1.0750
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Нисходящий тренд (10 свечей для детализации)
      const downtrend = [
        { open: 1.0800, close: 1.0785, high: 1.0805, low: 1.0780 },
        { open: 1.0785, close: 1.0770, high: 1.0788, low: 1.0765 },
        { open: 1.0770, close: 1.0755, high: 1.0775, low: 1.0750 },
        { open: 1.0755, close: 1.0740, high: 1.0758, low: 1.0735 },
        { open: 1.0740, close: 1.0725, high: 1.0745, low: 1.0720 },
        { open: 1.0725, close: 1.0710, high: 1.0728, low: 1.0705 },
        { open: 1.0710, close: 1.0695, high: 1.0715, low: 1.0690 },
        { open: 1.0695, close: 1.0680, high: 1.0698, low: 1.0675 },
        { open: 1.0680, close: 1.0665, high: 1.0685, low: 1.0660 },
        { open: 1.0665, close: 1.0650, high: 1.0668, low: 1.0645 },
      ];
      
      // Молот: маленькое зеленое тело вверху (~5.5-5.7), длинная нижняя тень до ~4.0
      // В валютной паре: тело ~1.0550-1.0570, тень до ~1.0400
      const hammer = {
        open: 1.0550,
        close: 1.0570, // Зеленое тело (close > open)
        high: 1.0572, // Маленькая верхняя тень
        low: 1.0400, // Очень длинная нижняя тень
      };
      
      // Восходящий тренд после молота (5 свечей для детализации)
      const uptrend = [
        { open: 1.0570, close: 1.0600, high: 1.0605, low: 1.0565 },
        { open: 1.0600, close: 1.0630, high: 1.0635, low: 1.0595 },
        { open: 1.0630, close: 1.0660, high: 1.0665, low: 1.0625 },
        { open: 1.0660, close: 1.0700, high: 1.0705, low: 1.0655 },
        { open: 1.0700, close: 1.0750, high: 1.0755, low: 1.0695 },
      ];
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (downtrend.length - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 0 * 15 * 60 * 1000).toISOString(),
        ...hammer,
        volume: 400,
      });
      
      candleIndex = 1;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() + candleIndex * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 380,
        });
        candleIndex++;
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Паттерн Молот - разворот вверх',
      description: 'Молот формируется в конце нисходящего тренда. Длинная нижняя тень показывает, что продавцы пытались опустить цену, но покупатели отбили атаку.',
      timeframeDescription: {
        M1: '1 минута - молот формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс для входа',
        M15: '15 минут - оптимальный таймфрейм для молота, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал, меньше ложных срабатываний',
        H1: '1 час - сильный разворотный сигнал, подходит для начинающих',
        H4: '4 часа - очень надежный паттерн, но меньше возможностей',
      },
    },
  },
  'lesson-11-1-hanging-man-InteractiveExample': {
    lessonId: 'lesson-11-1-hanging-man',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: восходящий тренд от ~4.2 до ~6.8, повешенный на ~6.7, нисходящий до ~4.9
      // Масштабируем: 1.0420 -> 1.0680 -> 1.0490
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Восходящий тренд (6 свечей)
      const uptrend = [
        { open: 1.0420, close: 1.0450, high: 1.0455, low: 1.0415 },
        { open: 1.0450, close: 1.0480, high: 1.0485, low: 1.0445 },
        { open: 1.0480, close: 1.0510, high: 1.0515, low: 1.0475 },
        { open: 1.0510, close: 1.0540, high: 1.0545, low: 1.0505 },
        { open: 1.0540, close: 1.0570, high: 1.0575, low: 1.0535 },
        { open: 1.0570, close: 1.0680, high: 1.0685, low: 1.0565 },
      ];
      
      // Повешенный: маленькое красное тело вверху (~6.7), длинная нижняя тень до ~5.3
      // В валютной паре: тело ~1.0670, тень до ~1.0530
      const hangingMan = {
        open: 1.0670,
        close: 1.0665, // Красное тело (close < open)
        high: 1.0672, // Маленькая верхняя тень
        low: 1.0530, // Очень длинная нижняя тень
      };
      
      // Нисходящий тренд после повешенного (5 свечей для детализации)
      const downtrend = [
        { open: 1.0665, close: 1.0630, high: 1.0635, low: 1.0625 },
        { open: 1.0630, close: 1.0600, high: 1.0605, low: 1.0595 },
        { open: 1.0600, close: 1.0570, high: 1.0575, low: 1.0565 },
        { open: 1.0570, close: 1.0540, high: 1.0545, low: 1.0535 },
        { open: 1.0540, close: 1.0490, high: 1.0495, low: 1.0485 },
      ];
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() - (uptrend.length + 3 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 3 * 15 * 60 * 1000).toISOString(),
        ...hangingMan,
        volume: 400,
      });
      
      candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (2 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 380,
        });
        candleIndex++;
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Паттерн Повешенный - разворот вниз',
      description: 'Повешенный формируется в конце восходящего тренда. Длинная нижняя тень показывает, что покупатели теряют силу.',
      timeframeDescription: {
        M1: '1 минута - паттерн формируется быстро, требует быстрой реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал разворота',
        H1: '1 час - сильный разворотный сигнал',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-bullish-engulfing-InteractiveExample': {
    lessonId: 'lesson-11-1-bullish-engulfing',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: нисходящий от ~7.0 до ~5.5, первая красная open~5.5 close~5.0, вторая зеленая open~4.8 close~5.9, восходящий до ~7.5
      // Масштабируем: 1.0700 -> 1.0550 -> 1.0480 -> 1.0590 -> 1.0750
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Нисходящий тренд (4 свечи)
      const downtrend = [
        { open: 1.0700, close: 1.0670, high: 1.0705, low: 1.0665 },
        { open: 1.0670, close: 1.0620, high: 1.0625, low: 1.0615 },
        { open: 1.0620, close: 1.0590, high: 1.0595, low: 1.0585 },
        { open: 1.0590, close: 1.0550, high: 1.0555, low: 1.0545 },
      ];
      
      // Первая свеча паттерна: медвежья
      const firstCandle = {
        open: 1.0550,
        close: 1.0500, // Красная
        high: 1.0556, // Маленькая верхняя тень
        low: 1.0490, // Нижняя тень
      };
      
      // Вторая свеча: бычья, полностью поглощает первую
      const secondCandle = {
        open: 1.0480, // Ниже close первой
        close: 1.0590, // Выше open первой
        high: 1.0600, // Выше high первой
        low: 1.0470, // Ниже low первой
      };
      
      // Восходящий тренд после (3 свечи)
      const uptrend = [
        { open: 1.0590, close: 1.0660, high: 1.0665, low: 1.0585 },
        { open: 1.0660, close: 1.0700, high: 1.0705, low: 1.0655 },
        { open: 1.0700, close: 1.0750, high: 1.0755, low: 1.0695 },
      ];
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (downtrend.length + 2 + 3 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 5 * 15 * 60 * 1000).toISOString(),
        ...firstCandle,
        volume: 380,
      });
      
      data.push({
        time: new Date(now.getTime() - 4 * 15 * 60 * 1000).toISOString(),
        ...secondCandle,
        volume: 450,
      });
      
      candleIndex = 0;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() - (3 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 380,
        });
        candleIndex++;
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Бычье поглощение - сильный разворот вверх',
      description: 'Бычье поглощение состоит из двух свечей: первая медвежья, вторая бычья полностью поглощает первую. Показывает полный контроль покупателей.',
      timeframeDescription: {
        M1: '1 минута - поглощение формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четко, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал разворота',
        H1: '1 час - сильный разворотный сигнал',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-bearish-engulfing-InteractiveExample': {
    lessonId: 'lesson-11-1-bearish-engulfing',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: восходящий от ~4.0 до ~6.2, первая зеленая open~5.8 close~6.2, вторая красная open~6.4 close~5.4, нисходящий до ~3.9
      // Масштабируем: 1.0400 -> 1.0620 -> 1.0640 -> 1.0540 -> 1.0390
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Восходящий тренд (4 свечи)
      const uptrend = [
        { open: 1.0400, close: 1.0425, high: 1.0430, low: 1.0395 },
        { open: 1.0425, close: 1.0475, high: 1.0480, low: 1.0420 },
        { open: 1.0475, close: 1.0525, high: 1.0530, low: 1.0470 },
        { open: 1.0525, close: 1.0580, high: 1.0585, low: 1.0520 },
      ];
      
      // Первая свеча паттерна: бычья
      const firstCandle = {
        open: 1.0580,
        close: 1.0620, // Зеленая
        high: 1.0625, // Верхняя тень
        low: 1.0575, // Нижняя тень
      };
      
      // Вторая свеча: медвежья, полностью поглощает первую
      const secondCandle = {
        open: 1.0640, // Выше close первой
        close: 1.0540, // Ниже open первой
        high: 1.0645, // Выше high первой
        low: 1.0535, // Ниже low первой
      };
      
      // Нисходящий тренд после (3 свечи)
      const downtrend = [
        { open: 1.0540, close: 1.0500, high: 1.0505, low: 1.0495 },
        { open: 1.0500, close: 1.0450, high: 1.0455, low: 1.0445 },
        { open: 1.0450, close: 1.0390, high: 1.0395, low: 1.0385 },
      ];
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() - (uptrend.length + 2 + 3 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 5 * 15 * 60 * 1000).toISOString(),
        ...firstCandle,
        volume: 380,
      });
      
      data.push({
        time: new Date(now.getTime() - 4 * 15 * 60 * 1000).toISOString(),
        ...secondCandle,
        volume: 450,
      });
      
      candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (3 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 380,
        });
        candleIndex++;
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Медвежье поглощение - сильный разворот вниз',
      description: 'Медвежье поглощение состоит из двух свечей: первая бычья, вторая медвежья полностью поглощает первую. Показывает полный контроль продавцов.',
      timeframeDescription: {
        M1: '1 минута - поглощение формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четко, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал разворота',
        H1: '1 час - сильный разворотный сигнал',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-morning-star-InteractiveExample': {
    lessonId: 'lesson-11-1-morning-star',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: нисходящий от ~7.9 до ~5.5, первая красная open~6.5 close~5.5, звезда open~5.2 close~5.3, третья зеленая open~5.5 close~6.5, восходящий до ~7.8
      // Масштабируем: 1.0790 -> 1.0550 -> 1.0520 -> 1.0530 -> 1.0550 -> 1.0650 -> 1.0780
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Нисходящий тренд (3 свечи)
      const downtrend = [
        { open: 1.0790, close: 1.0760, high: 1.0795, low: 1.0755 },
        { open: 1.0760, close: 1.0710, high: 1.0765, low: 1.0705 },
        { open: 1.0710, close: 1.0660, high: 1.0715, low: 1.0655 },
      ];
      
      // Первая свеча паттерна: медвежья (большая)
      const firstCandle = {
        open: 1.0650,
        close: 1.0550, // Красная
        high: 1.0655,
        low: 1.0545,
      };
      
      // Вторая свеча: маленькая звезда (гэп вниз)
      const star = {
        open: 1.0520, // Гэп вниз от close первой
        close: 1.0530, // Маленькое зеленое тело
        high: 1.0535,
        low: 1.0515,
      };
      
      // Третья свеча: бычья (гэп вверх, закрывается выше середины первой)
      const thirdCandle = {
        open: 1.0550, // Гэп вверх от close звезды
        close: 1.0650, // Выше середины первой (середина ~1.0600)
        high: 1.0655,
        low: 1.0545,
      };
      
      // Восходящий тренд после (2 свечи)
      const uptrend = [
        { open: 1.0650, close: 1.0740, high: 1.0745, low: 1.0645 },
        { open: 1.0740, close: 1.0780, high: 1.0785, low: 1.0735 },
      ];
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (downtrend.length + 3 + 2 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 5 * 15 * 60 * 1000).toISOString(),
        ...firstCandle,
        volume: 400,
      });
      
      data.push({
        time: new Date(now.getTime() - 4 * 15 * 60 * 1000).toISOString(),
        ...star,
        volume: 300,
      });
      
      data.push({
        time: new Date(now.getTime() - 3 * 15 * 60 * 1000).toISOString(),
        ...thirdCandle,
        volume: 450,
      });
      
      candleIndex = 0;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() - (2 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 380,
        });
        candleIndex++;
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Утренняя звезда - разворот вверх',
      description: 'Утренняя звезда состоит из трех свечей: медвежья, маленькая звезда, бычья. Три свечи показывают смену настроений от медвежьих к бычьим.',
      timeframeDescription: {
        M1: '1 минута - паттерн формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал разворота',
        H1: '1 час - сильный разворотный сигнал',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-evening-star-InteractiveExample': {
    lessonId: 'lesson-11-1-evening-star',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: восходящий от ~4.0 до ~6.5, первая зеленая open~6.0 close~6.5, звезда open~6.7 close~6.75, третья красная open~6.5 close~5.5, нисходящий до ~4.1
      // Масштабируем: 1.0400 -> 1.0650 -> 1.0600 -> 1.0650 -> 1.0670 -> 1.0675 -> 1.0650 -> 1.0550 -> 1.0410
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Восходящий тренд (3 свечи)
      const uptrend = [
        { open: 1.0400, close: 1.0440, high: 1.0445, low: 1.0395 },
        { open: 1.0440, close: 1.0490, high: 1.0495, low: 1.0435 },
        { open: 1.0490, close: 1.0540, high: 1.0545, low: 1.0485 },
      ];
      
      // Первая свеча паттерна: бычья (большая)
      const firstCandle = {
        open: 1.0600,
        close: 1.0650, // Зеленая
        high: 1.0655,
        low: 1.0595,
      };
      
      // Вторая свеча: маленькая звезда (гэп вверх)
      const star = {
        open: 1.0670, // Гэп вверх от close первой
        close: 1.0675, // Маленькое красное тело
        high: 1.0680,
        low: 1.0660,
      };
      
      // Третья свеча: медвежья (гэп вниз, закрывается ниже середины первой)
      const thirdCandle = {
        open: 1.0650, // Гэп вниз от close звезды
        close: 1.0550, // Ниже середины первой (середина ~1.0625)
        high: 1.0655,
        low: 1.0545,
      };
      
      // Нисходящий тренд после (2 свечи)
      const downtrend = [
        { open: 1.0550, close: 1.0500, high: 1.0505, low: 1.0495 },
        { open: 1.0500, close: 1.0410, high: 1.0415, low: 1.0405 },
      ];
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() - (uptrend.length + 3 + 2 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 5 * 15 * 60 * 1000).toISOString(),
        ...firstCandle,
        volume: 400,
      });
      
      data.push({
        time: new Date(now.getTime() - 4 * 15 * 60 * 1000).toISOString(),
        ...star,
        volume: 300,
      });
      
      data.push({
        time: new Date(now.getTime() - 3 * 15 * 60 * 1000).toISOString(),
        ...thirdCandle,
        volume: 450,
      });
      
      candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (2 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 380,
        });
        candleIndex++;
      }
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Вечерняя звезда - разворот вниз',
      description: 'Вечерняя звезда состоит из трех свечей: бычья, маленькая звезда, медвежья. Три свечи показывают смену настроений от бычьих к медвежьим.',
      timeframeDescription: {
        M1: '1 минута - паттерн формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал разворота',
        H1: '1 час - сильный разворотный сигнал',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-doji-InteractiveExample': {
    lessonId: 'lesson-11-1-doji',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: смешанное движение, доджи на ~6.5 с тенями от ~6.0 до ~7.0, затем разворот вниз
      // Масштабируем: 1.0600 -> 1.0620 -> 1.0650 -> 1.0630 -> 1.0660 -> 1.0650 (доджи) -> 1.0610
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Смешанное движение перед доджи (5 свечей)
      const before = [
        { open: 1.0600, close: 1.0610, high: 1.0620, low: 1.0580 },
        { open: 1.0620, close: 1.0600, high: 1.0640, low: 1.0590 },
        { open: 1.0630, close: 1.0650, high: 1.0660, low: 1.0620 },
        { open: 1.0630, close: 1.0620, high: 1.0650, low: 1.0610 },
        { open: 1.0650, close: 1.0660, high: 1.0670, low: 1.0640 },
      ];
      
      // Доджи: очень маленькое тело, длинные равные тени
      const doji = {
        open: 1.0650,
        close: 1.0650, // Открытие = закрытие
        high: 1.0700, // Длинная верхняя тень
        low: 1.0600, // Длинная нижняя тень
      };
      
      // Разворот вниз после доджи
      const after = {
        open: 1.0650,
        close: 1.0610, // Медвежья свеча
        high: 1.0658,
        low: 1.0605,
      };
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of before) {
        data.push({
          time: new Date(now.getTime() - (before.length + 1 + 1 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 1 * 15 * 60 * 1000).toISOString(),
        ...doji,
        volume: 400,
      });
      
      data.push({
        time: new Date(now.getTime() - 0 * 15 * 60 * 1000).toISOString(),
        ...after,
        volume: 380,
      });
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Доджи - неопределенность на рынке',
      description: 'Доджи показывает борьбу покупателей и продавцов. Открытие и закрытие почти равны. Сам по себе не дает сигнал - нужна следующая свеча для подтверждения.',
      timeframeDescription: {
        M1: '1 минута - доджи формируется часто, требует быстрой реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для подтверждения',
        M30: '30 минут - более надежный сигнал неопределенности',
        H1: '1 час - сильный сигнал неопределенности',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-inside-bar-InteractiveExample': {
    lessonId: 'lesson-11-1-inside-bar',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: восходящий тренд, материнская body ~6.0-7.5 high~8.0 low~5.9, внутренний body ~6.5-7.0 high~7.1 low~6.4, пробой вверх
      // Масштабируем: 1.0500 -> 1.0600 -> 1.0630 -> материнская 1.0600-1.0750 (high 1.0800, low 1.0590), внутренний 1.0650-1.0700 (high 1.0710, low 1.0640)
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Восходящий тренд (3 свечи)
      const uptrend = [
        { open: 1.0500, close: 1.0535, high: 1.0540, low: 1.0495 },
        { open: 1.0550, close: 1.0580, high: 1.0585, low: 1.0545 },
        { open: 1.0600, close: 1.0630, high: 1.0635, low: 1.0595 },
      ];
      
      // Материнская свеча: большая бычья
      const motherCandle = {
        open: 1.0600,
        close: 1.0750, // Большое зеленое тело
        high: 1.0800, // Высокая верхняя тень
        low: 1.0590, // Нижняя тень
      };
      
      // Внутренний бар: полностью внутри материнской
      const insideBar = {
        open: 1.0650,
        close: 1.0700, // Зеленое тело внутри материнской
        high: 1.0710, // Внутри high материнской
        low: 1.0640, // Внутри low материнской
      };
      
      // Пробой вверх после внутреннего бара
      const breakout = {
        open: 1.0700,
        close: 1.0800, // Пробой выше high материнской
        high: 1.0810,
        low: 1.0695,
      };
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of uptrend) {
        data.push({
          time: new Date(now.getTime() - (uptrend.length + 2 + 1 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 3 * 15 * 60 * 1000).toISOString(),
        ...motherCandle,
        volume: 450,
      });
      
      data.push({
        time: new Date(now.getTime() - 2 * 15 * 60 * 1000).toISOString(),
        ...insideBar,
        volume: 300,
      });
      
      data.push({
        time: new Date(now.getTime() - 1 * 15 * 60 * 1000).toISOString(),
        ...breakout,
        volume: 500,
      });
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Внутренний бар - консолидация',
      description: 'Внутренний бар показывает паузу перед продолжением. Вторая свеча полностью внутри первой. Вход после пробоя материнской свечи.',
      timeframeDescription: {
        M1: '1 минута - паттерн формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для пробоя',
        M30: '30 минут - более надежный сигнал консолидации',
        H1: '1 час - сильный сигнал паузы',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
  'lesson-11-1-outside-bar-InteractiveExample': {
    lessonId: 'lesson-11-1-outside-bar',
    chartType: 'InteractiveExample',
    data: (() => {
      // По изображению: нисходящий от ~7.0 до ~5.5, первая красная open~5.8 close~5.5 low~5.2, вторая зеленая open~5.0 close~7.0 high~7.5 low~4.2 (полностью поглощает)
      // Масштабируем: 1.0700 -> 1.0550 -> первая 1.0580-1.0550 (low 1.0520), вторая 1.0500-1.0700 (high 1.0750, low 1.0420)
      const data: CandlestickData[] = [];
      const now = new Date();
      
      // Нисходящий тренд (3 свечи)
      const downtrend = [
        { open: 1.0700, close: 1.0670, high: 1.0705, low: 1.0665 },
        { open: 1.0670, close: 1.0620, high: 1.0625, low: 1.0615 },
        { open: 1.0620, close: 1.0570, high: 1.0575, low: 1.0565 },
      ];
      
      // Первая свеча: маленькая красная
      const firstCandle = {
        open: 1.0580,
        close: 1.0550, // Красная
        high: 1.0585,
        low: 1.0520, // Длинная нижняя тень
      };
      
      // Вторая свеча: большая зеленая, полностью поглощает первую
      const secondCandle = {
        open: 1.0500, // Ниже low первой
        close: 1.0700, // Выше high первой
        high: 1.0750, // Выше high первой
        low: 1.0420, // Ниже low первой
      };
      
      // Восходящий тренд после (1 свеча)
      const uptrend = {
        open: 1.0700,
        close: 1.0750,
        high: 1.0755,
        low: 1.0695,
      };
      
      // Собираем все свечи
      let candleIndex = 0;
      for (const candle of downtrend) {
        data.push({
          time: new Date(now.getTime() - (downtrend.length + 2 + 1 - candleIndex) * 15 * 60 * 1000).toISOString(),
          ...candle,
          volume: 350,
        });
        candleIndex++;
      }
      
      data.push({
        time: new Date(now.getTime() - 3 * 15 * 60 * 1000).toISOString(),
        ...firstCandle,
        volume: 300,
      });
      
      data.push({
        time: new Date(now.getTime() - 2 * 15 * 60 * 1000).toISOString(),
        ...secondCandle,
        volume: 500,
      });
      
      data.push({
        time: new Date(now.getTime() - 1 * 15 * 60 * 1000).toISOString(),
        ...uptrend,
        volume: 400,
      });
      
      return data;
    })(),
    config: {
      timeframe: 'M15',
      interactive: true,
      showLevels: true,
      showPatterns: true,
      title: 'Внешний бар - пробой или разворот',
      description: 'Внешний бар показывает сильное движение. Вторая свеча полностью поглощает первую. Может быть как разворотом, так и продолжением тренда.',
      timeframeDescription: {
        M1: '1 минута - паттерн формируется быстро, требует мгновенной реакции',
        M5: '5 минут - паттерн виден четче, хороший баланс',
        M15: '15 минут - оптимальный таймфрейм, достаточное время для анализа',
        M30: '30 минут - более надежный сигнал',
        H1: '1 час - сильный сигнал движения',
        H4: '4 часа - очень надежный паттерн',
      },
    },
  },
};

/**
 * Получает конфигурацию графика для урока
 * @param lessonId ID урока
 * @param chartType Тип графика
 * @returns Конфигурация графика или null, если не найдена
 */
export function getLessonChartConfig(
  lessonId: string,
  chartType: ChartType
): LessonChartConfig | null {
  if (!lessonId || !chartType) {
    return null;
  }
  
  // Сначала ищем точное совпадение lessonId
  const directConfig = lessonChartConfigs[lessonId];
  if (directConfig && directConfig.chartType === chartType) {
    return directConfig;
  }
  
  // Затем ищем с суффиксом chartType
  const keyWithSuffix = `${lessonId}-${chartType}`;
  const suffixedConfig = lessonChartConfigs[keyWithSuffix];
  if (suffixedConfig && suffixedConfig.chartType === chartType) {
    return suffixedConfig;
  }
  
  return null;
}
