/**
 * Fatores ambientais de estimativa do Recicla Aí.
 *
 * Esses valores são premissas iniciais do protótipo e NÃO representam
 * medições diretas do impacto ambiental. A arquitetura permite substituir
 * esses fatores futuramente por valores obtidos de metodologia validada.
 *
 * Fonte: estimativa inicial do projeto.
 */

export const ENVIRONMENTAL_FACTORS = {
  /** CO₂e evitado por pessoa (kg/mês) */
  co2PerPerson: 2.83,

  /** Água economizada por pessoa (litros/mês) */
  waterPerPerson: 26.5,

  /** Árvores equivalentes por pessoa */
  treesPerPerson: 0.017,
} as const;

export interface EnvironmentalImpact {
  co2: number;
  water: number;
  trees: number;
}

/**
 * Calcula o impacto ambiental estimado com base no número de moradores.
 * @param householdSize - número de pessoas na residência (>= 1)
 * @returns objeto com os valores estimados de CO₂, água e árvores
 */
export function calculateEnvironmentalImpact(
  householdSize: number
): EnvironmentalImpact {
  const size = Math.max(1, Math.floor(householdSize));
  return {
    co2: size * ENVIRONMENTAL_FACTORS.co2PerPerson,
    water: size * ENVIRONMENTAL_FACTORS.waterPerPerson,
    trees: size * ENVIRONMENTAL_FACTORS.treesPerPerson,
  };
}
