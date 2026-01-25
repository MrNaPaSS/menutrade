import React, { useMemo } from "react";
import { IndicatorPanel, type IndicatorData } from "./IndicatorPanel";
import { type CandleData } from "./Candle";
import { getIndicatorById } from "@/data/indicators";

interface MACDProps {
  candles: CandleData[];
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  width?: number;
  height?: number;
  onSignalClick?: (signal: IndicatorData["signals"][0], index: number) => void;
  interactive?: boolean;
}

export function MACD({
  candles,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
  width = 800,
  height = 200,
  onSignalClick,
  interactive = true,
}: MACDProps) {
  const indicator = useMemo(() => {
    const config = getIndicatorById("macd");
    if (!config) {
      return {
        type: "MACD" as const,
        values: [],
        timestamps: [],
      };
    }
    
    return config.calculate(candles, fastPeriod, slowPeriod, signalPeriod);
  }, [candles, fastPeriod, slowPeriod, signalPeriod]);
  
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






