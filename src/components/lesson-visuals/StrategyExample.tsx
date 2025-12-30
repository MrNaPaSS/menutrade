import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SupportResistanceChart } from './SupportResistanceChart';
import { TrendChart } from './TrendChart';
import { CandlestickChart } from './CandlestickChart';
import type { CandlestickData } from './types';
import { getChartConfig, getCandlestickData } from './chartConfigLoader';

type StrategyType = 'trend' | 'bounce' | 'breakout' | 'news' | 'strike_zone';

interface StrategyExampleProps {
  data?: CandlestickData[];
  lessonId?: string;
  strategy: StrategyType;
  interactive?: boolean;
  className?: string;
  height?: number;
}

export function StrategyExample({
  data: externalData,
  lessonId,
  strategy: externalStrategy,
  interactive: externalInteractive,
  className,
  height = 300,
}: StrategyExampleProps) {
  // Загружаем конфигурацию из lesson-chart-configs, если указан lessonId
  const lessonConfig = useMemo(() => {
    if (!lessonId) return null;
    return getChartConfig(lessonId, 'StrategyExample');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    if (!lessonId) return null;
    return getCandlestickData(lessonId, 'StrategyExample');
  }, [lessonId]);

  // Приоритет: внешние пропы > конфигурация урока > значения по умолчанию
  const data = externalData || lessonData || undefined;
  const strategy = externalStrategy || (lessonConfig?.strategy as StrategyType) || 'trend';
  const interactive = externalInteractive !== undefined ? externalInteractive : (lessonConfig?.interactive !== false);
  // Генерируем данные для конкретной стратегии
  const strategyData = useMemo(() => {
    if (data && data.length > 0) {
      return data;
    }

    // Генерируем данные в зависимости от стратегии
    const basePrice = 1.1000;
    const count = 50;
    const generated: CandlestickData[] = [];
    let currentPrice = basePrice;
    const now = new Date();

    switch (strategy) {
      case 'trend': {
        // Восходящий тренд
        for (let i = count - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 15 * 60 * 1000);
          const trend = 0.0001 * (count - i) / count;
          const volatility = 0.0005;
          const change = trend + (Math.random() - 0.5) * volatility;
          const open = currentPrice;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * volatility * 0.3;
          const low = Math.min(open, close) - Math.random() * volatility * 0.3;

          generated.push({
            time: time.toISOString(),
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 1000 + 500),
          });

          currentPrice = close;
        }
        break;
      }

      case 'bounce': {
        // Данные с уровнями для отскока
        const supportLevel = basePrice - 0.002;
        for (let i = count - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 15 * 60 * 1000);
          const volatility = 0.001;
          let change = (Math.random() - 0.5) * volatility;

          // Отскок от поддержки
          if (currentPrice < supportLevel + 0.0005) {
            change = Math.abs(change) * 0.5; // Отскок вверх
          }

          const open = currentPrice;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * volatility * 0.3;
          const low = Math.min(open, close, supportLevel - 0.0001);

          generated.push({
            time: time.toISOString(),
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 1000 + 500),
          });

          currentPrice = close;
        }
        break;
      }

      case 'breakout': {
        // Данные с пробоем уровня
        const resistanceLevel = basePrice + 0.001;
        for (let i = count - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 15 * 60 * 1000);
          const volatility = 0.001;
          let change = (Math.random() - 0.5) * volatility;

          // Пробой сопротивления
          if (i < count / 2) {
            // До пробоя - консолидация
            if (currentPrice > resistanceLevel - 0.0003) {
              change = -Math.abs(change) * 0.3;
            }
          } else {
            // После пробоя - рост
            if (currentPrice > resistanceLevel) {
              change = Math.abs(change) * 1.5;
            }
          }

          const open = currentPrice;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * volatility * 0.3;
          const low = Math.min(open, close) - Math.random() * volatility * 0.3;

          generated.push({
            time: time.toISOString(),
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 1000 + 500),
          });

          currentPrice = close;
        }
        break;
      }

      default:
        // Стандартные данные
        for (let i = count - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 15 * 60 * 1000);
          const volatility = 0.002;
          const change = (Math.random() - 0.5) * volatility;
          const open = currentPrice;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * volatility * 0.5;
          const low = Math.min(open, close) - Math.random() * volatility * 0.5;

          generated.push({
            time: time.toISOString(),
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 1000 + 500),
          });

          currentPrice = close;
        }
    }

    return generated;
  }, [data, strategy]);

  // Выбираем компонент в зависимости от стратегии
  const renderStrategy = () => {
    switch (strategy) {
      case 'trend':
        return (
          <TrendChart
            data={strategyData}
            trendType="up"
            interactive={interactive}
            height={height}
          />
        );

      case 'bounce':
        return (
          <SupportResistanceChart
            data={strategyData}
            showBounces={true}
            interactive={interactive}
            height={height}
          />
        );

      case 'breakout':
        return (
          <SupportResistanceChart
            data={strategyData}
            showBounces={false}
            interactive={interactive}
            height={height}
          />
        );

      case 'news':
      case 'strike_zone':
      default:
        return (
          <CandlestickChart
            data={strategyData}
            showLevels={true}
            interactive={interactive}
            height={height}
          />
        );
    }
  };

  return (
    <div className={cn('relative', className)}>
      {renderStrategy()}

      {/* Подсказка стратегии */}
      <div className="mt-2 p-2 sm:p-3 glass-card rounded-lg neon-border bg-primary/5 break-words overflow-wrap-anywhere">
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 break-words whitespace-normal">
          Стратегия: <span className="text-primary font-semibold">{getStrategyName(strategy)}</span>
        </p>
        <p className="text-[10px] sm:text-xs text-foreground/80 break-words whitespace-normal">
          {getStrategyDescription(strategy)}
        </p>
      </div>
    </div>
  );
}

function getStrategyName(strategy: StrategyType): string {
  const names: Record<StrategyType, string> = {
    trend: 'Тренд - мой друг',
    bounce: 'Отскок от уровней',
    breakout: 'Пробой уровней',
    news: 'Новостная торговля',
    strike_zone: 'Страйк-зона',
  };
  return names[strategy] || strategy;
}

function getStrategyDescription(strategy: StrategyType): string {
  const descriptions: Record<StrategyType, string> = {
    trend: 'Торговля только в направлении тренда. Ищите входы на откатах к линии тренда.',
    bounce: 'Торговля от сильных уровней поддержки и сопротивления. Ждите подтверждения отскока.',
    breakout: 'Торговля на пробоях сильных уровней. Подтверждайте пробой закрытием свечи за уровнем.',
    news: 'Торговля на важных экономических новостях. Входите после подтверждения направления движения.',
    strike_zone: 'Комбинирование нескольких сигналов: индикаторов, уровней и паттернов для повышения точности.',
  };
  return descriptions[strategy] || 'Пример стратегии торговли';
}

