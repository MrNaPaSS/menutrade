import React, { useMemo } from "react";
import { Candle, type CandleData } from "./Candle";

interface PriceChartProps {
  data: CandleData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  onCandleClick?: (candle: CandleData, index: number) => void;
  highlightedIndices?: number[];
}

export function PriceChart({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 40, left: 60 },
  onCandleClick,
  highlightedIndices = [],
}: PriceChartProps) {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Вычисляем масштабы
  const { xScale, yScale, priceRange } = useMemo(() => {
    if (data.length === 0) {
      return {
        xScale: (index: number) => 0,
        yScale: (price: number) => 0,
        priceRange: { min: 0, max: 0 },
      };
    }
    
    // Ценовой диапазон
    const allPrices = data.flatMap(c => [c.high, c.low, c.open, c.close]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const pricePadding = (maxPrice - minPrice) * 0.1;
    
    // Масштаб по X (время/индекс)
    const xScale = (index: number) => {
      if (data.length === 1) return chartWidth / 2;
      return (index / (data.length - 1)) * chartWidth;
    };
    
    // Масштаб по Y (цена)
    const yScale = (price: number) => {
      const range = maxPrice - minPrice + pricePadding * 2;
      const normalized = (price - minPrice + pricePadding) / range;
      return chartHeight - normalized * chartHeight;
    };
    
    return {
      xScale,
      yScale,
      priceRange: { min: minPrice - pricePadding, max: maxPrice + pricePadding },
    };
  }, [data, chartWidth, chartHeight]);
  
  const candleWidth = Math.max(2, chartWidth / data.length * 0.8);
  
  return (
    <svg width={width} height={height} className="price-chart">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.1)" />
          <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
        </linearGradient>
      </defs>
      
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Сетка */}
        <g className="grid">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight * ratio;
            const price = priceRange.max - (priceRange.max - priceRange.min) * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                <text
                  x={-10}
                  y={y + 4}
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize={10}
                  textAnchor="end"
                >
                  {price.toFixed(2)}
                </text>
              </g>
            );
          })}
        </g>
        
        {/* Свечи */}
        <g className="candles">
          {data.map((candle, index) => (
            <Candle
              key={index}
              data={candle}
              x={xScale(index)}
              width={candleWidth}
              yScale={yScale}
              onClick={() => onCandleClick?.(candle, index)}
              highlighted={highlightedIndices.includes(index)}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}






