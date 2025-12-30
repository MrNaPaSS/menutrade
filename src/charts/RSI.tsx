import React, { useMemo } from "react";
import { IndicatorPanel, type IndicatorData } from "./IndicatorPanel";
import { type CandleData } from "./Candle";
import { getIndicatorById } from "@/data/indicators";

interface RSIProps {
  candles: CandleData[];
  period?: number;
  width?: number;
  height?: number;
  onSignalClick?: (signal: IndicatorData["signals"][0], index: number) => void;
  interactive?: boolean;
}

export function RSI({
  candles,
  period = 14,
  width = 800,
  height = 200,
  onSignalClick,
  interactive = true,
}: RSIProps) {
  const indicator = useMemo(() => {
    const config = getIndicatorById("rsi");
    if (!config) {
      return {
        type: "RSI" as const,
        values: [],
        timestamps: [],
      };
    }
    
    return config.calculate(candles, period);
  }, [candles, period]);
  
  return (
    <IndicatorPanel
      indicator={indicator}
      width={width}
      height={height}
      onSignalClick={onSignalClick}
      interactive={interactive}
    />
  );
}




