import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CandlestickChart } from './CandlestickChart';
import type { CandlestickData, SupportResistanceLevel } from './types';
import { formatPrice } from './utils';
import { getSupportResistanceLevels, getChartConfig, getCandlestickData } from './chartConfigLoader';

interface SupportResistanceChartProps {
  data?: CandlestickData[];
  lessonId?: string;
  levels?: SupportResistanceLevel[];
  showBounces?: boolean;
  interactive?: boolean;
  className?: string;
  height?: number;
}

export const SupportResistanceChart = React.memo(function SupportResistanceChart({
  data: externalData,
  lessonId,
  levels: externalLevels,
  showBounces: externalShowBounces,
  interactive: externalInteractive,
  className,
  height = 300,
}: SupportResistanceChartProps) {
  // Загружаем конфигурацию из lesson-chart-configs, если указан lessonId
  const lessonConfig = useMemo(() => {
    if (!lessonId) return null;
    return getChartConfig(lessonId, 'SupportResistanceChart');
  }, [lessonId]);

  const lessonData = useMemo(() => {
    if (!lessonId) return null;
    return getCandlestickData(lessonId, 'SupportResistanceChart');
  }, [lessonId]);

  const lessonLevels = useMemo(() => {
    if (!lessonId) return null;
    return getSupportResistanceLevels(lessonId, 'SupportResistanceChart');
  }, [lessonId]);

  // Приоритет: внешние пропы > конфигурация урока > значения по умолчанию
  // Убеждаемся что данные это массив
  const data = useMemo(() => {
    const rawData = externalData || lessonData;
    if (!rawData) return undefined;
    if (Array.isArray(rawData) && rawData.length > 0) return rawData;
    return undefined;
  }, [externalData, lessonData]);
  const showBounces = externalShowBounces !== undefined ? externalShowBounces : (lessonConfig?.showBounces ?? true);
  const showZones = lessonConfig?.showZones ?? true;
  const showDynamicLevels = lessonConfig?.showDynamicLevels ?? false;
  const interactive = externalInteractive !== undefined ? externalInteractive : (lessonConfig?.interactive !== false);
  const [selectedLevel, setSelectedLevel] = useState<SupportResistanceLevel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Вычисляем уровни если не переданы - ENTERPRISE уровень анализа
  const levels = useMemo(() => {
    // Приоритет: externalLevels > lessonLevels > вычисленные уровни
    if (externalLevels && externalLevels.length > 0) {
      return externalLevels;
    }
    if (lessonLevels && lessonLevels.length > 0) {
      return lessonLevels;
    }
    
    if (!data || data.length === 0) return [];
    
    // Профессиональный анализ с множественными методами
    const highs: Array<{ price: number; index: number; volume?: number }> = [];
    const lows: Array<{ price: number; index: number; volume?: number }> = [];
    const lookback = 5;
    
    // Находим локальные экстремумы с учетом объема
    for (let i = lookback; i < data.length - lookback; i++) {
      const window = data.slice(i - lookback, i + lookback + 1);
      const currentHigh = data[i].high;
      const currentLow = data[i].low;
      
      if (currentHigh === Math.max(...window.map(d => d.high))) {
        highs.push({ 
          price: currentHigh, 
          index: i,
          volume: data[i].volume 
        });
      }
      if (currentLow === Math.min(...window.map(d => d.low))) {
        lows.push({ 
          price: currentLow, 
          index: i,
          volume: data[i].volume 
        });
      }
    }
    
    // Группируем близкие уровни с учетом силы
    const resistanceLevels: SupportResistanceLevel[] = [];
    const supportLevels: SupportResistanceLevel[] = [];
    const tolerance = 0.0005;
    
    // Психологические уровни (круглые числа)
    const psychologicalLevels = [1.0980, 1.0990, 1.1000, 1.1010, 1.1020];
    
    highs.forEach((high) => {
      // Проверяем психологические уровни
      const psychLevel = psychologicalLevels.find(p => Math.abs(p - high.price) < tolerance * 2);
      const basePrice = psychLevel || high.price;
      
      const existing = resistanceLevels.find(l => Math.abs(l.price - basePrice) < tolerance);
      if (existing) {
        existing.strength = (existing.strength || 1) + 1;
        if (!existing.touches) existing.touches = [];
        existing.touches.push(high.index);
        if (psychLevel) existing.isPsychological = true;
      } else {
        resistanceLevels.push({
          price: basePrice,
          type: 'resistance',
          strength: 1,
          touches: [high.index] || [],
          isPsychological: !!psychLevel,
          description: psychLevel ? 'Психологический уровень (круглое число)' : undefined,
        });
      }
    });
    
    lows.forEach((low) => {
      // Проверяем психологические уровни
      const psychLevel = psychologicalLevels.find(p => Math.abs(p - low.price) < tolerance * 2);
      const basePrice = psychLevel || low.price;
      
      const existing = supportLevels.find(l => Math.abs(l.price - basePrice) < tolerance);
      if (existing) {
        existing.strength = (existing.strength || 1) + 1;
        if (!existing.touches) existing.touches = [];
        existing.touches.push(low.index);
        if (psychLevel) existing.isPsychological = true;
      } else {
        supportLevels.push({
          price: basePrice,
          type: 'support',
          strength: 1,
          touches: [low.index] || [],
          isPsychological: !!psychLevel,
          description: psychLevel ? 'Психологический уровень (круглое число)' : undefined,
        });
      }
    });
    
    // Создаем зоны для сильных уровней (3+ теста)
    const strongLevels = [...supportLevels, ...resistanceLevels].filter(l => l.strength >= 3);
    strongLevels.forEach(level => {
      if (!level.zone) {
        level.zone = {
          upper: level.price + tolerance * 0.5,
          lower: level.price - tolerance * 0.5,
        };
      }
    });
    
    // Сортируем по силе и берём топ уровни
    const topResistance = resistanceLevels
      .sort((a, b) => {
        // Приоритет: психологические > по силе > по объему
        if (a.isPsychological && !b.isPsychological) return -1;
        if (!a.isPsychological && b.isPsychological) return 1;
        return (b.strength || 1) - (a.strength || 1);
      })
      .slice(0, 4);
    const topSupport = supportLevels
      .sort((a, b) => {
        if (a.isPsychological && !b.isPsychological) return -1;
        if (!a.isPsychological && b.isPsychological) return 1;
        return (b.strength || 1) - (a.strength || 1);
      })
      .slice(0, 4);
    
    return [...topSupport, ...topResistance];
  }, [data, externalLevels, lessonLevels]);

  const handleLevelClick = useCallback((level: SupportResistanceLevel) => {
    if (interactive) {
      setSelectedLevel(level);
      setIsDialogOpen(true);
    }
  }, [interactive]);

  // Вычисляем диапазон цен для отрисовки
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

  // Не рендерим если нет данных
  if (!data || data.length === 0 || priceRange.range === 0) {
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
      </div>
    );
  }

  // Проверяем что levels это массив
  if (!Array.isArray(levels)) {
    console.error('Levels is not an array:', levels);
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
      </div>
    );
  }

  return (
    <>
      <div className={cn('relative', className)}>
        <CandlestickChart
          data={data}
          lessonId={lessonId}
          showLevels={false}
          interactive={interactive}
          height={height}
        />
        
        {/* Отрисовка уровней поверх графика */}
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
            {/* Зоны поддержки/сопротивления (заливка) */}
            {showZones && levels.map((level, idx) => {
              if (!level.zone || !level.zone.upper || !level.zone.lower) return null;
              try {
                const upperY = height - ((level.zone.upper - priceRange.min) / priceRange.range) * height;
                const lowerY = height - ((level.zone.lower - priceRange.min) / priceRange.range) * height;
                const color = level.type === 'support' ? '#22c55e' : '#ef4444';
                
                return (
                  <rect
                    key={`zone-${idx}`}
                    x="0"
                    y={Math.min(upperY, lowerY)}
                    width="800"
                    height={Math.abs(upperY - lowerY)}
                    fill={color}
                    opacity={0.08}
                    className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                    onClick={() => handleLevelClick(level)}
                  />
                );
              } catch (e) {
                console.error('Error rendering zone:', e);
                return null;
              }
            })}
            
            {/* Линии уровней */}
            {levels.map((level, idx) => {
              if (!level || typeof level.price !== 'number' || !level.type) return null;
              try {
                const y = height - ((level.price - priceRange.min) / priceRange.range) * height;
                const color = level.type === 'support' ? '#22c55e' : '#ef4444';
                const strength = level.strength || 1;
                const isStrong = strength >= 3;
                const lineWidth = isStrong ? 3 : 2;
                
                return (
                <g key={idx}>
                  {/* Основная линия уровня */}
                  <line
                    x1="0"
                    y1={y}
                    x2="800"
                    y2={y}
                    stroke={color}
                    strokeWidth={lineWidth}
                    strokeDasharray={isStrong ? "0" : "8,4"}
                    opacity={isStrong ? 0.9 : 0.7}
                    className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                    onClick={() => handleLevelClick(level)}
                    style={{
                      filter: isStrong 
                        ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))' 
                        : 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))',
                    }}
                  />
                  
                  {/* Метка уровня с улучшенным дизайном */}
                  <g className={interactive ? 'cursor-pointer pointer-events-auto' : ''} onClick={() => handleLevelClick(level)}>
                    {/* Фон для текста */}
                    <rect
                      x="8"
                      y={y - 18}
                      width={level.isPsychological ? 200 : 180}
                      height={16}
                      fill="rgba(0, 0, 0, 0.7)"
                      rx="3"
                      opacity={0.9}
                    />
                    {/* Текст метки */}
                    <text
                      x="12"
                      y={y - 6}
                      fill={color}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {level.type === 'support' ? 'Поддержка' : 'Сопротивление'}: {formatPrice(level.price)}
                      {level.isPsychological ? ' ⭐' : ''}
                      {isStrong ? ' 🔥' : ''}
                    </text>
                    {/* Индикатор силы уровня */}
                    <g transform={`translate(750, ${y})`}>
                      {/* Внешний круг */}
                      <circle
                        r={Math.min(10, strength * 2.5)}
                        fill={color}
                        opacity={0.2}
                      />
                      {/* Внутренний круг */}
                      <circle
                        r={Math.min(7, strength * 2)}
                        fill={color}
                        opacity={0.6}
                      />
                      {/* Текст силы */}
                      {strength > 1 && (
                        <text
                          x="0"
                          y="4"
                          fill="white"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {strength}
                        </text>
                      )}
                    </g>
                  </g>
                </g>
              );
              } catch (e) {
                console.error('Error rendering level:', e, level);
                return null;
              }
            })}
            
            {/* Профессиональная визуализация отскоков */}
            {showBounces && data && levels.map((level, levelIdx) => {
              if (!level || !level.touches || !Array.isArray(level.touches)) return null;
              try {
                // Находим свечи, которые отскочили от уровня с анализом силы отскока
                const bounces = level.touches
                .map((touchIdx) => {
                  if (touchIdx >= data.length || touchIdx === 0) return null;
                  const candle = data[touchIdx];
                  const nextCandle = data[touchIdx + 1];
                  if (!nextCandle) return null;
                  
                  const distance = Math.abs(
                    (level.type === 'support' ? candle.low : candle.high) - level.price
                  );
                  
                  if (distance < 0.0003) {
                    // Определяем силу отскока
                    const bounceStrength = level.type === 'support'
                      ? (nextCandle.close - candle.low) / (candle.high - candle.low)
                      : (candle.high - nextCandle.close) / (candle.high - candle.low);
                    
                    return { 
                      candle, 
                      nextCandle,
                      idx: touchIdx, 
                      strength: bounceStrength,
                      distance 
                    };
                  }
                  return null;
                })
                .filter(Boolean)
                .sort((a, b) => (b?.strength || 0) - (a?.strength || 0)) // Сортируем по силе
                .slice(0, 6); // Показываем до 6 самых сильных отскоков
              
              return bounces.map((bounce, bounceIdx) => {
                if (!bounce) return null;
                const x = (bounce.idx / data.length) * 800;
                const y = height - ((level.price - priceRange.min) / priceRange.range) * height;
                const color = level.type === 'support' ? '#22c55e' : '#ef4444';
                const isStrongBounce = bounce.strength > 0.5;
                const radius = isStrongBounce ? 8 : 6;
                
                return (
                  <g key={`bounce-${levelIdx}-${bounceIdx}`}>
                    {/* Внешний круг отскока с анимацией */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 2}
                      fill={color}
                      opacity={0.15}
                      className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                      onClick={() => handleLevelClick(level)}
                    />
                    {/* Основной круг отскока */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={color}
                      opacity={isStrongBounce ? 0.4 : 0.3}
                      className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                      onClick={() => handleLevelClick(level)}
                    />
                    {/* Внутренний круг */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius - 2}
                      fill={color}
                      className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                      onClick={() => handleLevelClick(level)}
                      style={{
                        filter: isStrongBounce 
                          ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 1))' 
                          : 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))',
                      }}
                    />
                    {/* Стрелка направления отскока с улучшенным дизайном */}
                    <polygon
                      points={
                        level.type === 'support'
                          ? `${x},${y - 16} ${x - 6},${y - 8} ${x + 6},${y - 8}`
                          : `${x},${y + 16} ${x - 6},${y + 8} ${x + 6},${y + 8}`
                      }
                      fill={color}
                      opacity={0.9}
                      className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                      onClick={() => handleLevelClick(level)}
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))',
                      }}
                    />
                    {/* Линия от уровня к свече с градиентом */}
                    <line
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={level.type === 'support' ? y - 25 : y + 25}
                      stroke={color}
                      strokeWidth={isStrongBounce ? 2 : 1.5}
                      strokeDasharray={isStrongBounce ? "0" : "4,2"}
                      opacity={0.6}
                      className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                      onClick={() => handleLevelClick(level)}
                    />
                    {/* Индикатор силы отскока */}
                    {isStrongBounce && (
                      <text
                        x={x + 12}
                        y={level.type === 'support' ? y - 20 : y + 20}
                        fill={color}
                        fontSize="9"
                        fontWeight="bold"
                        className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                        onClick={() => handleLevelClick(level)}
                      >
                        Сильный отскок
                      </text>
                    )}
                  </g>
                );
              });
              } catch (e) {
                console.error('Error rendering bounces:', e, level);
                return null;
              }
            })}
            
            {/* Показываем точки касания уровней */}
            {levels.map((level, levelIdx) => {
              if (!level || !level.touches || !Array.isArray(level.touches)) return null;
              return level.touches.map((touchIdx, touchNum) => {
                if (touchIdx >= data.length) return null;
                const x = (touchIdx / data.length) * 800;
                const y = height - ((level.price - priceRange.min) / priceRange.range) * height;
                const color = level.type === 'support' ? '#22c55e' : '#ef4444';
                
                return (
                  <g key={`touch-${levelIdx}-${touchNum}`}>
                    {/* Маленькая точка касания */}
                    <circle
                      cx={x}
                      cy={y}
                      r={2}
                      fill={color}
                      opacity={0.6}
                      className={interactive ? 'cursor-pointer pointer-events-auto' : ''}
                      onClick={() => handleLevelClick(level)}
                    />
                  </g>
                );
              });
            })}
          </svg>
        </div>
      </div>

      {/* Модальное окно с деталями уровня */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-background border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary text-base sm:text-lg">
              {selectedLevel?.type === 'support' ? 'Уровень поддержки' : 'Уровень сопротивления'}
            </DialogTitle>
          </DialogHeader>
          {selectedLevel && (
            <div className="space-y-4 mt-4">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-3">
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Цена уровня</p>
                  <p className={cn(
                    "font-mono text-base sm:text-lg font-bold break-all",
                    selectedLevel.type === 'support' ? "text-primary" : "text-destructive"
                  )}>
                    {formatPrice(selectedLevel.price)}
                  </p>
                  {selectedLevel.isPsychological && (
                    <p className="text-[10px] sm:text-xs text-primary mt-1">⭐ Психологический уровень</p>
                  )}
                </div>
                <div className="break-words overflow-wrap-anywhere min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Сила уровня</p>
                  <p className="font-mono text-base sm:text-lg font-bold text-foreground break-all">
                    {selectedLevel.strength} {selectedLevel.strength === 1 ? 'тест' : selectedLevel.strength < 5 ? 'теста' : 'тестов'}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          i < selectedLevel.strength 
                            ? selectedLevel.type === 'support' ? "bg-primary" : "bg-destructive"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Зона уровня */}
              {selectedLevel.zone && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Зона уровня</p>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-foreground">
                      Верхняя граница: <span className="font-mono font-semibold">{formatPrice(selectedLevel.zone.upper)}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-foreground">
                      Нижняя граница: <span className="font-mono font-semibold">{formatPrice(selectedLevel.zone.lower)}</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                      💡 Цена может колебаться в пределах этой зоны перед отскоком или пробоем
                    </p>
                  </div>
                </div>
              )}
              
              {/* История касаний */}
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">Анализ уровня</p>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-foreground">
                    Уровень был протестирован <strong>{selectedLevel.strength}</strong> раз{selectedLevel.strength > 1 ? 'а' : ''}.
                  </p>
                  {selectedLevel.strength >= 3 ? (
                    <div className="bg-primary/10 border border-primary/20 rounded p-2">
                      <p className="text-xs sm:text-sm text-primary font-semibold">
                        ✓ Сильный уровень - высокая вероятность отскока
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Множественные тесты подтверждают значимость этого уровня. Вероятность отскока: 70-80%
                      </p>
                    </div>
                  ) : selectedLevel.strength === 2 ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                      <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                        ⚠ Умеренный уровень - требуется подтверждение
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Уровень тестировался дважды. Ждите дополнительных подтверждающих сигналов перед входом.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
                        ⚠ Слабый уровень - осторожность
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Уровень тестировался только один раз. Высокий риск пробоя.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Описание */}
              {selectedLevel.description && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Особенности</p>
                  <p className="text-xs sm:text-sm text-foreground">{selectedLevel.description}</p>
                </div>
              )}
              
              {/* Торговая рекомендация */}
              <div className="pt-2 border-t border-border bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 font-semibold">Торговая стратегия</p>
                {selectedLevel.type === 'support' ? (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-foreground">
                      При приближении к этому уровню ожидайте <strong className="text-primary">отскок вверх</strong>.
                    </p>
                    <div className="bg-primary/10 rounded p-2">
                      <p className="text-xs sm:text-sm font-semibold text-primary mb-1">Рекомендация: CALL опцион</p>
                      <ul className="text-[10px] sm:text-xs text-muted-foreground space-y-1 ml-3 list-disc">
                        <li>Вход: после подтверждения отскока (разворотная свеча)</li>
                        <li>Экспирация: 15-30 минут для сильных уровней</li>
                        <li>Размер ставки: стандартный (2-3%) для сильных уровней</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-foreground">
                      При приближении к этому уровню ожидайте <strong className="text-destructive">отскок вниз</strong>.
                    </p>
                    <div className="bg-destructive/10 rounded p-2">
                      <p className="text-xs sm:text-sm font-semibold text-destructive mb-1">Рекомендация: PUT опцион</p>
                      <ul className="text-[10px] sm:text-xs text-muted-foreground space-y-1 ml-3 list-disc">
                        <li>Вход: после подтверждения отскока (разворотная свеча)</li>
                        <li>Экспирация: 15-30 минут для сильных уровней</li>
                        <li>Размер ставки: стандартный (2-3%) для сильных уровней</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

