import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CandlestickChart } from './CandlestickChart';
import type { CandlestickData, PatternData } from './types';
import { getPatternData, getChartConfig, getCandlestickData } from './chartConfigLoader';

type PatternType = 
  | 'hammer' | 'engulfing' | 'evening_star' | 'morning_star'
  | 'flag' | 'pennant' | 'triangle'
  | 'head_shoulders' | 'double_top' | 'double_bottom'
  | 'butterfly' | 'bat' | 'crab' | 'shark' | 'five_zero';

interface PatternChartProps {
  data?: CandlestickData[];
  lessonId?: string;
  pattern: PatternType;
  interactive?: boolean;
  className?: string;
  height?: number;
}

export const PatternChart = React.memo(function PatternChart({
  data: externalData,
  lessonId,
  pattern: externalPattern,
  interactive: externalInteractive,
  className,
  height = 300,
}: PatternChartProps) {
  // Загружаем конфигурацию из lesson-chart-configs, если указан lessonId
  const lessonConfig = useMemo(() => {
    if (!lessonId) return null;
    return getChartConfig(lessonId, 'PatternChart');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    if (!lessonId) return null;
    return getCandlestickData(lessonId, 'PatternChart');
  }, [lessonId]);

  const lessonPatternData = useMemo(() => {
    if (!lessonId) return null;
    return getPatternData(lessonId, 'PatternChart');
  }, [lessonId]);

  // Приоритет: внешние пропы > конфигурация урока > значения по умолчанию
  const data = externalData || lessonData || undefined;
  const pattern = externalPattern || (lessonConfig?.pattern as PatternType) || 'hammer';
  const interactive = externalInteractive !== undefined ? externalInteractive : (lessonConfig?.interactive !== false);
  const [selectedPattern, setSelectedPattern] = useState<PatternData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Находим паттерны в данных - более детальный поиск
  const patterns = useMemo(() => {
    if (!data || data.length < 3) {
      // Для графических фигур создаём паттерн даже при недостатке данных
      if (['head_shoulders', 'flag', 'pennant', 'triangle', 'double_top', 'double_bottom'].includes(pattern)) {
        return [{
          type: pattern,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          description: getPatternDescription(pattern),
        }];
      }
      return [];
    }
    
    const found: PatternData[] = [];
    
    switch (pattern) {
      case 'hammer':
        // Молот - длинная нижняя тень, маленькое тело
        for (let i = 1; i < data.length - 1; i++) {
          const candle = data[i];
          const bodySize = Math.abs(candle.close - candle.open);
          const totalRange = candle.high - candle.low;
          const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
          const upperShadow = candle.high - Math.max(candle.open, candle.close);
          
          // Более строгие критерии для молота
          if (lowerShadow > bodySize * 2 && 
              upperShadow < bodySize * 0.5 && 
              bodySize < totalRange * 0.3 &&
              lowerShadow > totalRange * 0.6) {
            found.push({
              type: 'hammer',
              startTime: candle.time,
              endTime: candle.time,
              description: 'Молот - разворотный паттерн, указывает на возможный рост. Длинная нижняя тень показывает отторжение от минимума.',
            });
          }
        }
        break;
        
      case 'engulfing':
        // Поглощение - большая свеча поглощает предыдущую
        for (let i = 1; i < data.length; i++) {
          const prev = data[i - 1];
          const curr = data[i];
          const prevBody = Math.abs(prev.close - prev.open);
          const currBody = Math.abs(curr.close - curr.open);
          
          // Проверяем, что текущая свеча полностью поглощает предыдущую
          const isBullishEngulfing = curr.close > prev.open && curr.open < prev.close && curr.close > curr.open && prev.close < prev.open;
          const isBearishEngulfing = curr.close < prev.open && curr.open > prev.close && curr.close < curr.open && prev.close > prev.open;
          
          if ((isBullishEngulfing || isBearishEngulfing) && currBody > prevBody * 1.5) {
            found.push({
              type: 'engulfing',
              startTime: prev.time,
              endTime: curr.time,
              description: isBullishEngulfing 
                ? 'Бычье поглощение - сильный сигнал роста. Большая бычья свеча полностью поглощает медвежью.'
                : 'Медвежье поглощение - сильный сигнал падения. Большая медвежья свеча полностью поглощает бычью.',
            });
          }
        }
        break;
        
      case 'double_top':
        // Двойная вершина - более точный поиск
        for (let i = 15; i < data.length - 15; i++) {
          const firstWindow = data.slice(i - 10, i + 5);
          const secondWindow = data.slice(i + 5, i + 20);
          
          if (firstWindow.length === 0 || secondWindow.length === 0) continue;
          
          const firstTop = Math.max(...firstWindow.map(d => d.high));
          const firstTopIdx = firstWindow.findIndex(d => d.high === firstTop);
          const secondTop = Math.max(...secondWindow.map(d => d.high));
          const secondTopIdx = secondWindow.findIndex(d => d.high === secondTop);
          
          // Проверяем, что между вершинами была впадина
          const betweenData = data.slice(i - 10 + firstTopIdx, i + 5 + secondTopIdx);
          const minBetween = Math.min(...betweenData.map(d => d.low));
          const dropFromFirst = firstTop - minBetween;
          const dropFromSecond = secondTop - minBetween;
          
          if (Math.abs(firstTop - secondTop) < 0.0005 && 
              dropFromFirst > 0.001 && 
              dropFromSecond > 0.001) {
            found.push({
              type: 'double_top',
              startTime: data[i - 10].time,
              endTime: data[i + 20].time,
              description: 'Двойная вершина - разворотный паттерн, сигнал падения. Две примерно равные вершины с впадиной между ними.',
            });
            break; // Находим только первый паттерн
          }
        }
        break;
        
      case 'head_shoulders':
      case 'flag':
      case 'pennant':
      case 'triangle':
      case 'double_bottom':
      case 'butterfly':
      case 'bat':
      case 'crab':
      case 'shark':
      case 'five_zero':
        // Для графических фигур и гармонических паттернов всегда создаём паттерн на основе данных
        if (data.length > 10) {
          found.push({
            type: pattern,
            startTime: data[0].time,
            endTime: data[data.length - 1].time,
            description: getPatternDescription(pattern),
          });
        }
        break;
        
      default:
        // Для остальных паттернов создаём пример
        if (data.length > 5) {
          found.push({
            type: pattern,
            startTime: data[Math.floor(data.length * 0.3)].time,
            endTime: data[Math.floor(data.length * 0.7)].time,
            description: getPatternDescription(pattern),
          });
        }
    }
    
    // Для графических фигур всегда возвращаем хотя бы один паттерн
    if (found.length === 0 && ['head_shoulders', 'flag', 'pennant', 'triangle', 'double_top', 'double_bottom'].includes(pattern)) {
      found.push({
        type: pattern,
        startTime: data[0].time,
        endTime: data[data.length - 1].time,
        description: getPatternDescription(pattern),
      });
    }
    
    return found.slice(0, 3); // Максимум 3 паттерна
  }, [data, pattern]);

  const handlePatternClick = useCallback((patternData: PatternData) => {
    if (interactive) {
      setSelectedPattern(patternData);
      setIsDialogOpen(true);
    }
  }, [interactive]);

  // Вычисляем позиции паттернов
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

  // Простая логика: находим паттерн и центрируем его, расширяя данные вокруг
  // Всегда выделяем свечи с индексами 2-8 (3-9 в человеческом счислении)
  const { displayData, displayHighlightedIndices } = useMemo(() => {
    if (!data || data.length === 0) {
      return { displayData: data, displayHighlightedIndices: [] };
    }
    
    // Фиксированные индексы для выделения: свечи 3-9 (индексы 2-8)
    // Если данных меньше, выделяем все доступные свечи начиная с индекса 2
    const maxIndex = Math.min(8, data.length - 1);
    const fixedPatternIndices: number[] = [];
    for (let i = 2; i <= maxIndex; i++) {
      fixedPatternIndices.push(i);
    }
    
    // Всегда используем оригинальные данные и фиксированные индексы для выделения
    // Свечи 3-9 (индексы 2-8) будут выделены синим
    return { 
      displayData: data, 
      displayHighlightedIndices: fixedPatternIndices 
    };
  }, [data, patterns]);

  // Проверяем что данные валидны
  if (!data || data.length === 0) {
    return (
      <div className={cn('relative', className)}>
        <CandlestickChart
          data={data}
          showLevels={false}
          interactive={interactive}
          height={height}
          highlightedIndices={[]}
        />
      </div>
    );
  }

  // Убеждаемся, что displayHighlightedIndices всегда определены
  const finalHighlightedIndices = displayHighlightedIndices && displayHighlightedIndices.length > 0 
    ? displayHighlightedIndices 
    : (displayData && displayData.length > 0 
        ? [2, 3, 4, 5, 6, 7, 8].filter(idx => idx < displayData.length)
        : []);

  return (
    <>
      <div className={cn('relative', className)}>
        <CandlestickChart
          data={displayData}
          showLevels={false}
          interactive={interactive}
          height={height}
          highlightedIndices={finalHighlightedIndices}
        />
        
        {/* Отрисовка паттернов */}
        {patterns.length > 0 && priceRange.range > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ height: `${height}px` }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 1200 ${height}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {patterns.map((patternData, idx) => {
                try {
                  const startIdx = displayData.findIndex(d => d.time === patternData.startTime);
                  const endIdx = displayData.findIndex(d => d.time === patternData.endTime);
                  
                  // Если не найдены точные индексы, используем начало и конец данных
                  const actualStartIdx = startIdx === -1 ? 0 : Math.max(0, startIdx);
                  const actualEndIdx = endIdx === -1 ? displayData.length - 1 : Math.min(displayData.length - 1, endIdx);
                  
                  if (actualStartIdx >= actualEndIdx || actualStartIdx < 0 || actualEndIdx >= displayData.length) {
                    console.warn('Invalid pattern indices:', { actualStartIdx, actualEndIdx, dataLength: displayData.length });
                    return null;
                  }
                  
                  const startX = (actualStartIdx / displayData.length) * 1200;
                  const endX = (actualEndIdx / displayData.length) * 1200;
                  const width = Math.max(endX - startX, 50);
                  
                  // Вычисляем Y для паттерна (центр области паттерна)
                  const patternDataSlice = displayData.slice(actualStartIdx, actualEndIdx + 1);
                  if (patternDataSlice.length === 0) return null;
                  
                  const patternHigh = Math.max(...patternDataSlice.map(d => d.high));
                  const patternLow = Math.min(...patternDataSlice.map(d => d.low));
                  const patternMid = (patternHigh + patternLow) / 2;
                  
                  if (priceRange.range === 0) return null;
                  
                  const midY = height - ((patternMid - priceRange.min) / priceRange.range) * height;
                  
                  // Функция для преобразования цены в Y координату
                  const priceToY = (price: number) => {
                    if (priceRange.range === 0) return height / 2;
                    return height - ((price - priceRange.min) / priceRange.range) * height;
                  };
                  const indexToX = (index: number) => {
                    if (displayData.length === 0) return 0;
                    return (Math.max(0, Math.min(index, displayData.length - 1)) / displayData.length) * 1200;
                  };
                  
                  return (
                    <g key={idx}>
                    {/* Отрисовка графических фигур */}
                    {patternData.type === 'head_shoulders' && renderHeadAndShoulders(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, interactive, () => handlePatternClick(patternData)
                    )}
                    {patternData.type === 'flag' && renderFlag(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, interactive, () => handlePatternClick(patternData)
                    )}
                    {patternData.type === 'pennant' && renderPennant(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, interactive, () => handlePatternClick(patternData)
                    )}
                    {patternData.type === 'triangle' && renderTriangle(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, interactive, () => handlePatternClick(patternData)
                    )}
                    {patternData.type === 'double_top' && renderDoubleTop(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, interactive, () => handlePatternClick(patternData)
                    )}
                    {patternData.type === 'double_bottom' && renderDoubleBottom(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, interactive, () => handlePatternClick(patternData)
                    )}
                    {(patternData.type === 'butterfly' || patternData.type === 'bat' || patternData.type === 'crab' || patternData.type === 'shark' || patternData.type === 'five_zero') && renderHarmonicPattern(
                      displayData, startIdx, endIdx, priceToY, indexToX, height, patternData.type, interactive, () => handlePatternClick(patternData)
                    )}
                    
                    {/* Выделение области паттерна (для паттернов свечей) */}
                    {!['head_shoulders', 'flag', 'pennant', 'triangle', 'double_top', 'double_bottom', 'butterfly', 'bat', 'crab', 'shark', 'five_zero'].includes(patternData.type) && (
                      <rect
                        x={startX}
                        y={0}
                        width={width}
                        height={height}
                        fill="rgba(34, 197, 94, 0.15)"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                        onClick={() => handlePatternClick(patternData)}
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))',
                        }}
                      />
                    )}
                    {/* Метка паттерна с фоном (только для паттернов свечей) */}
                    {!['head_shoulders', 'flag', 'pennant', 'triangle', 'double_top', 'double_bottom', 'butterfly', 'bat', 'crab', 'shark', 'five_zero'].includes(patternData.type) && width > 100 && (
                      <>
                        <rect
                          x={startX + 5}
                          y={midY - 12}
                          width={Math.min(100, width - 10)}
                          height={20}
                          fill="rgba(10, 10, 10, 0.9)"
                          rx={4}
                          stroke="#22c55e"
                          strokeWidth={1}
                          className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                          onClick={() => handlePatternClick(patternData)}
                        />
                        <text
                          x={startX + width / 2}
                          y={midY + 2}
                          textAnchor="middle"
                          fill="#22c55e"
                          fontSize="9"
                          fontWeight="bold"
                          className={interactive ? 'cursor-pointer pointer-events-auto select-none' : 'select-none'}
                          onClick={() => handlePatternClick(patternData)}
                        >
                          {getPatternName(patternData.type)}
                        </text>
                      </>
                    )}
                    {/* Стрелка к паттерну (только для паттернов свечей) */}
                    {!['head_shoulders', 'flag', 'pennant', 'triangle', 'double_top', 'double_bottom', 'butterfly', 'bat', 'crab', 'shark', 'five_zero'].includes(patternData.type) && (
                      <polygon
                        points={`${startX + width / 2},${midY - 25} ${startX + width / 2 - 5},${midY - 15} ${startX + width / 2 + 5},${midY - 15}`}
                        fill="#22c55e"
                        opacity={0.8}
                        className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                        onClick={() => handlePatternClick(patternData)}
                      />
                    )}
                    {/* Иконка паттерна справа (только для паттернов свечей) */}
                    {!['head_shoulders', 'flag', 'pennant', 'triangle', 'double_top', 'double_bottom', 'butterfly', 'bat', 'crab', 'shark', 'five_zero'].includes(patternData.type) && (
                      <circle
                        cx={endX - 15}
                        cy={midY}
                        r={6}
                        fill="#22c55e"
                        className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                        onClick={() => handlePatternClick(patternData)}
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))',
                        }}
                      />
                    )}
                  </g>
                );
                } catch (error) {
                  console.error('Error rendering pattern:', error, patternData);
                  return null;
                }
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Модальное окно с описанием паттерна */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-background border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary text-base sm:text-lg">
              {selectedPattern ? getPatternName(selectedPattern.type) : 'Паттерн'}
            </DialogTitle>
          </DialogHeader>
          {selectedPattern && (
            <div className="space-y-3 mt-4 break-words overflow-wrap-anywhere">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Описание</p>
                <p className="text-xs sm:text-sm text-foreground break-words whitespace-normal">
                  {selectedPattern.description}
                </p>
              </div>
              <div className="pt-2 border-t border-border break-words overflow-wrap-anywhere">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Тип паттерна</p>
                <p className="text-xs sm:text-sm text-foreground break-words whitespace-normal">
                  {isReversalPattern(selectedPattern.type) ? 'Разворотный' : 'Продолжающий'}
                </p>
              </div>
              <div className="pt-2 border-t border-border break-words overflow-wrap-anywhere">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Рекомендация</p>
                <p className="text-xs sm:text-sm text-foreground break-words whitespace-normal">
                  {getPatternRecommendation(selectedPattern.type)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

function getPatternName(type: string): string {
  const names: Record<string, string> = {
    hammer: 'Молот',
    engulfing: 'Поглощение',
    evening_star: 'Вечерняя звезда',
    morning_star: 'Утренняя звезда',
    flag: 'Флаг',
    pennant: 'Вымпел',
    triangle: 'Треугольник',
    head_shoulders: 'Голова и плечи',
    double_top: 'Двойная вершина',
    double_bottom: 'Двойное дно',
  };
  return names[type] || type;
}

function getPatternDescription(type: string): string {
  const descriptions: Record<string, string> = {
    hammer: 'Молот - разворотный паттерн с длинной нижней тенью, указывает на возможный рост',
    engulfing: 'Поглощение - большая свеча полностью поглощает предыдущую, сильный сигнал разворота',
    evening_star: 'Вечерняя звезда - медвежий разворотный паттерн из трёх свечей',
    morning_star: 'Утренняя звезда - бычий разворотный паттерн из трёх свечей',
    flag: 'Флаг - паттерн продолжения тренда, краткосрочная консолидация',
    pennant: 'Вымпел - паттерн продолжения тренда, треугольная консолидация',
    triangle: 'Треугольник - паттерн продолжения или разворота в зависимости от направления пробоя',
    head_shoulders: 'Голова и плечи - разворотный паттерн, сигнал смены тренда',
    double_top: 'Двойная вершина - разворотный паттерн, сигнал падения',
    double_bottom: 'Двойное дно - разворотный паттерн, сигнал роста',
    butterfly: 'Бабочка - гармонический паттерн из 5 точек, основан на пропорциях Фибоначчи',
    bat: 'Летучая мышь - гармонический паттерн, похож на Бабочку, но с другими пропорциями',
    crab: 'Краб - самый экстремальный гармонический паттерн, точка D далеко от точки X',
    shark: 'Акула - гармонический паттерн, может переходить в паттерн 5-0',
    five_zero: '5-0 - гармонический паттерн из 5 точек, два треугольника XAB и BCD',
  };
  return descriptions[type] || 'Паттерн технического анализа';
}

function isReversalPattern(type: string): boolean {
  const reversal = ['hammer', 'engulfing', 'evening_star', 'morning_star', 'head_shoulders', 'double_top', 'double_bottom', 'butterfly', 'bat', 'crab', 'shark', 'five_zero'];
  return reversal.includes(type);
}

function getPatternRecommendation(type: string): string {
  const recommendations: Record<string, string> = {
    hammer: 'Рассмотрите открытие CALL опциона при подтверждении роста',
    engulfing: 'Следуйте направлению поглощающей свечи',
    evening_star: 'Рассмотрите открытие PUT опциона',
    morning_star: 'Рассмотрите открытие CALL опциона',
    flag: 'Торгуйте в направлении тренда после пробоя',
    pennant: 'Торгуйте в направлении тренда после пробоя',
    triangle: 'Дождитесь пробоя и торгуйте в направлении пробоя',
    head_shoulders: 'Рассмотрите открытие PUT опциона',
    double_top: 'Рассмотрите открытие PUT опциона',
    double_bottom: 'Рассмотрите открытие CALL опциона',
    butterfly: 'Входите в зоне точки D (последние 20% движения). Бычья Бабочка - CALL, медвежья - PUT',
    bat: 'Входите в зоне точки D. Бычья Летучая мышь - CALL, медвежья - PUT',
    crab: 'Входите в зоне точки D (последние 10-15% движения). Бычий Краб - CALL, медвежий - PUT',
    shark: 'Входите в зоне точки C. Бычья Акула - CALL, медвежья - PUT',
    five_zero: 'Входите в зоне точки D. Бычий 5-0 - CALL, медвежий - PUT',
  };
  return recommendations[type] || 'Используйте паттерн как дополнительный сигнал';
}

// Функции для отрисовки графических фигур
function renderHeadAndShoulders(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 10) return null;
  
    // Находим три пика: левое плечо, голова, правое плечо
    const third = Math.floor(slice.length / 3);
    const leftShoulder = slice.slice(0, third);
    const head = slice.slice(third, third * 2);
    const rightShoulder = slice.slice(third * 2);
    
    const leftShoulderHigh = Math.max(...leftShoulder.map(d => d.high));
    const leftShoulderIdx = leftShoulder.findIndex(d => d.high === leftShoulderHigh);
    const leftShoulderX = indexToX(safeStartIdx + leftShoulderIdx);
    const leftShoulderY = priceToY(leftShoulderHigh);
    
    const headHigh = Math.max(...head.map(d => d.high));
    const headIdx = head.findIndex(d => d.high === headHigh);
    const headX = indexToX(safeStartIdx + third + headIdx);
    const headY = priceToY(headHigh);
    
    const rightShoulderHigh = Math.max(...rightShoulder.map(d => d.high));
    const rightShoulderIdx = rightShoulder.findIndex(d => d.high === rightShoulderHigh);
    const rightShoulderX = indexToX(safeStartIdx + third * 2 + rightShoulderIdx);
    const rightShoulderY = priceToY(rightShoulderHigh);
    
    // Линия шеи (соединяет минимумы МЕЖДУ плечами и головой)
    // Минимум между левым плечом и головой
    const betweenLeftAndHead = slice.slice(third, third * 1.5);
    const leftTrough = Math.min(...betweenLeftAndHead.map(d => d.low));
    const leftTroughIdx = betweenLeftAndHead.findIndex(d => d.low === leftTrough);
    const leftTroughX = indexToX(safeStartIdx + third + leftTroughIdx);
    const necklineStartY = priceToY(leftTrough);
    
    // Минимум между головой и правым плечом
    const betweenHeadAndRight = slice.slice(Math.floor(third * 1.5), third * 2);
    const rightTrough = Math.min(...betweenHeadAndRight.map(d => d.low));
    const rightTroughIdx = betweenHeadAndRight.findIndex(d => d.low === rightTrough);
    const rightTroughX = indexToX(safeStartIdx + Math.floor(third * 1.5) + rightTroughIdx);
    const necklineEndY = priceToY(rightTrough);
    
    // Точки для заливки - используем точки на линии шеи под каждым пиком
    const leftNeckY = priceToY(leftTrough + (rightTrough - leftTrough) * 0);
    const headNeckY = priceToY(leftTrough + (rightTrough - leftTrough) * 0.5);
    const rightNeckY = priceToY(leftTrough + (rightTrough - leftTrough) * 1);
    
    return (
      <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
        {/* Заливка области паттерна (светло-зеленая как на изображении) */}
        <polygon
          points={`${leftTroughX},${necklineStartY} ${leftShoulderX},${leftShoulderY} ${headX},${headY} ${rightShoulderX},${rightShoulderY} ${rightTroughX},${necklineEndY}`}
          fill="rgba(34, 197, 94, 0.2)"
          stroke="none"
        />
        
        {/* Линия шеи (пунктирная) */}
        <line
          x1={leftTroughX}
          y1={necklineStartY}
          x2={rightTroughX}
          y2={necklineEndY}
          stroke="#22c55e"
          strokeWidth={3}
          strokeDasharray="8,5"
          opacity={0.9}
        />
        
        {/* Вертикальная линия от левого плеча до линии шеи */}
        <line
          x1={leftShoulderX}
          y1={leftShoulderY}
          x2={leftShoulderX}
          y2={necklineStartY}
          stroke="#22c55e"
          strokeWidth={3}
          opacity={0.8}
        />
        
        {/* Вертикальная линия от головы до линии шеи */}
        <line
          x1={headX}
          y1={headY}
          x2={headX}
          y2={headNeckY}
          stroke="#22c55e"
          strokeWidth={3}
          opacity={0.8}
        />
        
        {/* Вертикальная линия от правого плеча до линии шеи */}
        <line
          x1={rightShoulderX}
          y1={rightShoulderY}
          x2={rightShoulderX}
          y2={necklineEndY}
          stroke="#22c55e"
          strokeWidth={3}
          opacity={0.8}
        />
        
        {/* Левое плечо - маркер */}
        <circle cx={leftShoulderX} cy={leftShoulderY} r={6} fill="#22c55e" opacity={1} stroke="white" strokeWidth={2} />
        
        {/* Подпись левого плеча - speech bubble */}
        <g>
          <rect
            x={leftShoulderX - 40}
            y={leftShoulderY - 35}
            width={80}
            height={20}
            fill="#22c55e"
            rx={6}
            stroke="#22c55e"
            strokeWidth={2}
          />
          <polygon
            points={`${leftShoulderX - 8},${leftShoulderY - 15} ${leftShoulderX},${leftShoulderY - 20} ${leftShoulderX + 8},${leftShoulderY - 15}`}
            fill="#22c55e"
          />
          <text x={leftShoulderX} y={leftShoulderY - 20} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
            Левое плечо
          </text>
        </g>
        
        {/* Голова - маркер */}
        <circle cx={headX} cy={headY} r={7} fill="#22c55e" opacity={1} stroke="white" strokeWidth={2} />
        
        {/* Подпись головы - speech bubble */}
        <g>
          <rect
            x={headX - 30}
            y={headY - 35}
            width={60}
            height={20}
            fill="#22c55e"
            rx={6}
            stroke="#22c55e"
            strokeWidth={2}
          />
          <polygon
            points={`${headX - 8},${headY - 15} ${headX},${headY - 20} ${headX + 8},${headY - 15}`}
            fill="#22c55e"
          />
          <text x={headX} y={headY - 20} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
            Голова
          </text>
        </g>
        
        {/* Правое плечо - маркер */}
        <circle cx={rightShoulderX} cy={rightShoulderY} r={6} fill="#22c55e" opacity={1} stroke="white" strokeWidth={2} />
        
        {/* Подпись правого плеча - speech bubble */}
        <g>
          <rect
            x={rightShoulderX - 40}
            y={rightShoulderY - 35}
            width={80}
            height={20}
            fill="#22c55e"
            rx={6}
            stroke="#22c55e"
            strokeWidth={2}
          />
          <polygon
            points={`${rightShoulderX - 8},${rightShoulderY - 15} ${rightShoulderX},${rightShoulderY - 20} ${rightShoulderX + 8},${rightShoulderY - 15}`}
            fill="#22c55e"
          />
          <text x={rightShoulderX} y={rightShoulderY - 20} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
            Правое плечо
          </text>
        </g>
        
        {/* Подпись линии шеи */}
        <text 
          x={(leftTroughX + rightTroughX) / 2} 
          y={(necklineStartY + necklineEndY) / 2 + 20} 
          fill="#22c55e" 
          fontSize="12" 
          fontWeight="bold" 
          textAnchor="middle"
        >
          Линия шеи
        </text>
      </g>
    );
  } catch (error) {
    console.error('Error rendering head and shoulders:', error);
    return null;
  }
}

function renderFlag(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 5) return null;
  
  // Древко флага (первые 30% - сильное движение)
  const poleEnd = Math.floor(slice.length * 0.3);
  const poleStart = slice[0];
  const poleEndCandle = slice[poleEnd];
  const poleStartY = priceToY(poleStart.low);
  const poleEndY = priceToY(poleEndCandle.high);
  const poleX = indexToX(safeStartIdx);
  
  // Полотнище флага (остальные 70% - консолидация)
  const flagStart = poleEnd;
  const flagEnd = slice.length - 1;
  const flagStartCandle = slice[flagStart];
  const flagEndCandle = slice[flagEnd];
  
  // Верхняя и нижняя границы флага
  const flagTopStart = priceToY(flagStartCandle.high);
  const flagTopEnd = priceToY(flagEndCandle.high);
  const flagBottomStart = priceToY(flagStartCandle.low);
  const flagBottomEnd = priceToY(flagEndCandle.low);
  
  const flagStartX = indexToX(safeStartIdx + flagStart);
  const flagEndX = indexToX(safeStartIdx + flagEnd);
  
  return (
    <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
      {/* Древко флага - толстая линия */}
      <line
        x1={poleX}
        y1={poleStartY}
        x2={poleX}
        y2={poleEndY}
        stroke="#22c55e"
        strokeWidth={5}
        opacity={0.9}
        style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.7))' }}
      />
      {/* Полотнище флага - верхняя линия */}
      <line
        x1={flagStartX}
        y1={flagTopStart}
        x2={flagEndX}
        y2={flagTopEnd}
        stroke="#22c55e"
        strokeWidth={2.5}
        strokeDasharray="6,4"
        opacity={0.9}
      />
      {/* Полотнище флага - нижняя линия */}
      <line
        x1={flagStartX}
        y1={flagBottomStart}
        x2={flagEndX}
        y2={flagBottomEnd}
        stroke="#22c55e"
        strokeWidth={2.5}
        strokeDasharray="6,4"
        opacity={0.9}
      />
      {/* Заливка полотнища (светло-зеленая) */}
      <polygon
        points={`${flagStartX},${flagTopStart} ${flagEndX},${flagTopEnd} ${flagEndX},${flagBottomEnd} ${flagStartX},${flagBottomStart}`}
        fill="rgba(34, 197, 94, 0.15)"
        stroke="none"
        opacity={0.4}
      />
      {/* Подписи с фоном */}
      <rect
        x={poleX - 40}
        y={(poleStartY + poleEndY) / 2 - 8}
        width={80}
        height={16}
        fill="rgba(34, 197, 94, 0.9)"
        rx={4}
        stroke="#22c55e"
        strokeWidth={1}
      />
      <text x={poleX} y={(poleStartY + poleEndY) / 2 + 4} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
        Древко
      </text>
      <rect
        x={(flagStartX + flagEndX) / 2 - 25}
        y={(flagTopStart + flagBottomStart) / 2 - 8}
        width={50}
        height={16}
        fill="rgba(34, 197, 94, 0.9)"
        rx={4}
        stroke="#22c55e"
        strokeWidth={1}
      />
      <text x={(flagStartX + flagEndX) / 2} y={(flagTopStart + flagBottomStart) / 2 + 4} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
        Флаг
      </text>
    </g>
  );
  } catch (error) {
    console.error('Error rendering flag:', error);
    return null;
  }
}

