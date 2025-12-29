import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CandlestickChart } from './CandlestickChart';
import type { ChartConfig, CandlestickData } from './types';
import { getCandlestickData, getChartConfig } from './chartConfigLoader';

const timeframes: ChartConfig['timeframe'][] = ['M1', 'M5', 'M15', 'M30', 'H1'];

interface InteractiveExampleProps {
  lessonId: string;
  title?: string;
  description?: string;
  defaultTimeframe?: ChartConfig['timeframe'];
  customData?: CandlestickData[];
  showLevels?: boolean;
  showPatterns?: boolean;
  highlightPattern?: string; // Название паттерна для подсветки
  className?: string;
}

export function InteractiveExample({
  lessonId,
  title,
  description,
  defaultTimeframe = 'M15',
  customData,
  showLevels = true,
  showPatterns = true,
  highlightPattern,
  className,
}: InteractiveExampleProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartConfig['timeframe']>(defaultTimeframe);
  
  // Загружаем конфигурацию и данные для урока
  const lessonConfig = useMemo(() => {
    return getChartConfig(lessonId, 'InteractiveExample');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    return getCandlestickData(lessonId, 'InteractiveExample');
  }, [lessonId]);

  // Используем кастомные данные, данные урока или генерируем
  const chartData = useMemo(() => {
    if (customData && customData.length > 0) {
      return customData;
    }
    if (lessonData && lessonData.length > 0) {
      return lessonData;
    }
    return undefined; // CandlestickChart сгенерирует сам
  }, [customData, lessonData]);

  // Описание таймфрейма для урока
  const timeframeDescription = useMemo(() => {
    if (lessonConfig?.timeframeDescription) {
      return lessonConfig.timeframeDescription[selectedTimeframe] || getDefaultTimeframeDescription(selectedTimeframe);
    }
    return getDefaultTimeframeDescription(selectedTimeframe);
  }, [selectedTimeframe, lessonConfig]);

  // Заголовок и описание
  const displayTitle = title || lessonConfig?.title || 'Интерактивный пример';
  const displayDescription = description || lessonConfig?.description || 'Профессиональный подход предполагает анализ на нескольких таймфреймах для повышения точности сигналов.';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Заголовок и описание */}
      {(displayTitle || displayDescription) && (
        <div className="space-y-2">
          {displayTitle && (
            <h3 className="text-lg font-semibold text-foreground">{displayTitle}</h3>
          )}
          {displayDescription && (
            <p className="text-sm text-muted-foreground">{displayDescription}</p>
          )}
        </div>
      )}

      {/* Переключение таймфреймов */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant={selectedTimeframe === tf ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-w-[44px] h-9',
              selectedTimeframe === tf && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setSelectedTimeframe(tf)}
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* График */}
      <div className="glass-card rounded-lg p-2 sm:p-3 neon-border bg-primary/5">
        <CandlestickChart
          data={chartData}
          lessonId={lessonId}
          timeframe={selectedTimeframe}
          showLevels={showLevels}
          showPatterns={showPatterns}
          interactive={true}
          height={300}
          highlightedIndices={chartData && chartData.length > 0 
            ? [2, 3, 4, 5, 6, 7, 8].filter(idx => idx < chartData.length)
            : []}
        />
      </div>

      {/* Описание таймфрейма */}
      <div className="glass-card rounded-lg p-2 sm:p-3 neon-border bg-primary/5">
        <p className="text-xs text-muted-foreground mb-1">
          Таймфрейм: <span className="text-primary font-semibold">{selectedTimeframe}</span>
        </p>
        <p className="text-xs text-foreground/80">
          {timeframeDescription}
        </p>
      </div>
    </div>
  );
}

function getDefaultTimeframeDescription(timeframe: ChartConfig['timeframe']): string {
  const descriptions: Record<ChartConfig['timeframe'], string> = {
    M1: '1 минута - для скальпинга, высокая волатильность, требует быстрой реакции',
    M5: '5 минут - краткосрочная торговля, хороший баланс между скоростью и анализом',
    M15: '15 минут - оптимальный таймфрейм для большинства стратегий, достаточное время для реализации сигнала',
    M30: '30 минут - среднесрочный анализ, меньше ложных сигналов, требует терпения',
    H1: '1 час - дневная торговля, более стабильные тренды, подходит для начинающих',
    H4: '4 часа - долгосрочный анализ, сильные тренды, меньше сделок но выше точность',
  };
  return descriptions[timeframe] || 'Описание таймфрейма';
}

