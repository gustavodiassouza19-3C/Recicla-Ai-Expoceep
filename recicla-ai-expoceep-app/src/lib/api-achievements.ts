const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("supabase_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Erro ${res.status}`);
  }
  return res.json();
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
  resgatada: boolean;
  pendente_resgate: boolean;
}

export interface PendingAchievement {
  usuario_conquista_id: number;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  pontos: number;
  categoria: string | null;
  concedida_em: string | null;
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
  pending: PendingAchievement[];
  pending_count: number;
}

export interface ClaimResult {
  success: boolean;
  claimed: {
    codigo: string;
    pontos: number;
    pontos_totais: number;
    resgatada_em: string;
  };
  pending: PendingAchievement[];
  pending_count: number;
}

export interface ClaimAllResult {
  success: boolean;
  claimed: Array<{
    codigo: string;
    pontos: number;
    pontos_totais: number;
    resgatada_em: string;
  }>;
  pontos_ganhos: number;
  errors?: Array<{ codigo: string; erro: string }>;
  pending: PendingAchievement[];
  pending_count: number;
}

export async function fetchAchievementsProgress(): Promise<
  AchievementProgressItem[]
> {
  const data = await authFetch<{ progress: AchievementProgressItem[] }>(
    "/api/achievements/progress"
  );
  return data.progress;
}

export async function fetchPendingAchievements(): Promise<{
  pending: PendingAchievement[];
  count: number;
}> {
  return authFetch("/api/achievements/pending");
}

export async function checkAchievements(): Promise<AchievementCheckResult> {
  return authFetch("/api/achievements/check", { method: "POST" });
}

export async function claimAchievement(codigo: string): Promise<ClaimResult> {
  return authFetch(
    `/api/achievements/${encodeURIComponent(codigo)}/claim`,
    { method: "POST" }
  );
}

export async function claimAllAchievements(): Promise<ClaimAllResult> {
  return authFetch("/api/achievements/claim-all", { method: "POST" });
}
