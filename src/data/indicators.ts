import { type IndicatorData, type IndicatorType } from "@/charts/IndicatorPanel";
import { type CandleData } from "@/charts/Candle";

export interface IndicatorConfig {
  id: string;
  name: string;
  nameEn: string;
  type: IndicatorType;
  description: string;
  calculate: (candles: CandleData[], period?: number) => IndicatorData;
  defaultPeriod?: number;
  overbought?: number;
  oversold?: number;
}

// RSI расчет
function calculateRSI(candles: CandleData[], period: number = 14): IndicatorData {
  if (candles.length < period + 1) {
    return {
      type: "RSI",
      values: [],
      timestamps: [],
    };
  }
  
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  const rsiValues: number[] = [];
  const timestamps: number[] = [];
  
  for (let i = period; i < gains.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    }
    
    timestamps.push(candles[i].timestamp);
  }
  
  // Определяем сигналы
  const signals: IndicatorData["signals"] = [];
  for (let i = 1; i < rsiValues.length; i++) {
    if (rsiValues[i] < 30 && rsiValues[i - 1] >= 30) {
      signals.push({
        index: i,
        type: "buy",
        strength: (30 - rsiValues[i]) / 30,
      });
    } else if (rsiValues[i] > 70 && rsiValues[i - 1] <= 70) {
      signals.push({
        index: i,
        type: "sell",
        strength: (rsiValues[i] - 70) / 30,
      });
    }
  }
  
  return {
    type: "RSI",
    values: rsiValues,
    timestamps,
    signals,
    overbought: 70,
    oversold: 30,
  };
}

// MACD расчет
function calculateMACD(
  candles: CandleData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): IndicatorData {
  if (candles.length < slowPeriod + signalPeriod) {
    return {
      type: "MACD",
      values: [],
      timestamps: [],
    };
  }
  
  const closes = candles.map(c => c.close);
  
  // EMA расчет
  const ema = (values: number[], period: number): number[] => {
    const multiplier = 2 / (period + 1);
    const result: number[] = [];
    let emaValue = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(emaValue);
    
    for (let i = period; i < values.length; i++) {
      emaValue = (values[i] - emaValue) * multiplier + emaValue;
      result.push(emaValue);
    }
    
    return result;
  };
  
  const fastEMA = ema(closes, fastPeriod);
  const slowEMA = ema(closes, slowPeriod);
  
  // MACD линия
  const macdLine: number[] = [];
  const startIndex = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = startIndex + i;
    if (fastIndex >= 0 && fastIndex < fastEMA.length) {
      macdLine.push(fastEMA[fastIndex] - slowEMA[i]);
    }
  }
  
  // Signal линия (EMA от MACD)
  const signalLine = ema(macdLine, signalPeriod);
  
  // Histogram (MACD - Signal)
  const histogram: number[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = macdLine.length - signalLine.length + i;
    if (macdIndex >= 0) {
      histogram.push(macdLine[macdIndex] - signalLine[i]);
    }
  }
  
  // Сигналы пересечения
  const signals: IndicatorData["signals"] = [];
  for (let i = 1; i < signalLine.length; i++) {
    const macdIndex = macdLine.length - signalLine.length + i;
    const prevMacdIndex = macdLine.length - signalLine.length + i - 1;
    
    if (macdIndex > 0 && prevMacdIndex >= 0) {
      const macdCrossAbove = macdLine[macdIndex] > signalLine[i] && macdLine[prevMacdIndex] <= signalLine[i - 1];
      const macdCrossBelow = macdLine[macdIndex] < signalLine[i] && macdLine[prevMacdIndex] >= signalLine[i - 1];
      
      if (macdCrossAbove) {
        signals.push({
          index: i,
          type: "buy",
          strength: Math.abs(macdLine[macdIndex] - signalLine[i]) / Math.abs(macdLine[macdIndex] || 1),
        });
      } else if (macdCrossBelow) {
        signals.push({
          index: i,
          type: "sell",
          strength: Math.abs(macdLine[macdIndex] - signalLine[i]) / Math.abs(macdLine[macdIndex] || 1),
        });
      }
    }
  }
  
  return {
    type: "MACD",
    values: histogram,
    timestamps: candles.slice(slowPeriod + signalPeriod - 1).map(c => c.timestamp),
    signals,
  };
}

export const indicators: IndicatorConfig[] = [
  {
    id: "rsi",
    name: "RSI",
    nameEn: "RSI",
    type: "RSI",
    description: "Индекс относительной силы",
    calculate: calculateRSI,
    defaultPeriod: 14,
    overbought: 70,
    oversold: 30,
  },
  {
    id: "macd",
    name: "MACD",
    nameEn: "MACD",
    type: "MACD",
    description: "Схождение-расхождение скользящих средних",
    calculate: calculateMACD,
  },
];

export const getIndicatorById = (id: string): IndicatorConfig | undefined => {
  return indicators.find(i => i.id === id);
};




