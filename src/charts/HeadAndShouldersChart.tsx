import React, { useState, useEffect } from "react";
import { type CandleData } from "./Candle";
import { Candle } from "./Candle";

export type PatternPointType = "left" | "head" | "right";

export interface PatternPoint {
  id: PatternPointType;
  index: number;
  price: number;
  label: string;
}

export type AnimationStep = "left" | "head" | "right" | "neckline" | "done";

export interface HeadShouldersPattern {
  type: "normal" | "inverse";
  points: PatternPoint[];
  neckline: { index: number; price: number }[];
}

interface HeadAndShouldersChartProps {
  candles: CandleData[];
  pattern?: HeadShouldersPattern;
  width?: number;
  height?: number;
  showLabels?: boolean;
  interactive?: boolean;
  animated?: boolean;
  onPointClick?: (pointId: PatternPointType) => void;
  onPatternComplete?: (selectedPoints: PatternPointType[]) => void;
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  const textWidth = Math.max(90, text.length * 7 + 20);
  return (
    <g>
      <rect
        x={x - textWidth / 2}
        y={y - 30}
        width={textWidth}
        height={22}
        rx={6}
        fill="#0d9488"
        opacity={0.9}
      />
      <text
        x={x}
        y={y - 15}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {text}
      </text>
    </g>
  );
}

function ClickPoint({
  x,
  y,
  onClick,
  active,
  correct,
}: {
  x: number;
  y: number;
  onClick: () => void;
  active: boolean;
  correct?: boolean;
}) {
  const fillColor = correct === true 
    ? "#22c55e" 
    : correct === false 
    ? "#ef4444" 
    : active 
    ? "#3b82f6" 
    : "#e5e7eb";
  
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={10}
        fill={fillColor}
        stroke="#0f172a"
        strokeWidth={2}
        onClick={onClick}
        style={{ cursor: "pointer" }}
        className="transition-all duration-200 hover:r-12"
      />
      {active && (
        <circle
          cx={x}
          cy={y}
          r={14}
          fill="none"
          stroke={fillColor}
          strokeWidth={2}
          opacity={0.5}
          className="animate-pulse"
        />
      )}
    </g>
  );
}

function detectHeadAndShoulders(candles: CandleData[], inverse: boolean = false): HeadShouldersPattern | null {
  if (candles.length < 20) return null;
  
  // Для перевёрнутой фигуры ищем минимумы, для обычной - максимумы
  const findExtremes = inverse
    ? (i: number) => {
        const current = candles[i];
        const prev1 = candles[i - 1];
        const prev2 = candles[i - 2];
        const next1 = candles[i + 1];
        const next2 = candles[i + 2];
        return (
          current.low < prev1.low &&
          current.low < prev2.low &&
          current.low < next1.low &&
          current.low < next2.low
        );
      }
    : (i: number) => {
        const current = candles[i];
        const prev1 = candles[i - 1];
        const prev2 = candles[i - 2];
        const next1 = candles[i + 1];
        const next2 = candles[i + 2];
        return (
          current.high > prev1.high &&
          current.high > prev2.high &&
          current.high > next1.high &&
          current.high > next2.high
        );
      };
  
  const getPrice = inverse
    ? (i: number) => candles[i].low
    : (i: number) => candles[i].high;
  
  // Находим экстремумы
  const extremes: Array<{ index: number; price: number }> = [];
  
  for (let i = 2; i < candles.length - 2; i++) {
    if (findExtremes(i)) {
      extremes.push({ index: i, price: getPrice(i) });
    }
  }
  
  if (extremes.length < 3) return null;
  
  // Ищем три экстремума: левое плечо, голова, правое плечо
  for (let i = 0; i < extremes.length - 2; i++) {
    const leftShoulder = extremes[i];
    const head = extremes[i + 1];
    const rightShoulder = extremes[i + 2];
    
    const headIsExtreme = inverse
      ? head.price < leftShoulder.price && head.price < rightShoulder.price
      : head.price > leftShoulder.price && head.price > rightShoulder.price;
    
    const shouldersLevel = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.05;
    
    if (headIsExtreme && shouldersLevel) {
      // Находим линию шеи (для обычной - минимумы между пиками, для перевёрнутой - максимумы)
      const findNecklineExtreme = inverse
        ? (start: number, end: number) => Math.max(...candles.slice(start, end).map(c => c.high))
        : (start: number, end: number) => Math.min(...candles.slice(start, end).map(c => c.low));
      
      const leftTrough = findNecklineExtreme(leftShoulder.index, head.index);
      const rightTrough = findNecklineExtreme(head.index, rightShoulder.index);
      
      const leftTroughIndex = candles.findIndex(
        (c, idx) => idx >= leftShoulder.index && idx < head.index && 
        (inverse ? c.high === leftTrough : c.low === leftTrough)
      );
      const rightTroughIndex = candles.findIndex(
        (c, idx) => idx >= head.index && idx < rightShoulder.index && 
        (inverse ? c.high === rightTrough : c.low === rightTrough)
      );
      
      return {
        type: inverse ? "inverse" : "normal",
        points: [
          { id: "left", index: leftShoulder.index, price: leftShoulder.price, label: "Левое плечо" },
          { id: "head", index: head.index, price: head.price, label: "Голова" },
          { id: "right", index: rightShoulder.index, price: rightShoulder.price, label: "Правое плечо" },
        ],
        neckline: [
          { index: leftTroughIndex >= 0 ? leftTroughIndex : leftShoulder.index + 3, price: leftTrough },
          { index: rightTroughIndex >= 0 ? rightTroughIndex : head.index + 3, price: rightTrough },
        ],
      };
    }
  }
  
  return null;
}