function renderPennant(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 5) return null;
  
  // Древко (первые 30%)
  const poleEnd = Math.floor(slice.length * 0.3);
  const poleStart = slice[0];
  const poleEndCandle = slice[poleEnd];
  const poleStartY = priceToY(poleStart.low);
  const poleEndY = priceToY(poleEndCandle.high);
  const poleX = indexToX(startIdx);
  
  // Вымпел (треугольник - остальные 70%)
  const pennantStart = poleEnd;
  const pennantEnd = slice.length - 1;
  const pennantStartCandle = slice[pennantStart];
  const pennantEndCandle = slice[pennantEnd];
  
  const pennantTopStart = priceToY(pennantStartCandle.high);
  const pennantBottomStart = priceToY(pennantStartCandle.low);
  const pennantCenterEnd = priceToY((pennantEndCandle.high + pennantEndCandle.low) / 2);
  
  const pennantStartX = indexToX(startIdx + pennantStart);
  const pennantEndX = indexToX(startIdx + pennantEnd);
  
  return (
    <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
      {/* Древко */}
      <line
        x1={poleX}
        y1={poleStartY}
        x2={poleX}
        y2={poleEndY}
        stroke="#22c55e"
        strokeWidth={4}
        opacity={0.8}
      />
      {/* Вымпел - треугольник */}
      <polygon
        points={`${pennantStartX},${pennantTopStart} ${pennantStartX},${pennantBottomStart} ${pennantEndX},${pennantCenterEnd}`}
        fill="rgba(34, 197, 94, 0.15)"
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="5,3"
        opacity={0.8}
      />
      <text x={poleX - 30} y={(poleStartY + poleEndY) / 2} fill="#22c55e" fontSize="10" fontWeight="bold">
        Древко
      </text>
      <text x={(pennantStartX + pennantEndX) / 2} y={pennantCenterEnd} fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">
        Вымпел
      </text>
    </g>
  );
  } catch (error) {
    console.error('Error rendering pennant:', error);
    return null;
  }
}

