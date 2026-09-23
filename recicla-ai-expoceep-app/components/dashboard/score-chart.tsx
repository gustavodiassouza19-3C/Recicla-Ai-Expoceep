"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  score: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="retro-border-item retro-shadow-sm retro-radius bg-card/95 backdrop-blur-sm px-4 py-3">
      <p className="text-[11px] font-semibold text-foreground mb-2 tracking-wide uppercase">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] text-muted-foreground">
            {entry.name}
          </span>
          <span className="text-[11px] font-bold text-foreground font-mono tabular-nums">
            {entry.value.toLocaleString()} pts
          </span>
        </div>
      ))}
    </div>
  );
}

export interface ScoreChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: DataPoint[];
  loading?: boolean;
}

const ScoreChart = React.forwardRef<HTMLDivElement, ScoreChartProps>(
  ({ className, data, loading = false, ...props }, ref) => {
    const chartData = data ?? [];

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn("h-[280px] w-full flex items-center justify-center", className)}
          {...props}
        >
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando pontuacao...
          </p>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div
          ref={ref}
          className={cn("h-[280px] w-full flex items-center justify-center", className)}
          {...props}
        >
          <p className="text-sm text-muted-foreground">
            Nenhuma reciclagem registrada ainda
          </p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("h-[280px] w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--success)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--success)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 6"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="natural"
              dataKey="score"
              name="Pontuacao"
              stroke="var(--success)"
              fill="url(#fillScore)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "var(--success)",
                fill: "var(--card)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

ScoreChart.displayName = "ScoreChart";

export { ScoreChart, ScoreChart as scoreChart };
