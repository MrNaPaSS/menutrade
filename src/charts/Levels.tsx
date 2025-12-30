import React from "react";
import { type CandleData } from "./Candle";

export interface Level {
  price: number;
  type: "support" | "resistance";
  strength: number; // 0-1, где 1 = максимальная сила
  touches?: number;
  valid?: boolean;
}

interface LevelsProps {
  levels: Level[];
  data: CandleData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  onLevelClick?: (level: Level) => void;
}

export function Levels({
  levels,
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 40, left: 60 },
  onLevelClick,
}: LevelsProps) {
  if (data.length === 0) return null;
  
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Вычисляем масштаб цен
  const allPrices = data.flatMap(c => [c.high, c.low, c.open, c.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricePadding = (maxPrice - minPrice) * 0.1;
  const priceRange = maxPrice - minPrice + pricePadding * 2;
  
  const yScale = (price: number) => {
    const normalized = (price - minPrice + pricePadding) / priceRange;
    return chartHeight - normalized * chartHeight;
  };
  
  return (
    <svg
      width={width}
      height={height}
      className="levels-overlay"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {levels.map((level, index) => {
          const y = yScale(level.price);
          const color = level.valid === false
            ? "#ef4444" // Красный для невалидных
            : level.type === "support"
            ? "#22c55e" // Зеленый для поддержки
            : "#f59e0b"; // Оранжевый для сопротивления
          
          const opacity = level.strength || (level.valid ? 0.6 : 0.3);
          const strokeWidth = level.strength ? 1 + level.strength * 2 : 1;
          
          return (
            <g
              key={index}
              onClick={() => onLevelClick?.(level)}
              style={{ cursor: onLevelClick ? "pointer" : "default", pointerEvents: "all" }}
            >
              {/* Линия уровня */}
              <line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeDasharray={level.valid === false ? "4,4" : "none"}
              />
              
              {/* Метка цены */}
              <text
                x={chartWidth + 5}
                y={y + 4}
                fill={color}
                fontSize={11}
                fontWeight={level.strength && level.strength > 0.7 ? "bold" : "normal"}
              >
                {level.price.toFixed(2)}
                {level.touches !== undefined && ` (${level.touches})`}
              </text>
              
              {/* Область касаний */}
              {level.touches !== undefined && level.touches > 0 && (
                <circle
                  cx={chartWidth - 20}
                  cy={y}
                  r={4}
                  fill={color}
                  opacity={opacity}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}