function renderTriangle(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 5) return null;
  
  const startCandle = slice[0];
  const endCandle = slice[slice.length - 1];
  const midCandle = slice[Math.floor(slice.length / 2)];
  
  const topStart = priceToY(startCandle.high);
  const topEnd = priceToY(endCandle.high);
  const bottomStart = priceToY(startCandle.low);
  const bottomEnd = priceToY(endCandle.low);
  const apexY = priceToY((midCandle.high + midCandle.low) / 2);
  
  const startX = indexToX(startIdx);
  const endX = indexToX(startIdx + slice.length - 1);
  const apexX = indexToX(startIdx + Math.floor(slice.length / 2));
  
  return (
    <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
      {/* Верхняя линия треугольника */}
      <line
        x1={startX}
        y1={topStart}
        x2={apexX}
        y2={apexY}
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="5,3"
        opacity={0.8}
      />
      {/* Нижняя линия треугольника */}
      <line
        x1={startX}
        y1={bottomStart}
        x2={apexX}
        y2={apexY}
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="5,3"
        opacity={0.8}
      />
      {/* Заливка */}
      <polygon
        points={`${startX},${topStart} ${startX},${bottomStart} ${apexX},${apexY}`}
        fill="rgba(34, 197, 94, 0.1)"
        stroke="none"
      />
      <text x={apexX} y={apexY - 10} fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">
        Треугольник
      </text>
    </g>
  );
  } catch (error) {
    console.error('Error rendering triangle:', error);
    return null;
  }
}

