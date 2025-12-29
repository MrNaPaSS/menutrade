import React, { useState, useRef, useCallback, useMemo } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CandlestickData, ChartConfig } from './types';
import { formatPrice, formatTime } from './utils';
import { getCandlestickData, getChartConfig } from './chartConfigLoader';

interface CandlestickChartProps {
  data?: CandlestickData[];
  lessonId?: string;
  timeframe?: ChartConfig['timeframe'];
  showLevels?: boolean;
  showVolume?: boolean;
  showPatterns?: boolean; // Отображение паттернов свечей
  interactive?: boolean;
  className?: string;
  height?: number;
  highlightedIndices?: number[]; // Индексы свечей для выделения синей обводкой
}

export const CandlestickChart = React.memo(function CandlestickChart({
  data: externalData,
  lessonId,
  timeframe: externalTimeframe,
  showLevels: externalShowLevels,
  showVolume: externalShowVolume,
  showPatterns: externalShowPatterns = true, // По умолчанию показываем паттерны
  interactive: externalInteractive,
  className,
  height = 300,
  highlightedIndices = [],
}: CandlestickChartProps) {
  // Загружаем конфигурацию из lesson-chart-configs, если указан lessonId
  const lessonConfig = useMemo(() => {
    if (!lessonId) return null;
    return getChartConfig(lessonId, 'CandlestickChart');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    if (!lessonId) return null;
    return getCandlestickData(lessonId, 'CandlestickChart');
  }, [lessonId]);

  // Приоритет: внешние пропы > конфигурация урока > значения по умолчанию
  const timeframe = externalTimeframe || lessonConfig?.timeframe || 'M15';
  const showLevels = externalShowLevels !== undefined ? externalShowLevels : (lessonConfig?.showLevels ?? false);
  const showVolume = externalShowVolume !== undefined ? externalShowVolume : (lessonConfig?.showVolume ?? false);
  const showPatterns = externalShowPatterns !== undefined ? externalShowPatterns : (lessonConfig?.showPatterns !== false);
  const interactive = externalInteractive !== undefined ? externalInteractive : (lessonConfig?.interactive !== false);
  const [selectedCandle, setSelectedCandle] = useState<CandlestickData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, panX: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  // Генерируем данные если не переданы - более реалистичные с трендом и волатильностью
  // Приоритет: externalData > lessonData > генерация
  const data = useMemo(() => {
    if (externalData && externalData.length > 0) {
      return externalData;
    }
    if (lessonData && lessonData.length > 0) {
      return lessonData;
    }
    // Генерируем реалистичные данные с трендом (уменьшено количество для производительности)
    const basePrice = 1.1000;
    const volatility = 0.002;
    const count = 30; // Уменьшено с 50 до 30 для производительности
    const generated: CandlestickData[] = [];
    let currentPrice = basePrice;
    let trend = 0.00005; // Небольшой восходящий тренд
    let momentum = 0;
    const now = new Date();
    
    // Определяем интервал в зависимости от таймфрейма
    const intervalMinutes = timeframe === 'M1' ? 1 : timeframe === 'M5' ? 5 : timeframe === 'M15' ? 15 : timeframe === 'M30' ? 30 : timeframe === 'H1' ? 60 : 240;
    
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
      
      // Динамический тренд с коррекциями
      if (i % 10 === 0) {
        trend = (Math.random() - 0.5) * 0.0001; // Периодические изменения тренда
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
      
      generated.push({
        time: time.toISOString(),
        open,
        high,
        low,
        close,
        volume,
      });
      
      currentPrice = close;
    }
    
    return generated;
  }, [externalData, timeframe]);

  // Вычисляем масштаб и границы
  const priceRange = useMemo(() => {
    const prices = data.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    return {
      min: min - range * 0.1,
      max: max + range * 0.1,
      range: range * 1.2,
    };
  }, [data]);

  // Адаптивная ширина для мобильных (увеличена для лучшей видимости)
  const chartWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 600 : 1200;
  const chartHeight = height;
  const candleWidth = Math.max(3, Math.min(10, (chartWidth / data.length) * 0.8));
  const visibleCandles = Math.floor((chartWidth * zoom) / candleWidth);
  const startIndex = Math.max(0, Math.min(data.length - visibleCandles, Math.floor(-panX / candleWidth)));

  // Улучшенные touch handlers с поддержкой pinch-to-zoom
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef<number>(1);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!interactive) return;
    
    if (e.touches.length === 1) {
      // Одиночное касание - начало панорамирования
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, panX });
    } else if (e.touches.length === 2) {
      // Два касания - начало pinch-to-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      pinchStartDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      pinchStartZoom.current = zoom;
      setIsDragging(false);
    }
  }, [panX, zoom, interactive]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!interactive) return;
    
    e.preventDefault(); // Предотвращаем скролл страницы
    
    if (e.touches.length === 1 && isDragging) {
      // Pan - перемещение графика
      const deltaX = e.touches[0].clientX - dragStart.x;
      const maxPan = Math.max(0, (data.length - visibleCandles) * candleWidth);
      const newPanX = dragStart.panX + deltaX;
      setPanX(Math.max(-maxPan, Math.min(0, newPanX)));
    } else if (e.touches.length === 2 && pinchStartDistance.current !== null) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = currentDistance / pinchStartDistance.current;
      const newZoom = Math.max(0.5, Math.min(3, pinchStartZoom.current * scale));
      setZoom(newZoom);
    }
  }, [isDragging, dragStart, data.length, visibleCandles, candleWidth, interactive]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    pinchStartDistance.current = null;
  }, []);

  // Click handler для выбора свечи
  const handleCandleClick = useCallback((candle: CandlestickData) => {
    if (interactive) {
      setSelectedCandle(candle);
      setIsDialogOpen(true);
    }
  }, [interactive]);

  // Отрисовка свечи с улучшенной интерактивностью
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);
  
  const renderCandle = useCallback((candle: CandlestickData, index: number, isHighlightedPattern: boolean = false, globalIndex?: number) => {
    const x = index * candleWidth + candleWidth / 2;
    const isBullish = candle.close >= candle.open;
    const bodyTop = isBullish ? candle.close : candle.open;
    const bodyBottom = isBullish ? candle.open : candle.close;
    
    const bodyTopY = chartHeight - ((bodyTop - priceRange.min) / priceRange.range) * chartHeight;
    const bodyBottomY = chartHeight - ((bodyBottom - priceRange.min) / priceRange.range) * chartHeight;
    const highY = chartHeight - ((candle.high - priceRange.min) / priceRange.range) * chartHeight;
    const lowY = chartHeight - ((candle.low - priceRange.min) / priceRange.range) * chartHeight;
    
    const bodyHeight = Math.abs(bodyTopY - bodyBottomY) || 1;
    const wickColor = isBullish ? '#22c55e' : '#ef4444';
    const bodyColor = isBullish ? '#22c55e' : '#ef4444';
    const isHovered = hoveredCandle === index;
    
    // Определяем паттерны свечей
    const bodySize = Math.abs(candle.close - candle.open);
    const upperShadow = candle.high - Math.max(candle.open, candle.close);
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
    const totalRange = candle.high - candle.low;
    
    // Молот - длинная нижняя тень, маленькое тело (может быть и медвежьим)
    const isHammer = lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5 && totalRange > 0;
    // Перевёрнутый молот - длинная верхняя тень
    const isInvertedHammer = upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5 && totalRange > 0;
    // Доджи - очень маленькое тело
    const isDoji = bodySize < totalRange * 0.15 && totalRange > 0;
    
    // Определяем поглощение (нужно проверить предыдущую свечу)
    let isEngulfing = false;
    let engulfingType: 'bullish' | 'bearish' | null = null;
    const actualIndex = globalIndex !== undefined ? globalIndex : index;
    if (actualIndex > 0 && data) {
      const prevCandle = data[actualIndex - 1];
      const prevIsBullish = prevCandle.close >= prevCandle.open;
      const currentIsBullish = isBullish;
      
      // Бычье поглощение: предыдущая медвежья, текущая бычья, текущая полностью поглощает предыдущую
      if (!prevIsBullish && currentIsBullish && 
          candle.open < prevCandle.close && candle.close > prevCandle.open) {
        isEngulfing = true;
        engulfingType = 'bullish';
      }
      // Медвежье поглощение: предыдущая бычья, текущая медвежья, текущая полностью поглощает предыдущую
      else if (prevIsBullish && !currentIsBullish && 
               candle.open > prevCandle.close && candle.close < prevCandle.open) {
        isEngulfing = true;
        engulfingType = 'bearish';
      }
    }
    
    // Определяем утреннюю/вечернюю звезду (нужно проверить предыдущие 2 свечи)
    let isStar = false;
    let starType: 'morning' | 'evening' | null = null;
    if (actualIndex >= 2 && data) {
      const firstCandle = data[actualIndex - 2];
      const secondCandle = data[actualIndex - 1];
      const firstIsBullish = firstCandle.close >= firstCandle.open;
      const secondBodySize = Math.abs(secondCandle.close - secondCandle.open);
      const secondTotalRange = secondCandle.high - secondCandle.low;
      const isSecondSmall = secondBodySize < secondTotalRange * 0.3; // Маленькая звезда
      
      // Утренняя звезда: медвежья -> маленькая -> бычья (закрывается выше середины первой)
      if (!firstIsBullish && isSecondSmall && isBullish) {
        const firstMid = firstCandle.open + (firstCandle.close - firstCandle.open) / 2;
        if (candle.close > firstMid) {
          isStar = true;
          starType = 'morning';
        }
      }
      // Вечерняя звезда: бычья -> маленькая -> медвежья (закрывается ниже середины первой)
      else if (firstIsBullish && isSecondSmall && !isBullish) {
        const firstMid = firstCandle.open + (firstCandle.close - firstCandle.open) / 2;
        if (candle.close < firstMid) {
          isStar = true;
          starType = 'evening';
        }
      }
    }
    
    // Определяем, является ли свеча частью паттерна (для синей обводки)
    // Для поглощения выделяем обе свечи
    let isPrevEngulfing = false;
    if (actualIndex > 0 && data) {
      const prevCandle = data[actualIndex - 1];
      const prevIsBullish = prevCandle.close >= prevCandle.open;
      const currentIsBullish = isBullish;
      // Проверяем, является ли предыдущая свеча частью поглощения
      if (actualIndex > 1) {
        const prevPrevCandle = data[actualIndex - 2];
        const prevPrevIsBullish = prevPrevCandle.close >= prevPrevCandle.open;
        if (!prevPrevIsBullish && prevIsBullish && 
            prevCandle.open < prevPrevCandle.close && prevCandle.close > prevPrevCandle.open) {
          isPrevEngulfing = true;
        } else if (prevPrevIsBullish && !prevIsBullish && 
                   prevCandle.open > prevPrevCandle.close && prevCandle.close < prevPrevCandle.open) {
          isPrevEngulfing = true;
        }
      }
    }
    
    // Для звезды выделяем все 3 свечи
    let isStarPart = false;
    if (actualIndex >= 1 && data && actualIndex < data.length - 1) {
      // Проверяем, является ли текущая свеча частью звезды (вторая или третья)
      const nextCandle = data[actualIndex + 1];
      const prevCandle = data[actualIndex - 1];
      const prevBodySize = Math.abs(prevCandle.close - prevCandle.open);
      const prevTotalRange = prevCandle.high - prevCandle.low;
      const isPrevSmall = prevBodySize < prevTotalRange * 0.3;
      const currentBodySize = bodySize;
      const currentTotalRange = totalRange;
      const isCurrentSmall = currentBodySize < currentTotalRange * 0.3;
      
      // Если предыдущая маленькая и текущая большая - это может быть третья свеча звезды
      if (isPrevSmall && !isCurrentSmall) {
        if (actualIndex >= 2) {
          const firstCandle = data[actualIndex - 2];
          const firstIsBullish = firstCandle.close >= firstCandle.open;
          if (!firstIsBullish && isBullish) {
            const firstMid = firstCandle.open + (firstCandle.close - firstCandle.open) / 2;
            if (candle.close > firstMid) {
              isStarPart = true;
            }
          } else if (firstIsBullish && !isBullish) {
            const firstMid = firstCandle.open + (firstCandle.close - firstCandle.open) / 2;
            if (candle.close < firstMid) {
              isStarPart = true;
            }
          }
        }
      }
      // Если текущая маленькая - это может быть вторая свеча звезды
      if (isCurrentSmall && actualIndex >= 1 && actualIndex < data.length - 1) {
        isStarPart = true;
      }
    }
    
    // Для внутреннего/внешнего бара
    let isInsideBar = false;
    let isOutsideBar = false;
    if (actualIndex > 0 && data) {
      const prevCandle = data[actualIndex - 1];
      // Внутренний бар: текущая свеча полностью внутри предыдущей
      if (candle.high < prevCandle.high && candle.low > prevCandle.low) {
        isInsideBar = true;
      }
      // Внешний бар: текущая свеча полностью поглощает предыдущую
      if (candle.high > prevCandle.high && candle.low < prevCandle.low) {
        isOutsideBar = true;
      }
    }
    
    // isHighlightedPattern имеет приоритет - если свеча в highlightedIndices, она должна быть выделена
    const isPatternCandle = isHighlightedPattern || isHammer || isInvertedHammer || isDoji || isEngulfing || isPrevEngulfing || isStar || isStarPart || isInsideBar || isOutsideBar;
    
    return (
      <g
        key={index}
        onClick={() => handleCandleClick(candle)}
        onTouchStart={() => handleCandleClick(candle)}
        onMouseEnter={() => interactive && setHoveredCandle(index)}
        onMouseLeave={() => setHoveredCandle(null)}
        className={interactive ? 'cursor-pointer' : ''}
        style={{ 
          filter: isHovered && interactive 
            ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))' 
            : (isPatternCandle || isHammer || isInvertedHammer || isDoji) && interactive
            ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))'
            : interactive 
            ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.3))' 
            : 'none',
          transition: 'filter 0.2s ease',
        }}
      >
        {/* Тень (wick) */}
        <line
          x1={x}
          y1={highY}
          x2={x}
          y2={lowY}
          stroke={wickColor}
          strokeWidth={isHovered || isPatternCandle ? 2 : 1}
          opacity={isHovered ? 1 : isPatternCandle ? 0.9 : 0.8}
        />
        {/* Тело свечи */}
        <rect
          x={x - candleWidth / 2 + 1}
          y={Math.min(bodyTopY, bodyBottomY)}
          width={isHovered ? candleWidth : candleWidth - 2}
          height={bodyHeight}
          fill={bodyColor}
          stroke={isPatternCandle ? "#3b82f6" : "none"}
          strokeWidth={isPatternCandle ? 2 : 0}
          opacity={isHovered ? 1 : isPatternCandle ? 0.95 : 0.9}
          rx={1}
        />
        {/* Tooltip при наведении (только для десктопа) */}
        {isHovered && interactive && typeof window !== 'undefined' && window.innerWidth >= 640 && (
          <g>
            <rect
              x={x - 50}
              y={highY - 40}
              width={100}
              height={30}
              fill="rgba(10, 10, 10, 0.95)"
              rx={4}
              stroke={bodyColor}
              strokeWidth={1}
            />
            <text
              x={x}
              y={highY - 25}
              textAnchor="middle"
              fill={bodyColor}
              fontSize="10"
              fontWeight="bold"
            >
              {formatPrice(candle.close)}
            </text>
            <text
              x={x}
              y={highY - 12}
              textAnchor="middle"
              fill="#888"
              fontSize="8"
            >
              {formatTime(candle.time, timeframe)}
            </text>
          </g>
        )}
      </g>
    );
  }, [chartHeight, priceRange, candleWidth, interactive, handleCandleClick, hoveredCandle, timeframe, data, highlightedIndices]);

  const visibleData = data.slice(startIndex, startIndex + visibleCandles);
  
  // Вычисляем локальные экстремумы для визуализации (оптимизировано)
  const localExtremes = useMemo(() => {
    if (!showLevels || data.length < 10) return [];
    
    const extremes: Array<{ index: number; type: 'high' | 'low'; price: number }> = [];
    const lookback = 3;
    const step = Math.max(1, Math.floor(data.length / 20)); // Ограничиваем количество экстремумов
    
    for (let i = lookback; i < data.length - lookback; i += step) {
      const window = data.slice(i - lookback, i + lookback + 1);
      const currentHigh = data[i].high;
      const currentLow = data[i].low;
      
      if (currentHigh === Math.max(...window.map(d => d.high))) {
        extremes.push({ index: i, type: 'high', price: currentHigh });
      }
      if (currentLow === Math.min(...window.map(d => d.low))) {
        extremes.push({ index: i, type: 'low', price: currentLow });
      }
    }
    
    return extremes;
  }, [data, showLevels]);
  
  // Вычисляем уровни поддержки/сопротивления из локальных экстремумов (оптимизировано)
  const supportResistanceLevels = useMemo(() => {
    if (!showLevels || localExtremes.length === 0) return [];
    
    const levels: Array<{ price: number; type: 'support' | 'resistance'; strength: number }> = [];
    const tolerance = 0.0005;
    
    // Группируем близкие экстремумы (ограничиваем количество)
    const highs = localExtremes.filter(e => e.type === 'high').slice(0, 10).map(e => e.price);
    const lows = localExtremes.filter(e => e.type === 'low').slice(0, 10).map(e => e.price);
    
    // Находим уровни сопротивления (максимумы) - максимум 3 уровня
    const resistanceGroups: number[][] = [];
    for (let i = 0; i < Math.min(highs.length, 5); i++) {
      const high = highs[i];
      const group = resistanceGroups.find(g => Math.abs(g[0] - high) < tolerance);
      if (group) {
        group.push(high);
      } else if (resistanceGroups.length < 3) {
        resistanceGroups.push([high]);
      }
    }
    
    // Находим уровни поддержки (минимумы) - максимум 3 уровня
    const supportGroups: number[][] = [];
    for (let i = 0; i < Math.min(lows.length, 5); i++) {
      const low = lows[i];
      const group = supportGroups.find(g => Math.abs(g[0] - low) < tolerance);
      if (group) {
        group.push(low);
      } else if (supportGroups.length < 3) {
        supportGroups.push([low]);
      }
    }
    
    // Создаём уровни с силой (количество касаний) - только сильные уровни
    resistanceGroups.forEach(group => {
      if (group.length >= 2) {
        const avgPrice = group.reduce((a, b) => a + b, 0) / group.length;
        levels.push({ price: avgPrice, type: 'resistance', strength: Math.min(group.length, 5) });
      }
    });
    
    supportGroups.forEach(group => {
      if (group.length >= 2) {
        const avgPrice = group.reduce((a, b) => a + b, 0) / group.length;
        levels.push({ price: avgPrice, type: 'support', strength: Math.min(group.length, 5) });
      }
    });
    
    return levels.slice(0, 4); // Максимум 4 уровня
  }, [localExtremes, showLevels]);

  return (
    <>
      <div
        ref={chartRef}
        className={cn(
          'glass-card rounded-xl p-3 neon-border relative overflow-hidden',
          'bg-[#0a0a0a]',
          className
        )}
        style={{ 
          height: `${height}px`,
          touchAction: interactive ? 'none' : 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Контролы zoom (только на десктопе или если нужно) */}
        {interactive && (
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-background/80"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-background/80"
              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-background/80"
              onClick={() => {
                setZoom(1);
                setPanX(0);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ touchAction: interactive ? 'none' : 'auto' }}
        >
          {/* Сетка */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(34, 197, 94, 0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Уровни поддержки/сопротивления */}
          {showLevels && supportResistanceLevels.map((level, levelIdx) => {
            const y = chartHeight - ((level.price - priceRange.min) / priceRange.range) * chartHeight;
            const color = level.type === 'support' ? '#22c55e' : '#ef4444';
            const lineWidth = Math.min(3, level.strength);
            
            return (
              <g key={`level-${levelIdx}`}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={color}
                  strokeWidth={lineWidth}
                  strokeDasharray={level.strength >= 3 ? "0" : "5,5"}
                  opacity={0.7}
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))',
                  }}
                />
                {/* Подпись уровня (адаптивная) */}
                {chartWidth > 500 && (
                  <text
                    x={chartWidth - 100}
                    y={y - 5}
                    fill={color}
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {level.type === 'support' ? 'Поддержка' : 'Сопротивление'}: {formatPrice(level.price)}
                  </text>
                )}
                {/* Индикатор силы */}
                <circle
                  cx={chartWidth - 10}
                  cy={y}
                  r={Math.min(6, level.strength * 1.5)}
                  fill={color}
                  opacity={0.6}
                />
              </g>
            );
          })}
          
          {/* Локальные экстремумы */}
          {localExtremes.map((extreme, idx) => {
            const visibleIndex = extreme.index - startIndex;
            if (visibleIndex < 0 || visibleIndex >= visibleData.length) return null;
            
            const x = visibleIndex * candleWidth + candleWidth / 2;
            const y = chartHeight - ((extreme.price - priceRange.min) / priceRange.range) * chartHeight;
            const color = extreme.type === 'high' ? '#ef4444' : '#22c55e';
            
            return (
              <g key={`extreme-${idx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={color}
                  opacity={0.8}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))',
                  }}
                />
                {/* Стрелка к экстремуму */}
                <polygon
                  points={
                    extreme.type === 'high'
                      ? `${x},${y + 8} ${x - 4},${y + 4} ${x + 4},${y + 4}`
                      : `${x},${y - 8} ${x - 4},${y - 4} ${x + 4},${y - 4}`
                  }
                  fill={color}
                  opacity={0.8}
                />
              </g>
            );
          })}
          
          {/* Свечи */}
          <g transform={`translate(${panX}, 0)`}>
            {visibleData.map((candle, idx) => {
              const globalIndex = startIndex + idx;
              // Проверяем, является ли свеча частью паттерна (используем глобальный индекс из полного массива данных)
              const isPatternCandle = localExtremes.some(e => e.index === globalIndex) || highlightedIndices.includes(globalIndex);
              return renderCandle(candle, idx, isPatternCandle, globalIndex);
            })}
          </g>
        </svg>

        {/* Подсказка для мобильных */}
        {interactive && (
          <div className="absolute bottom-2 left-2 right-2 text-[10px] sm:text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-2 py-1 rounded border border-primary/20 break-words overflow-wrap-anywhere">
            <span className="whitespace-normal block text-center">
              <span className="hidden sm:inline">Тап на свечу для деталей • </span>
              <span>Pinch для zoom</span>
            </span>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями свечи */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md bg-background border-primary/20 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-primary text-base sm:text-lg">Детали свечи</DialogTitle>
              </DialogHeader>
          {selectedCandle && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Время</p>
                  <p className="font-mono text-xs sm:text-sm break-all">{formatTime(selectedCandle.time, timeframe)}</p>
                </div>
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Объём</p>
                  <p className="font-mono text-xs sm:text-sm break-all">{selectedCandle.volume?.toLocaleString()}</p>
                </div>
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Открытие</p>
                  <p className="font-mono text-xs sm:text-sm text-foreground break-all">{formatPrice(selectedCandle.open)}</p>
                </div>
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Закрытие</p>
                  <p className="font-mono text-xs sm:text-sm text-foreground break-all">{formatPrice(selectedCandle.close)}</p>
                </div>
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Максимум</p>
                  <p className="font-mono text-xs sm:text-sm text-primary break-all">{formatPrice(selectedCandle.high)}</p>
                </div>
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Минимум</p>
                  <p className="font-mono text-xs sm:text-sm text-destructive break-all">{formatPrice(selectedCandle.low)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border break-words overflow-wrap-anywhere">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Изменение</p>
                <p className={cn(
                  "font-mono text-xs sm:text-sm font-semibold break-all",
                  selectedCandle.close >= selectedCandle.open ? "text-primary" : "text-destructive"
                )}>
                  {selectedCandle.close >= selectedCandle.open ? '+' : ''}
                  {formatPrice(selectedCandle.close - selectedCandle.open)}
                  {' '}({((selectedCandle.close - selectedCandle.open) / selectedCandle.open * 100).toFixed(2)}%)
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

