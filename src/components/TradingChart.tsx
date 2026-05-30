import { useEffect, useRef } from 'react';
import {
  createChart, CandlestickSeries, ColorType, CrosshairMode,
  type IChartApi, type ISeriesApi, type CandlestickData, type WhitespaceData, type UTCTimestamp,
} from 'lightweight-charts';
import type { ChartPoint } from '@/data/patternGenerator';

interface TradingChartProps {
  data: ChartPoint[];
  className?: string;
}

type SeriesPoint = CandlestickData<UTCTimestamp> | WhitespaceData<UTCTimestamp>;

const UP = '#22e37a';
const DOWN = '#ff4d6d';
const GRID = 'rgba(40, 110, 70, 0.16)';
const AXIS = 'rgba(40, 110, 70, 0.30)';
const TEXT = 'rgba(150, 220, 170, 0.55)';

export function TradingChart({ data, className }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Создаём график один раз
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true, // сам подстраивается под контейнер на любых экранах/DPR
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: TEXT,
        fontFamily: "'JetBrains Mono', monospace",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: GRID },
        horzLines: { color: GRID },
      },
      rightPriceScale: { borderColor: AXIS, scaleMargins: { top: 0.12, bottom: 0.12 } },
      timeScale: { borderColor: AXIS, timeVisible: true, secondsVisible: false, fixLeftEdge: true, fixRightEdge: true },
      crosshair: { mode: CrosshairMode.Hidden },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      borderVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Обновляем данные (полная длина с whitespace фиксирует ось X -> reveal без дёргания)
  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(data as SeriesPoint[]);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