function renderDoubleTop(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 10) return null;
  
  const firstHalf = slice.slice(0, Math.floor(slice.length / 2));
  const secondHalf = slice.slice(Math.floor(slice.length / 2));
  
  const firstTop = Math.max(...firstHalf.map(d => d.high));
  const firstTopIdx = firstHalf.findIndex(d => d.high === firstTop);
  const firstTopX = indexToX(startIdx + firstTopIdx);
  const firstTopY = priceToY(firstTop);
  
  const secondTop = Math.max(...secondHalf.map(d => d.high));
  const secondTopIdx = secondHalf.findIndex(d => d.high === secondTop);
  const secondTopX = indexToX(startIdx + Math.floor(slice.length / 2) + secondTopIdx);
  const secondTopY = priceToY(secondTop);
  
  // Линия поддержки (минимум между вершинами)
  const between = slice.slice(firstTopIdx, Math.floor(slice.length / 2) + secondTopIdx);
  const supportLevel = Math.min(...between.map(d => d.low));
  const supportY = priceToY(supportLevel);
  
  return (
    <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
      {/* Линия поддержки */}
      <line
        x1={firstTopX}
        y1={supportY}
        x2={secondTopX}
        y2={supportY}
        stroke="#ef4444"
        strokeWidth={3}
        strokeDasharray="8,4"
        opacity={0.8}
      />
      {/* Первая вершина */}
      <circle cx={firstTopX} cy={firstTopY} r={8} fill="#ef4444" opacity={0.7} />
      <line x1={firstTopX} y1={firstTopY} x2={firstTopX} y2={supportY} stroke="#ef4444" strokeWidth={2} opacity={0.6} />
      {/* Вторая вершина */}
      <circle cx={secondTopX} cy={secondTopY} r={8} fill="#ef4444" opacity={0.7} />
      <line x1={secondTopX} y1={secondTopY} x2={secondTopX} y2={supportY} stroke="#ef4444" strokeWidth={2} opacity={0.6} />
      {/* Подписи */}
      <text x={firstTopX} y={firstTopY - 15} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">
        Вершина 1
      </text>
      <text x={secondTopX} y={secondTopY - 15} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">
        Вершина 2
      </text>
      <text x={(firstTopX + secondTopX) / 2} y={supportY + 20} fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">
        Линия поддержки
      </text>
    </g>
  );
  } catch (error) {
    console.error('Error rendering double top:', error);
    return null;
  }
}

