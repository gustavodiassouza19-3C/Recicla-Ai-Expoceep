"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DataPoint {
  month: string;
  score: number;
}

// --chart-1 e cinza puro e nao passa de contraste sobre o card. O grafico
// continua na mesma familia do resto do app: verde de sucesso via token CSS.
const chartConfig = {
  score: {
    label: "Pontos",
    color: "var(--success)",
  },
} satisfies ChartConfig;

// O eixo tem que acompanhar a maior pontuacao do usuario. Um teto fixo achata a
// barra de quem tem muito ponto e corta o topo de quem tem pouco. Aqui o
// dominio sobe so com o maximo real dos dados, com folga de 10% e passo
// "redondo", para a barra usar a altura toda e as marcas sairem legiveis.
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

// Rotulos "60000"/"850000" nao cabiam na calha fixa do eixo e o recharts
// cortava o comeco do texto (virava "00000"). Em mil/mi o rotulo fica curto
// mesmo nos casos de pontuacao altissima, e a precisao total continua no
// tooltip. Abaixo de 1000 mantem o numero puro (serie normal: 0, 150, 300...).
// O espaco entre numero e unidade e non-breaking: o wrapper de texto do
// recharts mede o rotulo antes da webfont carregar e, quando a medicao
// estoura, quebra no espaco (virava "500" / "mil" em duas linhas). Sem
// espaco cortavel o rotulo sempre sai em uma linha so.
function formatAxisTick(value: number): string {
  const NBSP = "\u00A0";
  if (value >= 1_000_000) {
    const valueInMillions = value / 1_000_000;
    const formatted = Number.isInteger(valueInMillions)
      ? String(valueInMillions)
      : valueInMillions.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    return `${formatted}${NBSP}mi`;
  }
  if (value >= 1_000) {
    const valueInThousands = value / 1_000;
    const formatted = Number.isInteger(valueInThousands)
      ? String(valueInThousands)
      : valueInThousands.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    return `${formatted}${NBSP}mil`;
  }
  return String(value);
}

export interface ScoreChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: DataPoint[];
}

const ScoreChart = React.forwardRef<HTMLDivElement, ScoreChartProps>(
  ({ className, data = [], ...props }, ref) => {
    const domainMax = resolveDomainMax(data);

    return (
      <div
        ref={ref}
        className={cn("h-[180px] md:h-[280px] w-full", className)}
        {...props}
      >
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 4, right: 4, left: -4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => String(value).slice(0, 3)}
              minTickGap={4}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              domain={[0, domainMax]}
              allowDecimals={false}
              tickFormatter={formatAxisTick}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={56}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="score"
              name="Pontos"
              fill="var(--color-score)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </div>
    );
  }
);

ScoreChart.displayName = "ScoreChart";

export { ScoreChart, ScoreChart as scoreChart };
