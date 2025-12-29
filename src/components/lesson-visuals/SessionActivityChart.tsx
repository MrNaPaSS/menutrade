import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface SessionActivityChartProps {
  lessonId?: string;
  interactive?: boolean;
  className?: string;
  height?: number;
}

const sessionData = [
  { time: '00:00', activity: 20, session: 'Азия' },
  { time: '03:00', activity: 25, session: 'Азия' },
  { time: '06:00', activity: 30, session: 'Азия' },
  { time: '09:00', activity: 85, session: 'Европа' },
  { time: '12:00', activity: 90, session: 'Европа' },
  { time: '15:00', activity: 95, session: 'Пересечение' },
  { time: '18:00', activity: 100, session: 'Америка' },
  { time: '21:00', activity: 80, session: 'Америка' },
  { time: '24:00', activity: 30, session: 'Азия' },
];

const chartConfig = {
  activity: {
    label: 'Активность',
    color: '#22c55e',
  },
};

export const SessionActivityChart = React.memo(function SessionActivityChart({
  lessonId,
  interactive = true,
  className,
  height = 300,
}: SessionActivityChartProps) {
  return (
    <div className={cn('glass-card rounded-xl p-3 neon-border bg-[#0a0a0a]', className)}>
      <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sessionData}>
            <XAxis
              dataKey="time"
              tick={{ fill: 'rgba(34, 197, 94, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(34, 197, 94, 0.3)' }}
            />
            <YAxis
              tick={{ fill: 'rgba(34, 197, 94, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(34, 197, 94, 0.3)' }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="glass-card rounded-lg p-3 neon-border bg-background border-primary/20">
                    <p className="text-sm font-semibold text-primary">{data.time}</p>
                    <p className="text-xs text-muted-foreground">Активность: {data.activity}%</p>
                    <p className="text-xs text-foreground">Сессия: {data.session}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="activity"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.5))',
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Легенда сессий */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/30 border border-primary"></div>
          <span className="text-muted-foreground">Азиатская сессия (00:00-09:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/60 border border-primary"></div>
          <span className="text-muted-foreground">Европейская сессия (09:00-18:00)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary border border-primary"></div>
          <span className="text-muted-foreground">Американская сессия (15:00-24:00)</span>
        </div>
      </div>
    </div>
  );
});