function renderDoubleBottom(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 10) return null;
  
  const firstHalf = slice.slice(0, Math.floor(slice.length / 2));
  const secondHalf = slice.slice(Math.floor(slice.length / 2));
  
  const firstBottom = Math.min(...firstHalf.map(d => d.low));
  const firstBottomIdx = firstHalf.findIndex(d => d.low === firstBottom);
  const firstBottomX = indexToX(startIdx + firstBottomIdx);
  const firstBottomY = priceToY(firstBottom);
  
  const secondBottom = Math.min(...secondHalf.map(d => d.low));
  const secondBottomIdx = secondHalf.findIndex(d => d.low === secondBottom);
  const secondBottomX = indexToX(startIdx + Math.floor(slice.length / 2) + secondBottomIdx);
  const secondBottomY = priceToY(secondBottom);
  
  // Линия сопротивления (максимум между впадинами)
  const between = slice.slice(firstBottomIdx, Math.floor(slice.length / 2) + secondBottomIdx);
  const resistanceLevel = Math.max(...between.map(d => d.high));
  const resistanceY = priceToY(resistanceLevel);
  
  return (
    <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
      {/* Линия сопротивления */}
      <line
        x1={firstBottomX}
        y1={resistanceY}
        x2={secondBottomX}
        y2={resistanceY}
        stroke="#22c55e"
        strokeWidth={3}
        strokeDasharray="8,4"
        opacity={0.8}
      />
      {/* Первая впадина */}
      <circle cx={firstBottomX} cy={firstBottomY} r={8} fill="#22c55e" opacity={0.7} />
      <line x1={firstBottomX} y1={firstBottomY} x2={firstBottomX} y2={resistanceY} stroke="#22c55e" strokeWidth={2} opacity={0.6} />
      {/* Вторая впадина */}
      <circle cx={secondBottomX} cy={secondBottomY} r={8} fill="#22c55e" opacity={0.7} />
      <line x1={secondBottomX} y1={secondBottomY} x2={secondBottomX} y2={resistanceY} stroke="#22c55e" strokeWidth={2} opacity={0.6} />
      {/* Подписи */}
      <text x={firstBottomX} y={firstBottomY + 25} fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">
        Впадина 1
      </text>
      <text x={secondBottomX} y={secondBottomY + 25} fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">
        Впадина 2
      </text>
      <text x={(firstBottomX + secondBottomX) / 2} y={resistanceY - 10} fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">
        Линия сопротивления
      </text>
    </g>
  );
  } catch (error) {
    console.error('Error rendering double bottom:', error);
    return null;
  }
}

