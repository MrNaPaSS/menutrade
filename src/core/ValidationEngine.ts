import { type CandleData } from "@/charts/Candle";
import { type Level } from "@/charts/Levels";

export interface ValidationResult {
  valid: boolean;
  strength: number; // 0-1
  touches?: number;
  message?: string;
}

/**
 * Валидация уровня поддержки/сопротивления
 */
export function validateLevel(
  level: number,
  candles: CandleData[],
  threshold: number = 0.01 // 1% от цены
): ValidationResult {
  if (candles.length === 0) {
    return {
      valid: false,
      strength: 0,
      message: "Нет данных для проверки",
    };
  }
  
  // Находим касания уровня
  const touches = candles.filter((candle) => {
    const distanceToHigh = Math.abs(candle.high - level);
    const distanceToLow = Math.abs(candle.low - level);
    const minDistance = Math.min(distanceToHigh, distanceToLow);
    return minDistance <= threshold;
  });
  
  const touchCount = touches.length;
  const valid = touchCount >= 2;
  
  // Сила уровня зависит от количества касаний
  const strength = Math.min(1, touchCount / 5); // Максимум при 5+ касаниях
  
  let message = "";
  if (!valid) {
    message = `Слабый уровень: только ${touchCount} касание(й). Нужно минимум 2.`;
  } else if (strength < 0.5) {
    message = `Уровень подтвержден, но слабый (${touchCount} касания)`;
  } else {
    message = `Сильный уровень (${touchCount} касаний)`;
  }
  
  return {
    valid,
    strength,
    touches: touchCount,
    message,
};
}

/**
 * Валидация паттерна свечи
 */
export function validatePattern(
  patternId: string,
  candles: CandleData[],
  context?: {
    trend?: "up" | "down" | "sideways";
    nearLevel?: number;
  }
): ValidationResult {
  if (candles.length === 0) {
    return {
      valid: false,
      strength: 0,
      message: "Нет данных для проверки",
    };
  }
  
  // Базовая валидация для разных паттернов
  switch (patternId) {
    case "hammer":
      return validateHammer(candles, context);
    case "hanging-man":
      return validateHangingMan(candles, context);
    case "bullish-engulfing":
      return validateBullishEngulfing(candles, context);
    case "bearish-engulfing":
      return validateBearishEngulfing(candles, context);
    case "morning-star":
      return validateMorningStar(candles, context);
    case "evening-star":
      return validateEveningStar(candles, context);
    case "doji":
      return validateDoji(candles, context);
    default:
      return {
        valid: true,
        strength: 0.5,
        message: "Паттерн не требует валидации",
      };
  }
}

function validateHammer(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 1) {
    return { valid: false, strength: 0, message: "Недостаточно свечей" };
  }
  
  const candle = candles[candles.length - 1];
  const bodySize = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  
  // Молот: маленькое тело, длинная нижняя тень, короткая верхняя
  const isHammer = 
    lowerShadow >= bodySize * 2 &&
    upperShadow <= bodySize * 0.5 &&
    bodySize > 0;
  
  const valid = isHammer && (context?.trend === "down" || !context?.trend);
  const strength = isHammer ? 0.8 : 0;
  
  return {
    valid,
    strength,
    message: valid
      ? "Валидный паттерн Молот"
      : isHammer
      ? "Молот найден, но лучше искать в нисходящем тренде"
      : "Не соответствует паттерну Молот",
  };
}

function validateHangingMan(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 1) {
    return { valid: false, strength: 0, message: "Недостаточно свечей" };
  }
  
  const candle = candles[candles.length - 1];
  const bodySize = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  
  const isHangingMan = 
    lowerShadow >= bodySize * 2 &&
    upperShadow <= bodySize * 0.5 &&
    bodySize > 0;
  
  const valid = isHangingMan && (context?.trend === "up" || !context?.trend);
  const strength = isHangingMan ? 0.8 : 0;
  
  return {
    valid,
    strength,
    message: valid
      ? "Валидный паттерн Повешенный"
      : isHangingMan
      ? "Повешенный найден, но лучше искать в восходящем тренде"
      : "Не соответствует паттерну Повешенный",
  };
}

