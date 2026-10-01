"use client";

import { useCallback, useEffect, useState } from "react";

export type ChartVariant = "suave" | "reto" | "degraus";

export const CHART_VARIANTS: ReadonlyArray<{
  value: ChartVariant;
  label: string;
  hint: string;
}> = [
  { value: "suave", label: "Suave", hint: "Curva interpolada" },
  { value: "reto", label: "Reto", hint: "Segmentos retos com pontos marcados" },
  { value: "degraus", label: "Degraus", hint: "Salto em cada mes" },
];

const STORAGE_KEY = "score-chart-variant";

function isChartVariant(value: string | null): value is ChartVariant {
  return value === "suave" || value === "reto" || value === "degraus";
}

/**
 * Formato do grafico de pontos, escolhido pelo usuario e guardado no
 * navegador.
 *
 * A leitura do localStorage acontece no effect, e nao no inicializador do
 * `useState`: o dashboard e renderizado no servidor e o valor do servidor
 * depende de nao ter chave salva. Lendo antes, o HTML inicial e o do cliente
 * divergiriam e o React reclamaria de hydration mismatch (nao so, o formato
 * trocava de forma na montagem da tela).
 */
export function useChartVariant() {
  const [variant, setVariantState] = useState<ChartVariant>("suave");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isChartVariant(stored)) {
      setVariantState(stored);
    }
  }, []);

  const setVariant = useCallback((next: ChartVariant) => {
    setVariantState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { variant, setVariant };
}
