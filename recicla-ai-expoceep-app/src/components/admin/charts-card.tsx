"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COLORS } from "./constants";
import type { ChartData, Stats } from "./types";

interface ChartsCardProps {
  stats: Stats | null;
}

/** O eixo do grafico e estado local da propria aba: nao afeta nada fora dela. */
export function ChartsCard({ stats }: ChartsCardProps) {
  const [chartType, setChartType] = useState<"sexo" | "idade">("sexo");

  const sexoChartData: ChartData[] = stats
    ? [
        { name: "Masculino", value: stats.por_sexo.masculino },
        { name: "Feminino", value: stats.por_sexo.feminino },
        { name: "Outro", value: stats.por_sexo.outro },
        { name: "Nao informado", value: stats.por_sexo.nao_informado },
      ].filter((d) => d.value !== undefined && d.value > 0)
    : [];

  const idadeChartData: ChartData[] = [
    { faixa: "18-25", total: stats?.por_faixa_etaria["18-25"] || 0 },
    { faixa: "26-35", total: stats?.por_faixa_etaria["26-35"] || 0 },
    { faixa: "36-45", total: stats?.por_faixa_etaria["36-45"] || 0 },
    { faixa: "46-55", total: stats?.por_faixa_etaria["46-55"] || 0 },
    { faixa: "56+", total: stats?.por_faixa_etaria["56+"] || 0 },
  ];

  const chartData: ChartData[] = chartType === "sexo" ? sexoChartData : idadeChartData;
  const chartTypeLabel = chartType === "sexo" ? "Sexo" : "Faixa Etaria";
  const chartTypeVariant = chartType === "sexo" ? "default" : "success";

  const renderChart = () => {
    if (chartData.length === 0) {
      return <p className="text-muted-foreground text-sm">Sem dados disponiveis</p>;
    }

    if (chartType === "sexo") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
            >
              {chartData.map((_, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="faixa" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="total" fill="#4ade80" radius={[8, 8, 0, 0]} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {chartType === "sexo" ? "Distribuicao por Sexo" : "Distribuicao por Faixa Etaria"}
          </h2>
          <Badge variant={chartTypeVariant}>{chartTypeLabel}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === "sexo" ? "default" : "secondary"}
            size="sm"
            onClick={() => setChartType("sexo")}
            className={chartType === "sexo" ? "bg-success text-success-foreground" : ""}
          >
            Sexo
          </Button>
          <Button
            variant={chartType === "idade" ? "default" : "secondary"}
            size="sm"
            onClick={() => setChartType("idade")}
            className={chartType === "idade" ? "bg-success text-success-foreground" : ""}
          >
            Idade
          </Button>
        </div>
      </div>
      <div className="h-64">{renderChart()}</div>
    </Card>
  );
}
