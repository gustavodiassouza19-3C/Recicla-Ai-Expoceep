"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CHART_VARIANTS, type ChartVariant } from "@/hooks/use-chart-variant";

interface ChartVariantPickerProps {
  value: ChartVariant;
  onChange: (variant: ChartVariant) => void;
  className?: string;
}

/**
 * Seletor do formato do grafico de pontos.
 *
 * Botao por opcao em vez de um `select`: as tres formas (suave, reto,
 * degraus) so se distinguem quando se ve, entao a escolha fica visivel lado a
 * lado sem abrir menu. O grupo e o proprio `<div data-slot="button-group">` --
 * os tamanhos do `button.tsx` ja arredondam as pontas quando dentro dele.
 */
function ChartVariantPicker({
  value,
  onChange,
  className,
}: ChartVariantPickerProps) {
  return (
    <div
      data-slot="button-group"
      role="group"
      aria-label="Formato do grafico"
      className={cn(
        "flex items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border/60 bg-muted/50 p-1",
        className
      )}
    >
      {CHART_VARIANTS.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            size="xs"
            variant={active ? "secondary" : "ghost"}
            aria-pressed={active}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              // 44px no mobile para respeitar o alvo minimo de toque; no
              // desktop o controle encolhe e entra no ritmo do resto do card.
              "h-11 px-3 md:h-8 md:px-2.5",
              active && "font-semibold text-foreground"
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

export { ChartVariantPicker, ChartVariantPicker as chartVariantPicker };
