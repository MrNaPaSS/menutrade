import React from "react";

export interface CandleData {
  open: number;
  close: number;
  high: number;
  low: number;
  volume?: number;
  timestamp: number;
}

interface CandleProps {
  data: CandleData;
  x: number;
  width: number;
  yScale: (price: number) => number;
  bullishColor?: string;
  bearishColor?: string;
  shadowColor?: string;
  onClick?: () => void;
  highlighted?: boolean;
}

export function Candle({
  data,
  x,
  width,
  yScale,
  bullishColor = "#22c55e",
  bearishColor = "#ef4444",
  shadowColor,
  onClick,
  highlighted = false,
}: CandleProps) {
  const bullish = data.close >= data.open;
  const color = bullish ? bullishColor : bearishColor;
  const shadowStroke = shadowColor || color;
  
  const openY = yScale(data.open);
  const closeY = yScale(data.close);
  const highY = yScale(data.high);
  const lowY = yScale(data.low);
  
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.abs(openY - closeY) || 1; // Минимум 1px для видимости
  
  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      className={highlighted ? "candle-highlighted" : ""}
    >
      {/* Верхняя тень */}
      <line
        x1={x}
        y1={highY}
        x2={x}
        y2={bodyTop}
        stroke={shadowStroke}
        strokeWidth={1.5}
        opacity={0.8}
      />
      
      {/* Тело свечи */}
      <rect
        x={x - width / 2}
        y={bodyTop}
        width={width}
        height={bodyHeight}
        fill={color}
        stroke={highlighted ? "#3b82f6" : "none"}
        strokeWidth={highlighted ? 2 : 0}
        opacity={bullish ? 1 : 0.9}
        rx={1}
      />
      
      {/* Нижняя тень */}
      <line
        x1={x}
        y1={bodyBottom}
        x2={x}
        y2={lowY}
        stroke={shadowStroke}
        strokeWidth={1.5}
        opacity={0.8}
      />
    </g>
  );
}

