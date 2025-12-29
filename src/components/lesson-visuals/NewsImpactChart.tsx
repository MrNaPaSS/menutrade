import React, { useMemo } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { formatPrice } from './utils';

interface NewsImpactChartProps {
  lessonId?: string;
  interactive?: boolean;
  className?: string;
  height?: number;
}

// Генерируем данные с эффектом новости
const generateNewsData = () => {
  const data = [];
  const basePrice = 1.1000;
  let currentPrice = basePrice;
  const newsTime = 15; // Минута 15 - время новости
  
  for (let i = 0; i < 30; i++) {
    let change = 0;
    
    if (i < newsTime - 5) {
      // До новости - низкая волатильность
      change = (Math.random() - 0.5) * 0.0001;
    } else if (i === newsTime) {
      // Момент новости - резкое движение
      change = 0.002; // Рост на 20 пунктов
    } else if (i > newsTime && i < newsTime + 5) {
      // После новости - продолжение движения
      change = (Math.random() * 0.5 + 0.5) * 0.0003;
    } else if (i > newsTime + 5) {
      // Стабилизация
      change = (Math.random() - 0.5) * 0.0002;
    }
    
    currentPrice += change;
    
    data.push({
      minute: i,
      price: currentPrice,
      time: `${Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}`,
      phase: i < newsTime ? 'До новости' : i === newsTime ? 'Новость' : 'После новости',
    });
  }
  
  return data;
};

const chartConfig = {
  price: {
    label: 'Цена',
    color: '#22c55e',
  },
};

export const NewsImpactChart = React.memo(function NewsImpactChart({
  lessonId,
  interactive = true,
  className,
  height = 300,
}: NewsImpactChartProps) {
  const data = useMemo(() => generateNewsData(), []);
  const newsTime = 15;
  
  return (
    <div className={cn('glass-card rounded-xl p-3 neon-border bg-[#0a0a0a]', className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="minute"
              tick={{ fill: 'rgba(34, 197, 94, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(34, 197, 94, 0.3)' }}
            />
            <YAxis
              tick={{ fill: 'rgba(34, 197, 94, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(34, 197, 94, 0.3)' }}
              domain={['dataMin - 0.001', 'dataMax + 0.001']}
            />
            <ReferenceLine
              x={newsTime}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'Новость', position: 'top', fill: '#ef4444', fontSize: 12 }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="glass-card rounded-lg p-3 neon-border bg-background border-primary/20">
                    <p className="text-sm font-semibold text-primary">{data.phase}</p>
                    <p className="text-xs text-muted-foreground">Время: {data.time}</p>
                    <p className="text-xs text-foreground">Цена: {formatPrice(data.price)}</p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#22c55e' }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Подсказки */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/30 mt-1"></div>
          <div>
            <p className="text-muted-foreground font-semibold">До новости</p>
            <p className="text-foreground/80">Низкая волатильность, консолидация</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive mt-1"></div>
          <div>
            <p className="text-muted-foreground font-semibold">Момент новости</p>
            <p className="text-foreground/80">Резкое движение, высокая волатильность</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
          <div>
            <p className="text-muted-foreground font-semibold">После новости</p>
            <p className="text-foreground/80">Продолжение движения, затем стабилизация</p>
          </div>
        </div>
      </div>
    </div>
  );
});

