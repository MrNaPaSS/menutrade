import React from "react";
import { type CandleData } from "./Candle";
import { Candle } from "./Candle";

interface PatternRendererProps {
  candles: CandleData[];
  width?: number;
  height?: number;
}

export function PatternRenderer({ candles, width = 200, height = 120 }: PatternRendererProps) {
  if (candles.length === 0) return null;
  
  const margin = 20;
  const chartWidth = width - margin * 2;
  const chartHeight = height - margin * 2;
  
  // Масштаб
  const allPrices = candles.flatMap(c => [c.high, c.low, c.open, c.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  
  const yScale = (price: number) => {
    const normalized = (price - minPrice) / priceRange;
    return chartHeight - normalized * chartHeight;
  };
  
  const candleWidth = Math.max(8, chartWidth / candles.length * 0.6);
  const xSpacing = chartWidth / (candles.length + 1);
  
  return (
    <svg width={width} height={height} className="pattern-svg">
      <g transform={`translate(${margin}, ${margin})`}>
        {candles.map((candle, index) => {
          const x = xSpacing * (index + 1);
          return (
            <Candle
              key={index}
              data={candle}
              x={x}
              width={candleWidth}
              yScale={yScale}
            />
          );
        })}
      </g>
    </svg>
  );
}



