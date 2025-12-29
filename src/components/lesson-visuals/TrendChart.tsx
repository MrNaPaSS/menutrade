import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CandlestickChart } from './CandlestickChart';
import type { CandlestickData, TrendLine } from './types';
import { formatPrice } from './utils';
import { getTrendLines, getChartConfig, getCandlestickData } from './chartConfigLoader';

interface TrendChartProps {
  data?: CandlestickData[];
  lessonId?: string;
  trendLines?: TrendLine[];
  trendType?: 'up' | 'down' | 'both';
  interactive?: boolean;
  className?: string;
  height?: number;
}

export const TrendChart = React.memo(function TrendChart({
  data: externalData,
  lessonId,
  trendLines: externalTrendLines,
  trendType: externalTrendType,
  interactive: externalInteractive,
  className,
  height = 300,
}: TrendChartProps) {
  // Загружаем конфигурацию из lesson-chart-configs, если указан lessonId
  const lessonConfig = useMemo(() => {
    if (!lessonId) return null;
    return getChartConfig(lessonId, 'TrendChart');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    if (!lessonId) return null;
    return getCandlestickData(lessonId, 'TrendChart');
  }, [lessonId]);

  const lessonTrendLines = useMemo(() => {
    if (!lessonId) return null;
    return getTrendLines(lessonId, 'TrendChart');
  }, [lessonId]);

  // Приоритет: внешние пропы > конфигурация урока > значения по умолчанию
  const data = externalData || lessonData || undefined;
  const trendType = externalTrendType || (lessonConfig?.trendType as 'up' | 'down' | 'both') || 'both';
  const showPatterns = lessonConfig?.showPatterns !== undefined ? lessonConfig.showPatterns === false : false;
  const interactive = externalInteractive !== undefined ? externalInteractive : (lessonConfig?.interactive !== false);
  // Генерируем трендовые линии если не переданы - более точные
  const trendLines = useMemo(() => {
    // Приоритет: externalTrendLines > lessonTrendLines > вычисленные линии
    if (externalTrendLines && externalTrendLines.length > 0) {
      return externalTrendLines;
    }
    if (lessonTrendLines && lessonTrendLines.length > 0) {
      return lessonTrendLines;
    }
    
    if (!data || data.length === 0) return [];
    
    const lines: TrendLine[] = [];
    
    // Находим локальные экстремумы для построения трендовых линий
    const lookback = 5;
    const lows: Array<{ price: number; index: number }> = [];
    const highs: Array<{ price: number; index: number }> = [];
    
    for (let i = lookback; i < data.length - lookback; i++) {
      const window = data.slice(i - lookback, i + lookback + 1);
      const currentHigh = data[i].high;
      const currentLow = data[i].low;
      
      if (currentHigh === Math.max(...window.map(d => d.high))) {
        highs.push({ price: currentHigh, index: i });
      }
      if (currentLow === Math.min(...window.map(d => d.low))) {
        lows.push({ price: currentLow, index: i });
      }
    }
    
    if (trendType === 'up' || trendType === 'both') {
      // Восходящий тренд - соединяем локальные минимумы
      if (lows.length >= 2) {
        const sortedLows = [...lows].sort((a, b) => a.index - b.index);
        const startLow = sortedLows[0];
        const endLow = sortedLows[sortedLows.length - 1];
        
        // Проверяем, что тренд действительно восходящий
        if (endLow.price > startLow.price) {
          lines.push({
            startPrice: startLow.price,
            endPrice: endLow.price,
            startTime: data[startLow.index].time,
            endTime: data[endLow.index].time,
            type: 'up',
          });
        }
      }
    }
    
    if (trendType === 'down' || trendType === 'both') {
      // Нисходящий тренд - соединяем локальные максимумы
      if (highs.length >= 2) {
        const sortedHighs = [...highs].sort((a, b) => a.index - b.index);
        const startHigh = sortedHighs[0];
        const endHigh = sortedHighs[sortedHighs.length - 1];
        
        // Проверяем, что тренд действительно нисходящий
        if (endHigh.price < startHigh.price) {
          lines.push({
            startPrice: startHigh.price,
            endPrice: endHigh.price,
            startTime: data[startHigh.index].time,
            endTime: data[endHigh.index].time,
            type: 'down',
          });
        }
      }
    }
    
    return lines;
  }, [data, externalTrendLines, lessonTrendLines, trendType]);

  // Вычисляем диапазон цен
  const priceRange = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 0, range: 0 };
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

  return (
    <div className={cn('relative', className)}>
      <CandlestickChart
        data={data}
        lessonId={lessonId}
        showLevels={false}
        showPatterns={false}
        interactive={interactive}
        height={height}
      />
      
      {/* Отрисовка трендовых линий */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ height: `${height}px` }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 800 ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {trendLines.map((line, idx) => {
            // Находим индексы точек в данных
            const startIdx = data.findIndex(d => d.time === line.startTime);
            const endIdx = data.findIndex(d => d.time === line.endTime);
            
            if (startIdx === -1 || endIdx === -1) return null;
            
            const startX = (startIdx / data.length) * 800;
            const endX = (endIdx / data.length) * 800;
            const startY = height - ((line.startPrice - priceRange.min) / priceRange.range) * height;
            const endY = height - ((line.endPrice - priceRange.min) / priceRange.range) * height;
            const color = line.type === 'up' ? '#22c55e' : '#ef4444';
            
            return (
              <g key={idx}>
                {/* Трендовая линия */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={color}
                  strokeWidth={3}
                  opacity={0.9}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))',
                  }}
                />
                {/* Точки начала и конца тренда */}
                <circle
                  cx={startX}
                  cy={startY}
                  r={5}
                  fill={color}
                  opacity={0.9}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))',
                  }}
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r={5}
                  fill={color}
                  opacity={0.9}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))',
                  }}
                />
                {/* Стрелка направления */}
                <polygon
                  points={
                    line.type === 'up'
                      ? `${endX - 8},${endY - 6} ${endX},${endY} ${endX - 8},${endY + 6}`
                      : `${endX - 8},${endY - 6} ${endX},${endY} ${endX - 8},${endY + 6}`
                  }
                  fill={color}
                  opacity={0.9}
                />
                {/* Метка тренда (адаптивная) */}
                {endX > 150 && (
                  <text
                    x={endX - 70}
                    y={line.type === 'up' ? endY - 12 : endY + 18}
                    fill={color}
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {line.type === 'up' ? 'Восходящий' : 'Нисходящий'}
                  </text>
                )}
                {/* Показываем откаты к линии тренда */}
                {data.slice(startIdx, endIdx + 1).map((candle, candleIdx) => {
                  const globalIdx = startIdx + candleIdx;
                  const x = (globalIdx / data.length) * 800;
                  const trendY = startY + ((endY - startY) / (endIdx - startIdx)) * candleIdx;
                  const candleY = height - ((candle.close - priceRange.min) / priceRange.range) * height;
                  const distance = Math.abs(candleY - trendY);
                  
                  // Показываем откаты (когда цена близко к линии тренда)
                  if (distance < (priceRange.range / priceRange.range) * height * 0.05) {
                    return (
                      <g key={`pullback-${globalIdx}`}>
                        <line
                          x1={x}
                          y1={candleY}
                          x2={x}
                          y2={trendY}
                          stroke={color}
                          strokeWidth={1}
                          strokeDasharray="2,2"
                          opacity={0.5}
                        />
                        <circle
                          cx={x}
                          cy={candleY}
                          r={3}
                          fill={color}
                          opacity={0.6}
                        />
                      </g>
                    );
                  }
                  return null;
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
});

