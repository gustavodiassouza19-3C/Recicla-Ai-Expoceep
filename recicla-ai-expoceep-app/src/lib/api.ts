const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("supabase_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Erro ${res.status}`);
  }
  return res.json();
}

export interface ScoreDataPoint {
  month: string;
  score: number;
}

export interface HistoryEntry {
  id: number;
  tag_id: number;
  data_entrega: string;
  status: string;
  tags?: { codigo_nfc: string; status: string };
}

export interface UserTag {
  id: number;
  codigo_nfc: string;
  status: string;
  last_used: string;
}

export interface ImpactData {
  validated_count: number;
  trees: number;
  water_liters: number;
}

export interface MissionItem {
  id: number;
  titulo: string;
  descricao: string;
  meta: number;
  recompensa_pontos: number;
}

export interface UserMissionItem {
  mission: MissionItem;
  progress: number;
  completed: boolean;
}

export interface EcoPoint {
  id: number;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
  status: string;
}

export interface EcoPointNearby extends EcoPoint {
  distance_km: number;
}

export function fetchScoreHistory(): Promise<ScoreDataPoint[]> {
  return apiFetch("/api/recycle/score-history");
}

export function fetchHistory(): Promise<HistoryEntry[]> {
  return apiFetch("/api/recycle/history");
}

export interface TagInput {
  codigo_nfc: string;
}

export function fetchMyTags(): Promise<UserTag[]> {
  return apiFetch("/api/tags/me");
}

export function addTag(data: TagInput): Promise<{ id: number; codigo_nfc: string; status: string }> {
  return apiFetch("/api/tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchImpact(): Promise<ImpactData> {
  return apiFetch("/api/recycle/impact");
}

export function fetchMyMissions(): Promise<UserMissionItem[]> {
  return apiFetch("/api/missions/me");
}

export function fetchEcoPoints(): Promise<EcoPoint[]> {
  return apiFetch("/api/eco-points");
}
