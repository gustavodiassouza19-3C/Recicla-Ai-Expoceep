const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("supabase_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AchievementProgressItem {
  conquista_codigo: string;
  conquista_nome: string;
  conquista_descricao: string;
  conquista_icone: string;
  conquista_pontos: number;
  conquista_categoria: string;
  condicao_tipo: string;
  condicao_valor: number;
  progresso_atual: number;
  desbloqueada: boolean;
  data_concessao: string | null;
}

export interface AchievementCheckResult {
  novas_conquistas: Array<{
    codigo: string;
    nome: string;
    descricao: string;
    icone: string;
    pontos: number;
  }>;
  pontos_ganhos_total: number;
}

export async function fetchAchievementsProgress(): Promise<AchievementProgressItem[]> {
  const res = await fetch(`${API_URL}/api/achievements/progress`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar conquistas");
  const data = await res.json();
  return data.progress;
}

export async function checkAchievements(): Promise<AchievementCheckResult> {
  const res = await fetch(`${API_URL}/api/achievements/check`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao verificar conquistas");
  return res.json();
}
