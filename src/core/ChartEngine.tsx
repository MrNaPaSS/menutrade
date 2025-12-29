import React, { ReactNode } from "react";
import { PriceChart, type CandleData } from "@/charts/PriceChart";
import { Levels } from "@/charts/Levels";
import { IndicatorPanel } from "@/charts/IndicatorPanel";

export interface ChartOverlay {
  type: "levels" | "indicator" | "pattern" | "custom";
  component: ReactNode;
  zIndex?: number;
}

export interface ChartEngineProps {
  data: CandleData[];
  width?: number;
  height?: number;
  overlays?: ChartOverlay[];
  interactions?: {
    onCandleClick?: (candle: CandleData, index: number) => void;
    onLevelClick?: (level: number, type: "support" | "resistance") => void;
  };
  highlightedIndices?: number[];
}

export function ChartEngine({
  data,
  width = 800,
  height = 400,
  overlays = [],
  interactions,
  highlightedIndices = [],
}: ChartEngineProps) {
  // Сортируем оверлеи по zIndex
  const sortedOverlays = [...overlays].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  return (
    <div className="chart-engine relative" style={{ width, height }}>
      {/* Основной график цен */}
      <PriceChart
        data={data}
        width={width}
        height={height}
        onCandleClick={interactions?.onCandleClick}
        highlightedIndices={highlightedIndices}
      />
      
      {/* Оверлеи */}
      {sortedOverlays.map((overlay, index) => (
        <div
          key={index}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: overlay.zIndex || 10 }}
        >
          {overlay.component}
        </div>
      ))}
    </div>
  );
}