export function HeadAndShouldersChart({
  candles,
  pattern: providedPattern,
  width = 900,
  height = 360,
  showLabels = true,
  interactive = false,
  animated = false,
  onPointClick,
  onPatternComplete,
}: HeadAndShouldersChartProps) {
  // Для обучающего режима всегда показываем все элементы сразу
  const [step, setStep] = useState<AnimationStep>(animated ? "left" : "done");
  const [selected, setSelected] = useState<PatternPointType[]>([]);
  const [validation, setValidation] = useState<Record<PatternPointType, boolean | undefined>>({});
  
  // Определяем паттерн автоматически или используем предоставленный
  const pattern = providedPattern || detectHeadAndShoulders(candles, false) || detectHeadAndShoulders(candles, true);
  
  // Анимация формирования паттерна
  useEffect(() => {
    if (!animated || step === "done") return;
    
    const order: AnimationStep[] = ["left", "head", "right", "neckline", "done"];
    const currentIndex = order.indexOf(step);
    
    if (currentIndex < order.length - 1) {
      const timer = setTimeout(() => {
        setStep(order[currentIndex + 1]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, animated]);
  
  // Валидация выбранных точек
  useEffect(() => {
    if (!interactive || selected.length === 0) return;
    
    const correctOrder: PatternPointType[] = ["left", "head", "right"];
    const newValidation: Record<PatternPointType, boolean | undefined> = {};
    
    selected.forEach((pointId, index) => {
      newValidation[pointId] = pointId === correctOrder[index];
    });
    
    setValidation(newValidation);
    
    // Если все три точки выбраны в правильном порядке
    if (selected.length === 3 && selected.every((id, i) => id === correctOrder[i])) {
      onPatternComplete?.(selected);
    }
  }, [selected, interactive, onPatternComplete]);
  
  if (candles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }
  
  if (!pattern) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
        <p className="text-gray-500">Паттерн не обнаружен</p>
      </div>
    );
  }
  
  const margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Масштаб цен
  const allPrices = candles.flatMap(c => [c.high, c.low, c.open, c.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const pricePadding = priceRange * 0.1;
  
  const yScale = (price: number) => {
    const normalized = (price - minPrice + pricePadding) / (priceRange + pricePadding * 2);
    return chartHeight - normalized * chartHeight;
  };
  
  // Масштаб по X
  const candleWidth = Math.max(4, chartWidth / candles.length * 0.7);
  const xScale = (index: number) => {
    if (candles.length === 1) return chartWidth / 2;
    return (index / (candles.length - 1)) * chartWidth;
  };
  
  const handlePointClick = (pointId: PatternPointType) => {
    if (!interactive) return;
    
    setSelected((prev) => {
      if (prev.includes(pointId)) {
        return prev.filter((id) => id !== pointId);
      }
      return [...prev, pointId];
    });
    
    onPointClick?.(pointId);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <svg width={width} height={height} style={{ background: "#ffffff" }}>
        <defs>
          <linearGradient id="patternGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pattern.type === "inverse" ? "rgba(239, 68, 68, 0.1)" : "rgba(13, 148, 136, 0.1)"} />
            <stop offset="100%" stopColor={pattern.type === "inverse" ? "rgba(239, 68, 68, 0)" : "rgba(13, 148, 136, 0)"} />
          </linearGradient>
        </defs>
        
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Сетка */}
          <g className="grid" opacity={0.1}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight * ratio;
              return (
                <line
                  key={ratio}
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#000000"
                  strokeWidth={1}
                />
              );
            })}
          </g>
          
          {/* Подсветка паттерна (зона под/над паттерном) - всегда видна в обучающем режиме */}
          {(step >= "neckline" || !animated) && (
            <path
              d={`M ${xScale(pattern.points[0].index)},${yScale(pattern.points[0].price)}
                  L ${xScale(pattern.points[1].index)},${yScale(pattern.points[1].price)}
                  L ${xScale(pattern.points[2].index)},${yScale(pattern.points[2].price)}
                  L ${xScale(pattern.neckline[1].index)},${yScale(pattern.neckline[1].price)}
                  L ${xScale(pattern.neckline[0].index)},${yScale(pattern.neckline[0].price)}
                  Z`}
              fill="url(#patternGradient)"
              opacity={0.3}
            />
          )}
          
          {/* Свечи */}
          <g className="candles">
            {candles.map((candle, index) => (
              <Candle
                key={index}
                data={candle}
                x={xScale(index)}
                width={candleWidth}
                yScale={yScale}
                bullishColor="#22c55e"
                bearishColor="#ef4444"
              />
            ))}
          </g>
          
          {/* Линия шеи */}
          {step >= "neckline" && (
            <line
              x1={xScale(pattern.neckline[0].index)}
              y1={yScale(pattern.neckline[0].price)}
              x2={xScale(pattern.neckline[1].index)}
              y2={yScale(pattern.neckline[1].price)}
              stroke="#0ea5e9"
              strokeDasharray="6 4"
              strokeWidth={2}
              opacity={0.8}
            />
          )}
          
          {/* Точки паттерна + подписи */}
          {pattern.points.map((point) => {
            const visible =
              (point.id === "left" && step >= "left") ||
              (point.id === "head" && step >= "head") ||
              (point.id === "right" && step >= "right");
            
            if (!visible) return null;
            
            const x = xScale(point.index);
            const y = yScale(point.price);
            const isSelected = selected.includes(point.id);
            const isValid = validation[point.id];
            
            return (
              <g key={point.id}>
                {interactive && (
                  <ClickPoint
                    x={x}
                    y={y}
                    onClick={() => handlePointClick(point.id)}
                    active={isSelected}
                    correct={isValid}
                  />
                )}
                {showLabels && (
                  <Label x={x} y={y} text={point.label} />
                )}
              </g>
            );
          })}
          
          {/* Шкала цен слева */}
          <g className="price-scale">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight * ratio;
              const price = maxPrice + pricePadding - (maxPrice - minPrice + pricePadding * 2) * ratio;
              return (
                <text
                  key={ratio}
                  x={-10}
                  y={y + 4}
                  fill="#6b7280"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {price.toFixed(4)}
                </text>
              );
            })}
          </g>
        </g>
      </svg>
      
      {/* Статус интерактивного режима */}
      {interactive && selected.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Выбрано:</span>
            <div className="flex gap-1">
              {selected.map((id) => {
                const point = pattern.points.find((p) => p.id === id);
                const isValid = validation[id];
                return (
                  <span
                    key={id}
                    className={`px-2 py-1 rounded ${
                      isValid === true
                        ? "bg-green-100 text-green-800"
                        : isValid === false
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {point?.label}
                  </span>
                );
              })}
            </div>
            {selected.length === 3 && selected.every((id, i) => id === ["left", "head", "right"][i]) && (
              <span className="ml-auto text-green-600 font-semibold">✓ Правильно!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
