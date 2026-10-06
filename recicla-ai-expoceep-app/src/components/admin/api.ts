import { API_URL, LIMITE_USUARIOS } from "./constants";
import type {
  AdminFilters,
  AdminForm,
  RecompensaAdmin,
  RecompensaForm,
  SiteConfig,
  Stats,
  TagAdmin,
  TagResult,
  User,
  UsuarioDetalhe,
} from "./types";

/**
 * O token vem do auth-context quando existe; o fallback para o localStorage
 * cobre os fluxos que liam `supabase_token` direto antes da extracao.
 */
function authHeaders(token?: string | null): Record<string, string> {
  const jwt =
    token || (typeof window !== "undefined" ? localStorage.getItem("supabase_token") : null);
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

export interface AdminData {
  users: User[];
  total: number;
  stats: Stats | null;
}

/**
 * Carrega usuarios e metricas em paralelo. O backend ja pagina
 * (`page`/`limit`) e devolve `total`; antes o frontend descartava esses campos
 * e mostrava so a primeira pagina de 20 registros sem avisar.
 */
export async function fetchStatsAndUsers(
  filters: AdminFilters,
  pagina: number,
  token: string | null
): Promise<AdminData> {
  const params = new URLSearchParams();
  if (filters.sexo !== "todos") params.set("sexo", filters.sexo);
  if (filters.idadeMin) params.set("idade_min", filters.idadeMin);
  if (filters.idadeMax) params.set("idade_max", filters.idadeMax);
  params.set("page", String(pagina));
  params.set("limit", String(LIMITE_USUARIOS));

  const headers = authHeaders(token);
  const [usersRes, statsRes] = await Promise.all([
    fetch(`${API_URL}/api/admin/users/tags?${params}`, { headers }),
    fetch(`${API_URL}/api/admin/stats`, { headers }),
  ]);

  if (!usersRes.ok || !statsRes.ok) {
    throw new Error("Nao foi possivel carregar os dados administrativos");
  }

  const usersData = (await usersRes.json()) as {
    data?: User[];
    total?: number | null;
  };
  const statsData = (await statsRes.json()) as Stats;

  return {
    users: usersData.data ?? [],
    total: usersData.total ?? usersData.data?.length ?? 0,
    stats: statsData,
  };
}

export async function fetchAdminTags(token: string | null): Promise<TagAdmin[]> {
  const res = await fetch(`${API_URL}/api/admin/tags`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("falha");
  const data = (await res.json()) as { data?: TagAdmin[] };
  return data.data ?? [];
}

export async function fetchUsuarioDetalhe(
  usuarioId: number,
  token: string | null
): Promise<UsuarioDetalhe> {
  const res = await fetch(`${API_URL}/api/admin/users/${usuarioId}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("falha");
  return (await res.json()) as UsuarioDetalhe;
}

export async function fetchRecompensas(token?: string | null): Promise<RecompensaAdmin[]> {
  const res = await fetch(`${API_URL}/api/admin/recompensas`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { recompensas?: RecompensaAdmin[] };
  return data.recompensas ?? [];
}

export async function createRecompensa(
  form: RecompensaForm,
  custo: number,
  token?: string | null
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/recompensas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      custo_pontos: custo,
      categoria: form.categoria,
      icone: form.icone.trim() || null,
    }),
  });
  if (!res.ok) {
    const erro = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(erro?.detail ?? `HTTP ${res.status}`);
  }
}

export interface RecompensaPatch {
  titulo: string;
  descricao: string | null;
  custo_pontos: number;
  categoria: RecompensaAdmin["categoria"];
  icone: string | null;
  ativa: boolean;
}

export async function updateRecompensa(
  recompensaId: number,
  payload: RecompensaPatch,
  token?: string | null
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/recompensas/${recompensaId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/** Configuracao global do site (aba Configuracoes). */
export async function fetchSiteConfig(token?: string | null): Promise<SiteConfig> {
  const res = await fetch(`${API_URL}/api/admin/config`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as SiteConfig;
}

/** `link_votacao` vazio limpa o link e esconde o banner do dashboard. */
export async function updateSiteConfig(
  link: string,
  token?: string | null
): Promise<SiteConfig> {
  const res = await fetch(`${API_URL}/api/admin/config`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ link_votacao: link }),
  });
  if (!res.ok) {
    const erro = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(
      typeof erro?.detail === "string" ? erro.detail : `HTTP ${res.status}`
    );
  }
  return (await res.json()) as SiteConfig;
}

/** DELETE do backend e remocao do catalogo (soft delete): a linha fica para
 * preservar historico de resgates, mas sai da lista ativa. */
export async function deleteRecompensa(
  recompensaId: number,
  token?: string | null
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/recompensas/${recompensaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function validateTag(codigo: string, token?: string | null): Promise<TagResult> {
  const res = await fetch(`${API_URL}/api/admin/validate-tag`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ codigo_nfc: codigo.trim().toUpperCase() }),
  });
  return (await res.json()) as TagResult;
}

export async function createAdmin(form: AdminForm, token?: string | null): Promise<{
  nome: string;
  email: string;
}> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      nome: form.nome.trim(),
      email: form.email.trim(),
      senha: form.senha,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { detail?: string | { msg?: string }[] }
      | null;
    const detail = data?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail) && detail[0]?.msg
          ? detail[0].msg
          : "Nao foi possivel criar o administrador"
    );
  }

  return (await res.json()) as { nome: string; email: string };
}
