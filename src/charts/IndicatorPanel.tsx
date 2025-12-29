import React from "react";

export type IndicatorType = "RSI" | "MACD" | "MovingAverage" | "Volume";

export interface IndicatorData {
  type: IndicatorType;
  values: number[];
  timestamps: number[];
  signals?: {
    index: number;
    type: "buy" | "sell" | "neutral";
    strength: number;
  }[];
  overbought?: number;
  oversold?: number;
}

interface IndicatorPanelProps {
  indicator: IndicatorData;
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  onSignalClick?: (signal: IndicatorData["signals"][0], index: number) => void;
  interactive?: boolean;
}

export function IndicatorPanel({
  indicator,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 40, left: 60 },
  onSignalClick,
  interactive = true,
}: IndicatorPanelProps) {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Масштаб значений
  const minValue = Math.min(...indicator.values);
  const maxValue = Math.max(...indicator.values);
  const valueRange = maxValue - minValue || 1;
  
  const yScale = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    return chartHeight - normalized * chartHeight;
  };
  
  const xScale = (index: number) => {
    if (indicator.values.length === 1) return chartWidth / 2;
    return (index / (indicator.values.length - 1)) * chartWidth;
  };
  
  return (
    <svg
      width={width}
      height={height}
      className="indicator-panel"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="indicatorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
        </linearGradient>
      </defs>
      
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Зоны перекупленности/перепроданности для RSI */}
        {indicator.type === "RSI" && indicator.overbought && indicator.oversold && (
          <>
            <rect
              x={0}
              y={yScale(indicator.overbought)}
              width={chartWidth}
              height={yScale(indicator.oversold) - yScale(indicator.overbought)}
              fill="rgba(239, 68, 68, 0.1)"
            />
            <line
              x1={0}
              y1={yScale(indicator.overbought)}
              x2={chartWidth}
              y2={yScale(indicator.overbought)}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.5}
            />
            <line
              x1={0}
              y1={yScale(indicator.oversold)}
              x2={chartWidth}
              y2={yScale(indicator.oversold)}
              stroke="#22c55e"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.5}
            />
          </>
        )}
        
        {/* Линия индикатора */}
        <path
          d={`M ${indicator.values.map((value, index) => `${xScale(index)},${yScale(value)}`).join(" L ")}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
        />
        
        {/* Область под линией */}
        <path
          d={`M 0,${chartHeight} L ${indicator.values.map((value, index) => `${xScale(index)},${yScale(value)}`).join(" L ")} L ${chartWidth},${chartHeight} Z`}
          fill="url(#indicatorGradient)"
        />
        
        {/* Сигналы */}
        {indicator.signals?.map((signal, index) => {
          const x = xScale(signal.index);
          const y = yScale(indicator.values[signal.index]);
          const color = signal.type === "buy" ? "#22c55e" : signal.type === "sell" ? "#ef4444" : "#6b7280";
          
          return (
            <g
              key={index}
              onClick={() => interactive && onSignalClick?.(signal, index)}
              style={{ cursor: interactive ? "pointer" : "default" }}
            >
              <circle
                cx={x}
                cy={y}
                r={6}
                fill={color}
                stroke="#fff"
                strokeWidth={2}
                opacity={0.9}
              />
              {signal.strength > 0.7 && (
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.5}
                />
              )}
            </g>
          );
        })}
        
        {/* Шкала значений */}
        <g className="scale">
          <text
            x={-10}
            y={chartHeight + 4}
            fill="rgba(255, 255, 255, 0.6)"
            fontSize={10}
            textAnchor="end"
          >
            {minValue.toFixed(2)}
          </text>
          <text
            x={-10}
            y={4}
            fill="rgba(255, 255, 255, 0.6)"
            fontSize={10}
            textAnchor="end"
          >
            {maxValue.toFixed(2)}
          </text>
        </g>
      </g>
    </svg>
  );
}