function validateBullishEngulfing(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 2) {
    return { valid: false, strength: 0, message: "Нужно минимум 2 свечи" };
  }
  
  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];
  
  const isEngulfing =
    prev.close < prev.open && // Первая свеча медвежья
    curr.close > curr.open && // Вторая свеча бычья
    curr.open < prev.close && // Открытие второй ниже закрытия первой
    curr.close > prev.open; // Закрытие второй выше открытия первой
  
  const valid = isEngulfing && (context?.trend === "down" || !context?.trend);
  const strength = isEngulfing ? 0.9 : 0;
  
  return {
    valid,
    strength,
    message: valid
      ? "Валидное Бычье поглощение"
      : isEngulfing
      ? "Поглощение найдено, но лучше искать в нисходящем тренде"
      : "Не соответствует паттерну Бычье поглощение",
  };
}

function validateBearishEngulfing(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 2) {
    return { valid: false, strength: 0, message: "Нужно минимум 2 свечи" };
  }
  
  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];
  
  const isEngulfing =
    prev.close > prev.open && // Первая свеча бычья
    curr.close < curr.open && // Вторая свеча медвежья
    curr.open > prev.close && // Открытие второй выше закрытия первой
    curr.close < prev.open; // Закрытие второй ниже открытия первой
  
  const valid = isEngulfing && (context?.trend === "up" || !context?.trend);
  const strength = isEngulfing ? 0.9 : 0;
  
  return {
    valid,
    strength,
    message: valid
      ? "Валидное Медвежье поглощение"
      : isEngulfing
      ? "Поглощение найдено, но лучше искать в восходящем тренде"
      : "Не соответствует паттерну Медвежье поглощение",
  };
}

function validateMorningStar(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 3) {
    return { valid: false, strength: 0, message: "Нужно минимум 3 свечи" };
  }
  
  const first = candles[candles.length - 3];
  const second = candles[candles.length - 2];
  const third = candles[candles.length - 1];
  
  const isMorningStar =
    first.close < first.open && // Первая медвежья
    Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.3 && // Вторая маленькая
    third.close > third.open && // Третья бычья
    third.close > (first.open + first.close) / 2; // Третья закрывается выше середины первой
  
  const valid = isMorningStar && (context?.trend === "down" || !context?.trend);
  const strength = isMorningStar ? 0.95 : 0;
  
  return {
    valid,
    strength,
    message: valid
      ? "Валидная Утренняя звезда"
      : isMorningStar
      ? "Утренняя звезда найдена, но лучше искать в нисходящем тренде"
      : "Не соответствует паттерну Утренняя звезда",
  };
}

function validateEveningStar(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 3) {
    return { valid: false, strength: 0, message: "Нужно минимум 3 свечи" };
  }
  
  const first = candles[candles.length - 3];
  const second = candles[candles.length - 2];
  const third = candles[candles.length - 1];
  
  const isEveningStar =
    first.close > first.open && // Первая бычья
    Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.3 && // Вторая маленькая
    third.close < third.open && // Третья медвежья
    third.close < (first.open + first.close) / 2; // Третья закрывается ниже середины первой
  
  const valid = isEveningStar && (context?.trend === "up" || !context?.trend);
  const strength = isEveningStar ? 0.95 : 0;
  
  return {
    valid,
    strength,
    message: valid
      ? "Валидная Вечерняя звезда"
      : isEveningStar
      ? "Вечерняя звезда найдена, но лучше искать в восходящем тренде"
      : "Не соответствует паттерну Вечерняя звезда",
  };
}

function validateDoji(candles: CandleData[], context?: any): ValidationResult {
  if (candles.length < 1) {
    return { valid: false, strength: 0, message: "Недостаточно свечей" };
  }
  
  const candle = candles[candles.length - 1];
  const bodySize = Math.abs(candle.close - candle.open);
  const totalRange = candle.high - candle.low;
  
  // Доджи: тело меньше 10% от общего диапазона
  const isDoji = bodySize <= totalRange * 0.1 && totalRange > 0;
  
  const strength = isDoji ? 0.7 : 0;
  
  return {
    valid: isDoji,
    strength,
    message: isDoji
      ? "Валидный Доджи - неопределенность на рынке"
      : "Не соответствует паттерну Доджи",
  };
}

