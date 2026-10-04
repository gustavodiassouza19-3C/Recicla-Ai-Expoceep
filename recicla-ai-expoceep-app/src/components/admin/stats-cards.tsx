import { Clock, Leaf, Nfc, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "./types";

interface StatsCardsProps {
  stats: Stats | null;
  totalTags: number;
  tagsAguardando: number;
}

/**
 * Primeira fileira e o que ja existia (metricas vindas do /api/admin/stats).
 * A segunda e derivada do que ja temos em memoria -- nada de chamada nova.
 */
export function StatsCards({ stats, totalTags, tagsAguardando }: StatsCardsProps) {
  if (!stats) return null;

  const usuarios = stats.total_usuarios || 0;
  const pontosPorUsuario = usuarios ? Math.round(stats.total_pontos / usuarios) : 0;
  const tagsPorUsuario = usuarios
    ? (stats.total_tags_validadas / usuarios).toFixed(1).replace(".", ",")
    : "0";

  const primarias = [
    { label: "Tags Validadas", value: stats.total_tags_validadas, tone: "text-foreground" },
    { label: "Usuarios", value: usuarios, tone: "text-muted-foreground" },
    { label: "Total de Pontos", value: stats.total_pontos, tone: "text-success" },
    { label: "Total de Tags", value: stats.total_tags_validadas, tone: "text-foreground" },
  ];

  const derivadas = [
    {
      label: "Pontos por usuario",
      value: pontosPorUsuario,
      caption: "Media de ecopontos",
      icon: Leaf,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Tags por usuario",
      value: tagsPorUsuario,
      caption: "Media de reciclagens",
      icon: Sparkles,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Tags em circulacao",
      value: totalTags,
      caption: "No inventario",
      icon: Nfc,
      tone: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Aguardando validacao",
      value: tagsAguardando,
      caption: "Pontos a liberar",
      icon: Clock,
      tone: "bg-warning/10 text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {primarias.map((m) => (
        <Card key={m.label} className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{m.label}</p>
          <p className={`text-3xl font-bold mt-2 ${m.tone}`}>{m.value}</p>
        </Card>
      ))}

      {derivadas.map((m) => (
        <Card key={m.label} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{m.label}</p>
            <span className={`rounded-lg p-1.5 ${m.tone}`}>
              <m.icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{m.value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{m.caption}</p>
        </Card>
      ))}
    </div>
  );
}
