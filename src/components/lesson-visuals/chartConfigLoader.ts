// Утилита для загрузки конфигураций графиков для уроков

import { getLessonChartConfig, type LessonChartConfig } from '@/data/lesson-chart-configs';
import type {
  CandlestickData,
  SupportResistanceLevel,
  TrendLine,
  IndicatorData,
  PatternData,
} from './types';

export type ChartType = 
  | 'CandlestickChart' 
  | 'SupportResistanceChart' 
  | 'TrendChart' 
  | 'IndicatorChart' 
  | 'PatternChart' 
  | 'StrategyExample' 
  | 'SessionActivityChart' 
  | 'NewsImpactChart' 
  | 'TimeframeComparison'
  | 'InteractiveExample';

/**
 * Загружает конфигурацию графика для урока
 * @param lessonId ID урока
 * @param chartType Тип графика
 * @returns Конфигурация графика или null, если не найдена
 */
export function loadLessonChartConfig(
  lessonId: string,
  chartType: ChartType
): LessonChartConfig | null {
  if (!lessonId || !chartType) {
    return null;
  }
  
  return getLessonChartConfig(lessonId, chartType);
}

/**
 * Извлекает данные для CandlestickChart из конфигурации
 * Также может получать данные из IndicatorChart и SupportResistanceChart (так как они используют CandlestickChart для графика цены)
 */
export function getCandlestickData(
  lessonId: string,
  chartType: ChartType
): CandlestickData[] | null {
  const config = loadLessonChartConfig(lessonId, chartType);
  if (!config) {
    return null;
  }
  
  // IndicatorChart, SupportResistanceChart, TrendChart, PatternChart, StrategyExample и InteractiveExample также содержат данные для CandlestickChart
  if (config.chartType === 'CandlestickChart' || 
      config.chartType === 'IndicatorChart' || 
      config.chartType === 'SupportResistanceChart' ||
      config.chartType === 'TrendChart' ||
      config.chartType === 'PatternChart' ||
      config.chartType === 'StrategyExample' ||
      config.chartType === 'InteractiveExample') {
    return config.data as CandlestickData[] | null;
  }
  
  return null;
}

/**
 * Извлекает уровни поддержки/сопротивления из конфигурации
 */
export function getSupportResistanceLevels(
  lessonId: string,
  chartType: ChartType
): SupportResistanceLevel[] | null {
  const config = loadLessonChartConfig(lessonId, chartType);
  if (!config || config.chartType !== 'SupportResistanceChart') {
    return null;
  }
  
  return config.data as SupportResistanceLevel[] | null;
}

/**
 * Извлекает линии тренда из конфигурации
 */
export function getTrendLines(
  lessonId: string,
  chartType: ChartType
): TrendLine[] | null {
  const config = loadLessonChartConfig(lessonId, chartType);
  if (!config || config.chartType !== 'TrendChart') {
    return null;
  }
  
  return config.data as TrendLine[] | null;
}

/**
 * Извлекает данные индикатора из конфигурации
 */
export function getIndicatorData(
  lessonId: string,
  chartType: ChartType
): IndicatorData[] | null {
  const config = loadLessonChartConfig(lessonId, chartType);
  if (!config || config.chartType !== 'IndicatorChart') {
    return null;
  }
  
  return config.data as IndicatorData[] | null;
}

/**
 * Извлекает данные паттерна из конфигурации
 */
export function getPatternData(
  lessonId: string,
  chartType: ChartType
): PatternData[] | null {
  const config = loadLessonChartConfig(lessonId, chartType);
  if (!config || config.chartType !== 'PatternChart') {
    return null;
  }
  
  return config.data as PatternData[] | null;
}

/**
 * Получает настройки конфигурации для графика
 */
export function getChartConfig(
  lessonId: string,
  chartType: ChartType
): LessonChartConfig['config'] | null {
  const config = loadLessonChartConfig(lessonId, chartType);
  if (!config) {
    return null;
  }
  
  // Убеждаемся, что interactive по умолчанию true
  return {
    ...config.config,
    interactive: config.config.interactive !== false,
  };
}

