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

const UP = '#26de81';
const DOWN = '#fc5c65';

export function TradingChart({ data, className }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Создаём график один раз + явная синхронизация размера через ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth || 320,
      height: el.clientHeight || 320,
      layout: {
        background: { type: ColorType.Solid, color: '#0b140f' },
        textColor: 'rgba(150, 220, 170, 0.6)',
        fontFamily: "'JetBrains Mono', monospace",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(45, 120, 80, 0.12)' },
        horzLines: { color: 'rgba(45, 120, 80, 0.12)' },
      },
      rightPriceScale: { borderColor: 'rgba(45, 120, 80, 0.25)', scaleMargins: { top: 0.15, bottom: 0.15 } },
      timeScale: { borderColor: 'rgba(45, 120, 80, 0.25)', timeVisible: true, secondsVisible: false },
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

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr && cr.width > 0 && cr.height > 0) {
        chart.resize(cr.width, cr.height);
        chart.timeScale().fitContent();
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Данные: реальные свечи + whitespace (фиксирует ось X -> reveal без дёргания)
  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(data as SeriesPoint[]);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
