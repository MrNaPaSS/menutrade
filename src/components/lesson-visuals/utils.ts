// Утилиты для генерации тестовых данных графиков

import type { CandlestickData } from './types';

export function generateCandlestickData(
  count: number = 50,
  basePrice: number = 1.1000,
  volatility: number = 0.002,
  timeframe: string = 'M15'
): CandlestickData[] {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice;
  let trend = 0.00005; // Небольшой тренд
  let momentum = 0;
  const now = new Date();
  
  // Определяем интервал в зависимости от таймфрейма
  const intervalMinutes = timeframe === 'M1' ? 1 : timeframe === 'M5' ? 5 : timeframe === 'M15' ? 15 : timeframe === 'M30' ? 30 : timeframe === 'H1' ? 60 : 240;
  
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    
    // Динамический тренд с коррекциями
    if (i % 10 === 0) {
      trend = (Math.random() - 0.5) * 0.0001;
    }
    
    // Инерция движения
    momentum = momentum * 0.7 + trend * 0.3;
    
    // Реалистичное движение цены
    const randomWalk = (Math.random() - 0.5) * volatility;
    const change = momentum + randomWalk;
    
    const open = currentPrice;
    const close = open + change;
    
    // Реалистичные тени свечей
    const bodySize = Math.abs(close - open);
    const upperShadow = Math.random() * volatility * 0.6;
    const lowerShadow = Math.random() * volatility * 0.6;
    
    const high = Math.max(open, close) + upperShadow;
    const low = Math.min(open, close) - lowerShadow;
    
    // Объём коррелирует с размером движения
    const volumeMultiplier = 1 + (bodySize / volatility) * 2;
    const volume = Math.floor((Math.random() * 500 + 300) * volumeMultiplier);
    
    data.push({
      time: time.toISOString(),
      open,
      high,
      low,
      close,
      volume,
    });
    
    currentPrice = close;
  }
  
  return data;
}

export function formatPrice(price: number, decimals: number = 4): string {
  return price.toFixed(decimals);
}

export function formatTime(time: string, timeframe: string): string {
  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (timeframe === 'H1' || timeframe === 'H4') {
    return `${hours}:${minutes}`;
  }
  return `${hours}:${minutes}`;
}

export function calculateSupportResistance(
  data: CandlestickData[],
  lookback: number = 20
): { support: number; resistance: number } {
  const highs: number[] = [];
  const lows: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i >= lookback) {
      const window = data.slice(i - lookback, i);
      highs.push(Math.max(...window.map(d => d.high)));
      lows.push(Math.min(...window.map(d => d.low)));
    }
  }
  
  const resistance = highs.length > 0 ? Math.max(...highs) : data[0].high;
  const support = lows.length > 0 ? Math.min(...lows) : data[0].low;
  
  return { support, resistance };
}

