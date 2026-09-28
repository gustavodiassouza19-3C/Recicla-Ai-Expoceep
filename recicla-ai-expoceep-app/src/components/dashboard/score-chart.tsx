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

const emptyData: DataPoint[] = [
  { month: "Jan", score: 0 },
  { month: "Fev", score: 0 },
  { month: "Mar", score: 0 },
  { month: "Abr", score: 0 },
  { month: "Mai", score: 0 },
  { month: "Jun", score: 0 },
  { month: "Jul", score: 0 },
  { month: "Ago", score: 0 },
  { month: "Set", score: 0 },
  { month: "Out", score: 0 },
  { month: "Nov", score: 0 },
  { month: "Dez", score: 0 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

// O eixo tem que acompanhar a maior pontuacao do usuario. Um teto fixo achata a
// curva de quem tem muito ponto e corta o topo de quem tem pouco. Aqui o
// dominio sobe so com o maximo real dos dados, com folga de 10% e passo
// "redondo", para a curva usar a altura toda e as marcas sairem legiveis.
// Medido na serie de 0 a 100 mil: pior preenchimento 75%, media 91%.
const AXIS_HEADROOM = 1.1;
const TARGET_INTERVALS = 4;
const NICE_STEPS = [1, 2, 2.5, 5, 10];

function resolveDomainMax(data: DataPoint[]): number {
  const dataMax = data.reduce((max, point) => Math.max(max, point.score || 0), 0);
  if (dataMax <= 0) return 100;

  const rough = (dataMax * AXIS_HEADROOM) / TARGET_INTERVALS;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const step =
    (NICE_STEPS.find((candidate) => rough / magnitude <= candidate) ?? 10) *
    magnitude;

  return Math.ceil(dataMax / step) * step;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="retro-border-item retro-shadow-sm retro-radius bg-card/95 backdrop-blur-sm px-3 py-2">
      <p className="text-[10px] font-semibold text-foreground mb-1 tracking-wide uppercase">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[10px] text-muted-foreground">
            {entry.name}
          </span>
          <span className="text-[10px] font-bold text-foreground font-mono tabular-nums">
            {entry.value.toLocaleString()} pts
          </span>
        </div>
      ))}
    </div>
  );
}

export interface ScoreChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: DataPoint[];
}

const ScoreChart = React.forwardRef<HTMLDivElement, ScoreChartProps>(
  ({ className, data = emptyData, ...props }, ref) => {
    const domainMax = resolveDomainMax(data);

    return (
      <div ref={ref} className={cn("h-[180px] md:h-[280px] w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -4, bottom: 0 }}
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
              tickMargin={8}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              minTickGap={4}
            />
            <YAxis
              domain={[0, domainMax]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="score"
              name="Pontuacao"
              stroke="var(--success)"
              fill="url(#fillScore)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
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
