import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CandlestickChart } from './CandlestickChart';
import type { CandlestickData, IndicatorData } from './types';
import { formatPrice } from './utils';
import { getIndicatorData, getChartConfig, getCandlestickData } from './chartConfigLoader';

type IndicatorType = 'rsi' | 'macd' | 'stochastic' | 'bollinger';

interface IndicatorChartProps {
  data?: CandlestickData[];
  lessonId?: string;
  type?: IndicatorType; // Поддержка как 'type', так и 'indicatorType'
  indicatorType?: IndicatorType;
  interactive?: boolean;
  className?: string;
  height?: number;
}

export const IndicatorChart = React.memo(function IndicatorChart({
  data: externalData,
  lessonId,
  type: externalType,
  indicatorType: externalIndicatorType,
  interactive: externalInteractive,
  className,
  height = 300,
}: IndicatorChartProps) {
  // Загружаем конфигурацию из lesson-chart-configs, если указан lessonId
  const lessonConfig = useMemo(() => {
    if (!lessonId) return null;
    return getChartConfig(lessonId, 'IndicatorChart');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    if (!lessonId) return null;
    return getCandlestickData(lessonId, 'IndicatorChart');
  }, [lessonId]);

  const lessonIndicatorData = useMemo(() => {
    if (!lessonId) return null;
    return getIndicatorData(lessonId, 'IndicatorChart');
  }, [lessonId]);

  // Приоритет: внешние пропы (type или indicatorType) > конфигурация урока > значения по умолчанию
  const data = externalData || lessonData || undefined;
  const indicatorType = externalType || externalIndicatorType || (lessonConfig?.indicatorType as IndicatorType) || 'rsi';
  const interactive = externalInteractive !== undefined ? externalInteractive : (lessonConfig?.interactive !== false);
  const [selectedPoint, setSelectedPoint] = useState<{ time: string; value: number; signal?: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Вычисляем значения индикатора
  const indicatorData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    switch (indicatorType) {
      case 'rsi':
        return calculateRSI(data);
      case 'macd':
        return calculateMACD(data);
      case 'stochastic':
        return calculateStochastic(data);
      case 'bollinger':
        return calculateBollingerBands(data);
      default:
        return [];
    }
  }, [data, indicatorType]);

  const handlePointClick = useCallback((point: { time: string; value: number; signal?: string }) => {
    if (interactive) {
      setSelectedPoint(point);
      setIsDialogOpen(true);
    }
  }, [interactive]);

  // Отрисовка индикатора
  const renderIndicator = () => {
    const chartWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 400 : 800;
    const chartHeight = height * 0.4; // Индикатор занимает 40% высоты
    
    switch (indicatorType) {
      case 'rsi':
        return renderRSI(chartWidth, chartHeight, indicatorData, handlePointClick, interactive);
      case 'macd':
        return renderMACD(chartWidth, chartHeight, indicatorData, handlePointClick, interactive);
      case 'stochastic':
        return renderStochastic(chartWidth, chartHeight, indicatorData, handlePointClick, interactive);
      case 'bollinger':
        return renderBollingerBands(chartWidth, chartHeight, indicatorData, handlePointClick, interactive);
      default:
        return null;
    }
  };

  return (
    <>
      <div className={cn('relative', className)}>
        {/* График свечей (60% высоты) */}
        <div style={{ height: `${height * 0.6}px` }}>
          <CandlestickChart
            data={data}
            showLevels={false}
            showPatterns={false}
            interactive={interactive}
            height={height * 0.6}
          />
        </div>
        
        {/* Индикатор (40% высоты) */}
        <div
          className="glass-card rounded-xl p-3 neon-border bg-[#0a0a0a] mt-2"
          style={{ height: `${height * 0.4}px` }}
        >
          {renderIndicator()}
        </div>
      </div>

      {/* Модальное окно с деталями */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-background border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary text-base sm:text-lg">
              {getIndicatorName(indicatorType)}
            </DialogTitle>
          </DialogHeader>
          {selectedPoint && (
            <div className="space-y-3 mt-4 break-words overflow-wrap-anywhere">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Значение</p>
                <p className="font-mono text-base sm:text-lg font-bold text-foreground break-all">
                  {selectedPoint.value.toFixed(2)}
                </p>
              </div>
              {selectedPoint.signal && (
                <div className="pt-2 border-t border-border break-words overflow-wrap-anywhere">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Сигнал</p>
                  <p className={cn(
                    "text-xs sm:text-sm font-semibold break-words whitespace-normal",
                    selectedPoint.signal === 'buy' ? "text-primary" : 
                    selectedPoint.signal === 'sell' ? "text-destructive" : 
                    "text-muted-foreground"
                  )}>
                    {selectedPoint.signal === 'buy' ? 'Покупка (CALL)' : 
                     selectedPoint.signal === 'sell' ? 'Продажа (PUT)' : 
                     'Нейтрально'}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

// Вспомогательные функции для расчёта индикаторов
function calculateRSI(data: CandlestickData[], period: number = 14): IndicatorData[] {
  const changes: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    changes.push(change);
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  const result: IndicatorData[] = [];
  
  for (let i = period; i < changes.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
    if (rsi < 30) signal = 'buy';
    else if (rsi > 70) signal = 'sell';
    
    result.push({
      time: data[i + 1].time,
      value: rsi,
      signal,
    });
  }
  
  return result;
}

function calculateMACD(data: CandlestickData[]): IndicatorData[] {
  // Упрощённая версия MACD
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const result: IndicatorData[] = [];
  
  for (let i = 26; i < data.length; i++) {
    const macd = ema12[i] - ema26[i];
    let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
    
    if (i > 0 && macd > 0 && (ema12[i] - ema26[i]) > (ema12[i - 1] - ema26[i - 1])) {
      signal = 'buy';
    } else if (i > 0 && macd < 0 && (ema12[i] - ema26[i]) < (ema12[i - 1] - ema26[i - 1])) {
      signal = 'sell';
    }
    
    result.push({
      time: data[i].time,
      value: macd * 10000, // Масштабируем для отображения
      signal,
    });
  }
  
  return result;
}

function calculateStochastic(data: CandlestickData[], period: number = 14): IndicatorData[] {
  const result: IndicatorData[] = [];
  
  for (let i = period; i < data.length; i++) {
    const window = data.slice(i - period, i);
    const highest = Math.max(...window.map(d => d.high));
    const lowest = Math.min(...window.map(d => d.low));
    const current = data[i].close;
    
    const k = ((current - lowest) / (highest - lowest)) * 100;
    
    let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
    if (k < 20) signal = 'buy';
    else if (k > 80) signal = 'sell';
    
    result.push({
      time: data[i].time,
      value: k,
      signal,
    });
  }
  
  return result;
}

function calculateBollingerBands(data: CandlestickData[], period: number = 20, stdDev: number = 2): IndicatorData[] {
  const sma = calculateSMA(data, period);
  const result: IndicatorData[] = [];
  
  for (let i = period; i < data.length; i++) {
    const window = data.slice(i - period, i);
    const mean = sma[i];
    const variance = window.reduce((sum, d) => sum + Math.pow(d.close - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    const upper = mean + (standardDeviation * stdDev);
    const lower = mean - (standardDeviation * stdDev);
    const middle = mean;
    
    result.push({
      time: data[i].time,
      value: middle,
      signal: data[i].close > upper ? 'sell' : data[i].close < lower ? 'buy' : 'neutral',
    });
  }
  
  return result;
}

function calculateEMA(data: CandlestickData[], period: number): number[] {
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  ema[0] = data[0].close;
  
  for (let i = 1; i < data.length; i++) {
    ema[i] = (data[i].close - ema[i - 1]) * multiplier + ema[i - 1];
  }
  
  return ema;
}

function calculateSMA(data: CandlestickData[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      sma[i] = data[i].close;
    } else {
      const sum = data.slice(i - period, i).reduce((acc, d) => acc + d.close, 0);
      sma[i] = sum / period;
    }
  }
  
  return sma;
}

// Функции отрисовки
function renderRSI(
  width: number,
  height: number,
  data: IndicatorData[],
  onClick: (point: { time: string; value: number; signal?: string }) => void,
  interactive: boolean
) {
  const maxValue = 100;
  const minValue = 0;
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Недостаточно данных для расчёта RSI
      </div>
    );
  }
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox={`0 0 ${width} ${height}`} 
      preserveAspectRatio="none"
      style={{ touchAction: interactive ? 'none' : 'auto' }}
    >
      {/* Зоны перекупленности/перепроданности */}
      <rect x="0" y={height * 0.3} width={width} height={height * 0.4} fill="rgba(239, 68, 68, 0.1)" />
      <rect x="0" y={height * 0.7} width={width} height={height * 0.3} fill="rgba(34, 197, 94, 0.1)" />
      
      {/* Линия RSI с заливкой */}
      <defs>
        <linearGradient id="rsiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Заливка под линией */}
      <polygon
        points={`0,${height} ${data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * width;
          const y = height - ((d.value - minValue) / (maxValue - minValue)) * height;
          return `${x},${y}`;
        }).join(' ')} ${width},${height}`}
        fill="url(#rsiGradient)"
      />
      
      {/* Линия RSI */}
      <polyline
        points={data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * width;
          const y = height - ((d.value - minValue) / (maxValue - minValue)) * height;
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        className={interactive ? 'cursor-pointer' : ''}
      />
      
      {/* Интерактивные точки (упрощено для производительности) */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * width;
        const y = height - ((d.value - minValue) / (maxValue - minValue)) * height;
        const isSignal = d.signal && d.signal !== 'neutral';
        
        return (
          <g key={i}>
            {/* Невидимая область для клика */}
            <circle
              cx={x}
              cy={y}
              r={6}
              fill="transparent"
              className={interactive ? 'cursor-pointer' : ''}
              onClick={() => onClick(d)}
              onTouchStart={() => interactive && onClick(d)}
            />
            {/* Видимая точка для сигналов */}
            {isSignal && (
              <circle
                cx={x}
                cy={y}
                r={4}
                fill={d.signal === 'buy' ? '#22c55e' : '#ef4444'}
                className={interactive ? 'cursor-pointer' : ''}
                onClick={() => onClick(d)}
                onTouchStart={() => interactive && onClick(d)}
                style={{ 
                  filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))',
                }}
              />
            )}
          </g>
        );
      })}
      
      {/* Уровни */}
      <line x1="0" y1={height * 0.3} x2={width} y2={height * 0.3} stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" opacity={0.5} />
      <line x1="0" y1={height * 0.7} x2={width} y2={height * 0.7} stroke="#22c55e" strokeWidth="1" strokeDasharray="5,5" opacity={0.5} />
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#666" strokeWidth="1" strokeDasharray="2,2" opacity={0.3} />
      
                {/* Подписи уровней (только если достаточно места) */}
                {width > 300 && (
                  <>
                    <text x={width - 40} y={height * 0.3 - 5} fill="#ef4444" fontSize="9" fontWeight="bold">70</text>
                    <text x={width - 40} y={height * 0.7 + 15} fill="#22c55e" fontSize="9" fontWeight="bold">30</text>
                    <text x={width - 40} y={height * 0.5 + 5} fill="#666" fontSize="9">50</text>
                  </>
                )}
    </svg>
  );
}

function renderMACD(
  width: number,
  height: number,
  data: IndicatorData[],
  onClick: (point: { time: string; value: number; signal?: string }) => void,
  interactive: boolean
) {
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, -1);
  const range = maxValue - minValue || 1;
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Нулевая линия */}
      <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#666" strokeWidth="1" strokeDasharray="2,2" opacity={0.3} />
      
      {/* Гистограмма MACD */}
      {data.map((d, i) => {
        const x = (i / data.length) * width;
        const barHeight = Math.abs((d.value - minValue) / range) * height;
        const y = d.value >= 0 ? height * 0.5 - barHeight : height * 0.5;
        const color = d.value >= 0 ? '#22c55e' : '#ef4444';
        
        return (
          <rect
            key={i}
            x={x - 2}
            y={y}
            width={4}
            height={barHeight}
            fill={color}
            opacity={0.7}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={() => onClick(d)}
          />
        );
      })}
    </svg>
  );
}

function renderStochastic(
  width: number,
  height: number,
  data: IndicatorData[],
  onClick: (point: { time: string; value: number; signal?: string }) => void,
  interactive: boolean
) {
  return renderRSI(width, height, data, onClick, interactive); // Аналогично RSI
}

function renderBollingerBands(
  width: number,
  height: number,
  data: IndicatorData[],
  onClick: (point: { time: string; value: number; signal?: string }) => void,
  interactive: boolean
) {
  // Упрощённая версия - показываем только среднюю линию
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={data.map((d, i) => {
          const x = (i / data.length) * width;
          const y = height - ((d.value - minValue) / range) * height;
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        className={interactive ? 'cursor-pointer' : ''}
      />
    </svg>
  );
}

function getIndicatorName(type: IndicatorType): string {
  const names = {
    rsi: 'RSI (Relative Strength Index)',
    macd: 'MACD (Moving Average Convergence Divergence)',
    stochastic: 'Stochastic Oscillator',
    bollinger: 'Bollinger Bands',
  };
  return names[type] || 'Индикатор';
}

