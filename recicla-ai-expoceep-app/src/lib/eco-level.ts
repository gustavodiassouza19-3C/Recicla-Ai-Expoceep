export interface EcoLevel {
  title: string;
  level: number;
  icon: string;
  nextThreshold: number | null;
  minPoints: number;
}

const ECO_LEVELS: EcoLevel[] = [
  { title: "Mestre da Reciclagem", level: 4, icon: "🌍", nextThreshold: null, minPoints: 1000 },
  { title: "Guardião Verde", level: 3, icon: "🌳", nextThreshold: 1000, minPoints: 500 },
  { title: "Eco Consciente", level: 2, icon: "🌿", nextThreshold: 500, minPoints: 100 },
  { title: "Reciclador Iniciante", level: 1, icon: "🌱", nextThreshold: 100, minPoints: 0 },
];

export function getEcoLevel(points: number): EcoLevel {
  return ECO_LEVELS.find((nivel) => points >= nivel.minPoints) ?? ECO_LEVELS[ECO_LEVELS.length - 1];
}

export function getEcoProgress(points: number): {
  ecoLevel: EcoLevel;
  progressPercent: number;
  pointsToNext: number;
} {
  const ecoLevel = getEcoLevel(points);

  const progressPercent = ecoLevel.nextThreshold
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((points - ecoLevel.minPoints) / (ecoLevel.nextThreshold - ecoLevel.minPoints)) * 100
          )
        )
      )
    : 100;

  const pointsToNext = ecoLevel.nextThreshold
    ? Math.max(0, ecoLevel.nextThreshold - points)
    : 0;

  return { ecoLevel, progressPercent, pointsToNext };
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getTipoLabel(tipo?: string): string {
  return tipo === "admin" || tipo === "administrador" ? "Administrador" : "Cidadão";
}
