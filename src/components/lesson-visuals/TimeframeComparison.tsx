import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CandlestickChart } from './CandlestickChart';
import type { ChartConfig } from './types';

const timeframes: ChartConfig['timeframe'][] = ['M1', 'M5', 'M15', 'M30', 'H1'];

export function TimeframeComparison({
  lessonId,
  interactive = true,
  className,
}: {
  lessonId?: string;
  interactive?: boolean;
  className?: string;
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChartConfig['timeframe']>('M15');
  
  return (
    <div className={cn('space-y-4', className)}>
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
      
      {/* График выбранного таймфрейма */}
      <CandlestickChart
        timeframe={selectedTimeframe}
        showLevels={true}
        interactive={true}
        height={300}
      />
      
      {/* Описание таймфрейма */}
      <div className="glass-card rounded-lg p-2 sm:p-3 neon-border bg-primary/5 break-words overflow-wrap-anywhere">
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 break-words whitespace-normal">
          Таймфрейм: <span className="text-primary font-semibold">{selectedTimeframe}</span>
        </p>
        <p className="text-[10px] sm:text-xs text-foreground/80 break-words whitespace-normal">
          {getTimeframeDescription(selectedTimeframe)}
        </p>
      </div>
    </div>
  );
}

function getTimeframeDescription(timeframe: ChartConfig['timeframe']): string {
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

