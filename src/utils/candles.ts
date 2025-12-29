import { type CandleData } from "@/charts/Candle";

/**
 * Генерирует тестовые данные свечей
 */
export function generateCandles(
  count: number,
  startPrice: number = 1.0800,
  volatility: number = 0.002
): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = startPrice;
  const baseTime = Date.now() - count * 15 * 60 * 1000; // 15 минут на свечу
  
  for (let i = 0; i < count; i++) {
    // Генерируем случайное движение
    const change = (Math.random() - 0.5) * volatility * 2;
    const open = currentPrice;
    const close = open + change;
    
    // Генерируем high и low
    const range = Math.abs(change) + Math.random() * volatility;
    const high = Math.max(open, close) + Math.random() * range * 0.5;
    const low = Math.min(open, close) - Math.random() * range * 0.5;
    
    // Генерируем объем
    const volume = Math.random() * 1000 + 100;
    
    candles.push({
      open,
      close,
      high,
      low,
      volume,
      timestamp: baseTime + i * 15 * 60 * 1000,
    });
    
    currentPrice = close;
  }
  
  return candles;
}

/**
 * Генерирует свечи с паттерном
 */
export function generateCandlesWithPattern(
  patternId: string,
  baseCandles: CandleData[] = []
): CandleData[] {
  const patternCandles: CandleData[] = [...baseCandles];
  
  switch (patternId) {
    case "hammer": {
      const lastPrice = baseCandles[baseCandles.length - 1]?.close || 1.0800;
      patternCandles.push({
        open: lastPrice - 0.0005,
        close: lastPrice - 0.0002,
        high: lastPrice + 0.0001,
        low: lastPrice - 0.002, // Длинная нижняя тень
        volume: 500,
        timestamp: Date.now(),
      });
      break;
    }
    
    case "bullish-engulfing": {
      const lastPrice = baseCandles[baseCandles.length - 1]?.close || 1.0800;
      // Медвежья свеча
      patternCandles.push({
        open: lastPrice,
        close: lastPrice - 0.001,
        high: lastPrice + 0.0002,
        low: lastPrice - 0.0015,
        volume: 400,
        timestamp: Date.now() - 15 * 60 * 1000,
      });
      // Бычья свеча (поглощает предыдущую)
      patternCandles.push({
        open: lastPrice - 0.0012,
        close: lastPrice + 0.0005,
        high: lastPrice + 0.0008,
        low: lastPrice - 0.0015,
        volume: 600,
        timestamp: Date.now(),
      });
      break;
    }
    
    case "morning-star": {
      const lastPrice = baseCandles[baseCandles.length - 1]?.close || 1.0800;
      // Первая медвежья свеча
      patternCandles.push({
        open: lastPrice,
        close: lastPrice - 0.001,
        high: lastPrice + 0.0002,
        low: lastPrice - 0.0015,
        volume: 400,
        timestamp: Date.now() - 30 * 60 * 1000,
      });
      // Вторая маленькая свеча (звезда)
      patternCandles.push({
        open: lastPrice - 0.0012,
        close: lastPrice - 0.0011,
        high: lastPrice - 0.0008,
        low: lastPrice - 0.0015,
        volume: 200,
        timestamp: Date.now() - 15 * 60 * 1000,
      });
      // Третья бычья свеча
      patternCandles.push({
        open: lastPrice - 0.0011,
        close: lastPrice + 0.0005,
        high: lastPrice + 0.0008,
        low: lastPrice - 0.0015,
        volume: 600,
        timestamp: Date.now(),
      });
      break;
    }
    
    case "head-and-shoulders": {
      // Генерируем паттерн "Голова и плечи" с правильной формой
      const basePrice = baseCandles[baseCandles.length - 1]?.close || 1.0800;
      const neckline = basePrice;
      const shoulderHeight = 0.003;
      const headHeight = 0.005;
      const baseTime = Date.now();
      
      let candleIndex = 0;
      
      // Восходящий тренд перед паттерном (5 свечей)
      for (let i = 0; i < 5; i++) {
        const price = neckline - 0.001 + (i / 4) * 0.0005;
        patternCandles.push({
          open: price - 0.0002,
          close: price,
          high: price + 0.0003,
          low: price - 0.0005,
          volume: 300 + Math.random() * 100,
          timestamp: baseTime - (25 - i) * 15 * 60 * 1000,
        });
        candleIndex++;
      }
      
      // Левое плечо (6 свечей) - подъем и спад
      for (let i = 0; i < 6; i++) {
        const progress = i / 5;
        const peak = neckline + shoulderHeight * Math.sin(progress * Math.PI);
        const isRising = progress < 0.5;
        patternCandles.push({
          open: isRising ? neckline + (peak - neckline) * 0.6 : peak - 0.0002,
          close: peak,
          high: peak + 0.0004,
          low: isRising ? neckline - 0.0001 : neckline - 0.0003,
          volume: 400 + Math.random() * 200,
          timestamp: baseTime - (20 - i) * 15 * 60 * 1000,
        });
        candleIndex++;
      }
      
      // Спад к линии шеи (4 свечи)
      for (let i = 0; i < 4; i++) {
        const progress = i / 3;
        const price = neckline + (shoulderHeight - shoulderHeight * progress * 0.8);
        patternCandles.push({
          open: price + 0.0002,
          close: price,
          high: price + 0.0003,
          low: neckline - 0.0002,
          volume: 350 + Math.random() * 100,
          timestamp: baseTime - (14 - i) * 15 * 60 * 1000,
        });
        candleIndex++;
      }
      
      // Голова (7 свечей) - самый высокий пик
      for (let i = 0; i < 7; i++) {
        const progress = i / 6;
        const peak = neckline + headHeight * Math.sin(progress * Math.PI);
        const isRising = progress < 0.5;
        patternCandles.push({
          open: isRising ? neckline + (peak - neckline) * 0.6 : peak - 0.0003,
          close: peak,
          high: peak + 0.0005,
          low: isRising ? neckline - 0.0001 : neckline - 0.0004,
          volume: 500 + Math.random() * 200,
          timestamp: baseTime - (10 - i) * 15 * 60 * 1000,
        });
        candleIndex++;
      }
      
      // Спад к линии шеи (4 свечи)
      for (let i = 0; i < 4; i++) {
        const progress = i / 3;
        const price = neckline + (headHeight - headHeight * progress * 0.8);
        patternCandles.push({
          open: price + 0.0003,
          close: price,
          high: price + 0.0004,
          low: neckline - 0.0002,
          volume: 350 + Math.random() * 100,
          timestamp: baseTime - (3 - i) * 15 * 60 * 1000,
        });
        candleIndex++;
      }
      
      // Правое плечо (5 свечей) - на уровне левого
      for (let i = 0; i < 5; i++) {
        const progress = i / 4;
        const peak = neckline + shoulderHeight * Math.sin(progress * Math.PI);
        const isRising = progress < 0.5;
        patternCandles.push({
          open: isRising ? neckline + (peak - neckline) * 0.6 : peak - 0.0002,
          close: peak,
          high: peak + 0.0004,
          low: isRising ? neckline - 0.0001 : neckline - 0.0003,
          volume: 400 + Math.random() * 200,
          timestamp: baseTime + (i + 1) * 15 * 60 * 1000,
        });
        candleIndex++;
      }
      
      break;
    }
    
    case "inverse-head-and-shoulders": {
      // Генерируем перевёрнутый паттерн "Голова и плечи"
      const basePrice = baseCandles[baseCandles.length - 1]?.close || 1.0800;
      const neckline = basePrice;
      const shoulderDepth = 0.003;
      const headDepth = 0.005;
      const baseTime = Date.now();
      
      // Нисходящий тренд перед паттерном (5 свечей)
      for (let i = 0; i < 5; i++) {
        const price = neckline + 0.001 - (i / 4) * 0.0005;
        patternCandles.push({
          open: price + 0.0002,
          close: price,
          high: price + 0.0005,
          low: price - 0.0003,
          volume: 300 + Math.random() * 100,
          timestamp: baseTime - (25 - i) * 15 * 60 * 1000,
        });
      }
      
      // Левое плечо (6 свечей) - падение и подъем
      for (let i = 0; i < 6; i++) {
        const progress = i / 5;
        const trough = neckline - shoulderDepth * Math.sin(progress * Math.PI);
        const isFalling = progress < 0.5;
        patternCandles.push({
          open: isFalling ? neckline - (neckline - trough) * 0.6 : trough + 0.0002,
          close: trough,
          high: isFalling ? neckline + 0.0001 : neckline + 0.0003,
          low: trough - 0.0004,
          volume: 400 + Math.random() * 200,
          timestamp: baseTime - (20 - i) * 15 * 60 * 1000,
        });
      }
      
      // Подъем к линии шеи (4 свечи)
      for (let i = 0; i < 4; i++) {
        const progress = i / 3;
        const price = neckline - (shoulderDepth - shoulderDepth * progress * 0.8);
        patternCandles.push({
          open: price - 0.0002,
          close: price,
          high: neckline + 0.0002,
          low: price - 0.0003,
          volume: 350 + Math.random() * 100,
          timestamp: baseTime - (14 - i) * 15 * 60 * 1000,
        });
      }
      
      // Голова (7 свечей) - самая глубокая впадина
      for (let i = 0; i < 7; i++) {
        const progress = i / 6;
        const trough = neckline - headDepth * Math.sin(progress * Math.PI);
        const isFalling = progress < 0.5;
        patternCandles.push({
          open: isFalling ? neckline - (neckline - trough) * 0.6 : trough + 0.0003,
          close: trough,
          high: isFalling ? neckline + 0.0001 : neckline + 0.0004,
          low: trough - 0.0005,
          volume: 500 + Math.random() * 200,
          timestamp: baseTime - (10 - i) * 15 * 60 * 1000,
        });
      }
      
      // Подъем к линии шеи (4 свечи)
      for (let i = 0; i < 4; i++) {
        const progress = i / 3;
        const price = neckline - (headDepth - headDepth * progress * 0.8);
        patternCandles.push({
          open: price - 0.0003,
          close: price,
          high: neckline + 0.0004,
          low: price - 0.0002,
          volume: 350 + Math.random() * 100,
          timestamp: baseTime - (3 - i) * 15 * 60 * 1000,
        });
      }
      
      // Правое плечо (5 свечей) - на уровне левого
      for (let i = 0; i < 5; i++) {
        const progress = i / 4;
        const trough = neckline - shoulderDepth * Math.sin(progress * Math.PI);
        const isFalling = progress < 0.5;
        patternCandles.push({
          open: isFalling ? neckline - (neckline - trough) * 0.6 : trough + 0.0002,
          close: trough,
          high: isFalling ? neckline + 0.0001 : neckline + 0.0003,
          low: trough - 0.0004,
          volume: 400 + Math.random() * 200,
          timestamp: baseTime + (i + 1) * 15 * 60 * 1000,
        });
      }
      
      break;
    }
    
    default:
      // Генерируем обычную свечу
      const price = baseCandles[baseCandles.length - 1]?.close || 1.0800;
      patternCandles.push({
        open: price,
        close: price + (Math.random() - 0.5) * 0.001,
        high: price + Math.random() * 0.001,
        low: price - Math.random() * 0.001,
        volume: 500,
        timestamp: Date.now(),
      });
  }
  
  return patternCandles;
}

/**
 * Генерирует свечи с трендом
 */
export function generateTrendCandles(
  count: number,
  trend: "up" | "down" | "sideways" = "up",
  startPrice: number = 1.0800
): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = startPrice;
  const baseTime = Date.now() - count * 15 * 60 * 1000;
  
  const trendMultiplier = trend === "up" ? 1 : trend === "down" ? -1 : 0;
  const trendStrength = 0.0005;
  
  for (let i = 0; i < count; i++) {
    const trendChange = trendMultiplier * trendStrength;
    const noise = (Math.random() - 0.5) * 0.0005;
    const change = trendChange + noise;
    
    const open = currentPrice;
    const close = open + change;
    const range = Math.abs(change) + Math.random() * 0.0003;
    const high = Math.max(open, close) + Math.random() * range * 0.5;
    const low = Math.min(open, close) - Math.random() * range * 0.5;
    
    candles.push({
      open,
      close,
      high,
      low,
      volume: Math.random() * 1000 + 100,
      timestamp: baseTime + i * 15 * 60 * 1000,
    });
    
    currentPrice = close;
  }
  
  return candles;
}