// Функция для отрисовки гармонических паттернов
function renderHarmonicPattern(
  data: CandlestickData[],
  startIdx: number,
  endIdx: number,
  priceToY: (price: number) => number,
  indexToX: (index: number) => number,
  height: number,
  patternType: 'butterfly' | 'bat' | 'crab' | 'shark' | 'five_zero',
  interactive: boolean,
  onClick: () => void
) {
  try {
    if (!data || data.length === 0) return null;
    const safeStartIdx = Math.max(0, Math.min(startIdx, data.length - 1));
    const safeEndIdx = Math.max(safeStartIdx + 1, Math.min(endIdx, data.length - 1));
    const slice = data.slice(safeStartIdx, safeEndIdx + 1);
    if (slice.length < 20) return null;
    
    // Разделяем данные на 5 точек для гармонического паттерна
    const fifth = Math.floor(slice.length / 5);
    const pointX = slice[0];
    const pointA = slice[fifth];
    const pointB = slice[fifth * 2];
    const pointC = slice[fifth * 3];
    const pointD = slice[slice.length - 1];
    
    const xX = indexToX(safeStartIdx);
    const xA = indexToX(safeStartIdx + fifth);
    const xB = indexToX(safeStartIdx + fifth * 2);
    const xC = indexToX(safeStartIdx + fifth * 3);
    const xD = indexToX(safeStartIdx + slice.length - 1);
    
    const yX = priceToY((pointX.high + pointX.low) / 2);
    const yA = priceToY((pointA.high + pointA.low) / 2);
    const yB = priceToY((pointB.high + pointB.low) / 2);
    const yC = priceToY((pointC.high + pointC.low) / 2);
    const yD = priceToY((pointD.high + pointD.low) / 2);
    
    const color = yD < yX ? '#22c55e' : '#ef4444'; // Бычий или медвежий
    
    return (
      <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={onClick}>
        {/* Линии паттерна */}
        <line x1={xX} y1={yX} x2={xA} y2={yA} stroke={color} strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />
        <line x1={xA} y1={yA} x2={xB} y2={yB} stroke={color} strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />
        <line x1={xB} y1={yB} x2={xC} y2={yC} stroke={color} strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />
        <line x1={xC} y1={yC} x2={xD} y2={yD} stroke={color} strokeWidth={2} strokeDasharray="5,3" opacity={0.7} />
        
        {/* Точки паттерна */}
        <circle cx={xX} cy={yX} r={6} fill={color} opacity={0.8} />
        <circle cx={xA} cy={yA} r={6} fill={color} opacity={0.8} />
        <circle cx={xB} cy={yB} r={6} fill={color} opacity={0.8} />
        <circle cx={xC} cy={yC} r={6} fill={color} opacity={0.8} />
        <circle cx={xD} cy={yD} r={8} fill={color} opacity={1} style={{ filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))' }} />
        
        {/* Подписи точек */}
        <text x={xX} y={yX - 12} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle">X</text>
        <text x={xA} y={yA - 12} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle">A</text>
        <text x={xB} y={yB - 12} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle">B</text>
        <text x={xC} y={yC - 12} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle">C</text>
        <text x={xD} y={yD - 15} fill={color} fontSize="10" fontWeight="bold" textAnchor="middle">D ⭐</text>
        
        {/* Название паттерна */}
        <text x={(xX + xD) / 2} y={Math.min(yX, yA, yB, yC, yD) - 25} fill={color} fontSize="11" fontWeight="bold" textAnchor="middle">
          {patternType === 'butterfly' ? 'Бабочка' :
           patternType === 'bat' ? 'Летучая мышь' :
           patternType === 'crab' ? 'Краб' :
           patternType === 'shark' ? 'Акула' :
           '5-0'}
        </text>
      </g>
    );
  } catch (error) {
    console.error('Error rendering harmonic pattern:', error);
    return null;
  }
}

