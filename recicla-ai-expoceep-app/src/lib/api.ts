// Mesmo fallback do auth-context e da pagina de rewards: se a env nao estiver
// definida, todos os pontos do app apontam pro mesmo lugar.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("supabase_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Toda pagina autenticada pede /api/users/me duas vezes: o auth-context para
 * montar o usuario e o points-context para o saldo. Guardamos GET por 2s e
 * compartilhamos a promessa em voo, entao a segunda chamada nao vai a rede.
 *
 * Qualquer POST/PUT/DELETE limpa o cache (o estado mudou), e um refetch
 * explicito depois de um resgate ja cai no caminho invalidado.
 */
const GET_CACHE_TTL_MS = 2000;
const getCache = new Map<string, { exp: number; value: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

export function invalidateApiCache(): void {
  getCache.clear();
}

function readCache(path: string): { value: unknown } | null {
  const hit = getCache.get(path);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    getCache.delete(path);
    return null;
  }
  return { value: hit.value };
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  const isGet = method === "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options?.headers as Record<string, string> | undefined),
  };
  // A chave inclui o token: sem isso, quem troca de conta em menos de 2s li o
  // /me do usuario anterior guardado.
  const key = `${path}::${headers.Authorization ?? ""}`;

  if (isGet) {
    const cached = readCache(key);
    if (cached) return cached.value as T;
    const pending = inflight.get(key);
    if (pending) return pending as Promise<T>;
  }

  const request = (async () => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Erro ${res.status}`);
    }
    return res.json();
  })();

  if (isGet) {
    inflight.set(key, request);
    request
      .then((value) => getCache.set(key, { exp: Date.now() + GET_CACHE_TTL_MS, value }))
      .catch(() => undefined)
      .finally(() => {
        if (inflight.get(key) === request) inflight.delete(key);
      });
  } else {
    // Endpoint mudou de estado: o que estava guardado nao vale mais.
    invalidateApiCache();
  }

  return request as Promise<T>;
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
  // O PostgREST devolve o embed como lista, mesmo quando há um só.
  tags?: Array<{ codigo_nfc: string; status: string }>;
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
  return apiFetch<ScoreDataPoint[]>("/api/recycle/score-history");
}

/** Configuracao publica do site. `link_votacao` vazio = banner escondido. */
export interface SiteConfig {
  link_votacao: string;
}

export function fetchSiteConfig(): Promise<SiteConfig> {
  return apiFetch<SiteConfig>("/api/config");
}

export interface MeProfile {
  id: number;
  nome: string;
  email: string;
  pontos: number;
}

export function fetchMe(): Promise<MeProfile> {
  return apiFetch("/api/users/me");
}

export function fetchHistory(): Promise<HistoryEntry[]> {
  return apiFetch<HistoryEntry[]>("/api/recycle/history");
}

export interface TagInput {
  codigo_nfc: string;
}

export function fetchMyTags(): Promise<UserTag[]> {
  return apiFetch<UserTag[]>("/api/tags/me");
}

export interface TagCatalogItem {
  id: number;
  codigo_nfc: string;
  status: string;
}

/**
 * Inventario completo das tags (codigo + status), lido na pagina Sobre.
 * Exige login: o backend devolve a lista inteira pela service key, algo que a
 * RLS nao faria via Supabase direto.
 */
export function fetchTagCatalog(): Promise<TagCatalogItem[]> {
  return apiFetch<TagCatalogItem[]>("/api/tags");
}

export function addTag(data: TagInput): Promise<{ id: number; codigo_nfc: string; status: string }> {
  return apiFetch("/api/tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchImpact(): Promise<ImpactData> {
  return apiFetch<ImpactData>("/api/recycle/impact");
}

export interface RecyclingRegistration {
  success: boolean;
  pontos_ganhos: number;
  novo_total: number;
  message: string;
}

export function registerRecycling(tagCode: string): Promise<RecyclingRegistration> {
  return apiFetch<RecyclingRegistration>("/api/recycle", {
    method: "POST",
    body: JSON.stringify({ tag_code: tagCode }),
  });
}

export function fetchEcoPoints(): Promise<EcoPoint[]> {
  return apiFetch("/api/eco-points");
}
