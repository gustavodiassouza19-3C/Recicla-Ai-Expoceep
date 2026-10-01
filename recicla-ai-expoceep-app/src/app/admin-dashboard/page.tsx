"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Fingerprint,
  Home,
  Leaf,
  LayoutDashboard,
  Loader2,
  Mail,
  Nfc,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Trees,
  Gift,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  formatDate,
  getEcoProgress,
  getInitials,
  getTipoLabel,
} from "@/lib/eco-level";
import { isAdminTipo } from "@/lib/roles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TagAdmin {
  id: number;
  codigo_nfc: string;
  status: string;
  situacao: "aguardando" | "validada" | "nunca_usada";
  total_usos: number;
  pessoas: number;
  validacoes: number;
  pendentes: number;
  pode_validar: boolean;
  ultima_utilizacao: string | null;
  ultimo_usuario: string | null;
  ultima_validacao: string | null;
}

const SITUACAO: Record<
  TagAdmin["situacao"],
  { label: string; variant: "default" | "success" | "warning" | "destructive" }
> = {
  aguardando: { label: "Aguardando", variant: "warning" },
  validada: { label: "Validada", variant: "success" },
  nunca_usada: { label: "Livre", variant: "default" },
};

interface User {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  sexo?: string;
  idade?: number;
  tipo?: string;
  criado_em?: string;
  pontos: number;
  tags_validadas?: number;
}

interface UsuarioDetalhe {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  sexo: string | null;
  idade: number | null;
  tipo: string;
  criado_em: string | null;
  pontos: number;
  household_size: number;
  entregas: number;
  arvores: number;
  tags_count: number;
  total_usos: number;
  tags: {
    id: number;
    codigo_nfc: string;
    status: string;
    reciclagem_status: string;
    data_entrega: string | null;
    data_confirmacao: string | null;
  }[];
  conquistas: {
    id: number;
    conquista_codigo: string;
    pontos_ganhos: number;
    resgatada_em: string | null;
  }[];
}

interface RecompensaAdmin {
  id: number;
  titulo: string;
  descricao: string | null;
  custo_pontos: number;
  categoria: "desconto" | "parceiro" | "doacao";
  icone: string | null;
  ativa: boolean;
  criado_em?: string;
}

const CATEGORIAS_RECOMPENSA: { value: RecompensaAdmin["categoria"]; label: string }[] = [
  { value: "parceiro", label: "Parceiro" },
  { value: "desconto", label: "Desconto" },
  { value: "doacao", label: "Doacao" },
];

type AbaAdmin = "visao" | "usuarios" | "recompensas";

interface Stats {
  total_usuarios: number;
  total_tags_validadas: number;
  total_pontos: number;
  por_sexo: { masculino: number; feminino: number; outro: number; nao_informado: number };
  por_faixa_etaria: { "18-25": number; "26-35": number; "36-45": number; "46-55": number; "56+": number };
}

const COLORS = ["#4ade80", "#f472b6", "#facc15", "#94a3b8"];
const SEXO_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  nao_informado: "Nao informado",
};

interface ChartData {
  name?: string;
  value?: number;
  faixa?: string;
  total?: number;
}

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroSexo, setFiltroSexo] = useState("todos");
  const [filtroIdadeMin, setFiltroIdadeMin] = useState("");
  const [filtroIdadeMax, setFiltroIdadeMax] = useState("");
  const [chartType, setChartType] = useState<"sexo" | "idade">("sexo");
  const [tags, setTags] = useState<TagAdmin[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [filtroTag, setFiltroTag] = useState<"todas" | "aguardando" | "validada">("todas");
  const [aba, setAba] = useState<AbaAdmin>("visao");
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [usuarioDetalheId, setUsuarioDetalheId] = useState<number | null>(null);
  const [usuarioDetalhe, setUsuarioDetalhe] = useState<UsuarioDetalhe | null>(null);
  const [detalheLoading, setDetalheLoading] = useState(false);
  const [criandoAdmin, setCriandoAdmin] = useState(false);
  const [formAdminAberto, setFormAdminAberto] = useState(false);
  const [adminForm, setAdminForm] = useState({ nome: "", email: "", senha: "" });
  const [adminErro, setAdminErro] = useState("");
  const [adminCriado, setAdminCriado] = useState<{ nome: string; email: string } | null>(null);
  const [buscaTag, setBuscaTag] = useState("");
  const [tagSelecionadaId, setTagSelecionadaId] = useState<number | null>(null);
  const [validating, setValidating] = useState(false);
  const [tagResult, setTagResult] = useState<{
    valid: boolean;
    message?: string;
    tag?: { codigo_nfc?: string; status?: string };
    reciclagens_validadas?: number;
  } | null>(null);

  const [recompensas, setRecompensas] = useState<RecompensaAdmin[]>([]);
  const [carregandoRecompensas, setCarregandoRecompensas] = useState(false);
  const [salvandoRecompensa, setSalvandoRecompensa] = useState(false);
  const [erroRecompensa, setErroRecompensa] = useState("");
  const [formRecompensa, setFormRecompensa] = useState({
    titulo: "",
    descricao: "",
    custo_pontos: "",
    categoria: "parceiro",
    icone: "",
  });

  const carregarRecompensas = useCallback(async () => {
    setCarregandoRecompensas(true);
    try {
      const token = localStorage.getItem("supabase_token");
      const res = await fetch(`${API_URL}/api/admin/recompensas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { recompensas?: RecompensaAdmin[] };
      setRecompensas(data.recompensas ?? []);
    } catch {
      setRecompensas([]);
    } finally {
      setCarregandoRecompensas(false);
    }
  }, []);

  useEffect(() => {
    if (aba !== "recompensas") return;
    let cancelled = false;

    (async () => {
      setCarregandoRecompensas(true);
      try {
        const token = localStorage.getItem("supabase_token");
        const res = await fetch(`${API_URL}/api/admin/recompensas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        if (cancelled) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { recompensas?: RecompensaAdmin[] };
        if (cancelled) return;
        setRecompensas(data.recompensas ?? []);
      } catch {
        if (!cancelled) setRecompensas([]);
      } finally {
        if (!cancelled) setCarregandoRecompensas(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [aba]);

  const handleCriarRecompensa = async (event: React.FormEvent) => {
    event.preventDefault();
    setErroRecompensa("");

    const custo = Number.parseInt(formRecompensa.custo_pontos, 10);
    if (formRecompensa.titulo.trim().length < 2) {
      setErroRecompensa("Informe um titulo com pelo menos 2 caracteres.");
      return;
    }
    if (!Number.isFinite(custo) || custo <= 0) {
      setErroRecompensa("Informe um custo em pontos maior que zero.");
      return;
    }

    setSalvandoRecompensa(true);
    try {
      const token = localStorage.getItem("supabase_token");
      const res = await fetch(`${API_URL}/api/admin/recompensas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          titulo: formRecompensa.titulo.trim(),
          descricao: formRecompensa.descricao.trim(),
          custo_pontos: custo,
          categoria: formRecompensa.categoria,
          icone: formRecompensa.icone.trim() || null,
        }),
      });

      if (!res.ok) {
        const erro = (await res.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(erro?.detail ?? `HTTP ${res.status}`);
      }

      setFormRecompensa({
        titulo: "",
        descricao: "",
        custo_pontos: "",
        categoria: "parceiro",
        icone: "",
      });
      await carregarRecompensas();
    } catch (err) {
      setErroRecompensa(err instanceof Error ? err.message : "Erro ao criar recompensa");
    } finally {
      setSalvandoRecompensa(false);
    }
  };

  const handleAlternarRecompensa = async (recompensa: RecompensaAdmin) => {
    setErroRecompensa("");
    try {
      const token = localStorage.getItem("supabase_token");
      const res = await fetch(`${API_URL}/api/admin/recompensas/${recompensa.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          titulo: recompensa.titulo,
          descricao: recompensa.descricao ?? "",
          custo_pontos: recompensa.custo_pontos,
          categoria: recompensa.categoria,
          icone: recompensa.icone,
          ativa: !recompensa.ativa,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await carregarRecompensas();
    } catch (err) {
      setErroRecompensa(err instanceof Error ? err.message : "Erro ao atualizar recompensa");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtroSexo !== "todos") params.set("sexo", filtroSexo);
      if (filtroIdadeMin) params.set("idade_min", filtroIdadeMin);
      if (filtroIdadeMax) params.set("idade_max", filtroIdadeMax);

      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/users/tags?${params}`, { headers }),
        fetch(`${API_URL}/api/admin/stats`, { headers }),
      ]);
      if (!usersRes.ok || !statsRes.ok) {
        throw new Error("Nao foi possivel carregar os dados administrativos");
      }
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      setUsers(usersData.data || []);
      setStats(statsData);
    } catch {
      setUsers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filtroSexo, filtroIdadeMin, filtroIdadeMax, token]);

  const fetchTags = useCallback(async () => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/admin/tags`, { headers, cache: "no-store" });
      if (!res.ok) throw new Error("falha");
      const data = await res.json();
      setTags(data.data || []);
    } catch {
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => {
      void fetchData();
      void fetchTags();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData, fetchTags, token]);

  const fetchUsuarioDetalhe = useCallback(
    async (usuarioId: number) => {
      setDetalheLoading(true);
      try {
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/api/admin/users/${usuarioId}`, {
          headers,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("falha");
        setUsuarioDetalhe(await res.json());
      } catch {
        setUsuarioDetalhe(null);
      } finally {
        setDetalheLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (usuarioDetalheId === null || !token) return;
    const timer = window.setTimeout(() => {
      void fetchUsuarioDetalhe(usuarioDetalheId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [usuarioDetalheId, fetchUsuarioDetalhe, token]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdminTipo(user.tipo))) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || !isAdminTipo(user.tipo)) {
    return null;
  }

  const sexoChartData: ChartData[] = stats
    ? [
        { name: "Masculino", value: stats.por_sexo.masculino },
        { name: "Feminino", value: stats.por_sexo.feminino },
        { name: "Outro", value: stats.por_sexo.outro },
        { name: "Nao informado", value: stats.por_sexo.nao_informado },
      ].filter((d) => d.value !== undefined && d.value > 0)
    : [];

  const idadeChartData: ChartData[] = [
    { faixa: "18-25", total: stats?.por_faixa_etaria["18-25"] || 0 },
    { faixa: "26-35", total: stats?.por_faixa_etaria["26-35"] || 0 },
    { faixa: "36-45", total: stats?.por_faixa_etaria["36-45"] || 0 },
    { faixa: "46-55", total: stats?.por_faixa_etaria["46-55"] || 0 },
    { faixa: "56+", total: stats?.por_faixa_etaria["56+"] || 0 },
  ];

  const chartData: ChartData[] = chartType === "sexo" ? sexoChartData : idadeChartData;
  const chartTypeLabel = chartType === "sexo" ? "Sexo" : "Faixa Etaria";
  const chartTypeVariant = chartType === "sexo" ? "default" : "success";
  const isPieChart = chartType === "sexo";

  const ecoProgress = getEcoProgress(usuarioDetalhe?.pontos ?? 0);

  const metricLabel = "Tags Validadas";
  const metricValue = stats?.total_tags_validadas || 0;
  const metricSecondary = stats?.total_usuarios || 0;
  const metricSecondaryLabel = "Usuarios";

  const renderChart = () => {
    if (chartData.length === 0) {
      return <p className="text-muted-foreground text-sm">Sem dados disponiveis</p>;
    }

    if (isPieChart) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
            >
              {chartData.map((_, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="faixa" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="total" fill="#4ade80" radius={[8, 8, 0, 0]} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const handleClearFilters = () => {
    setFiltroSexo("todos");
    setFiltroIdadeMin("");
    setFiltroIdadeMax("");
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleValidateTag = async (codigo: string) => {
    if (!codigo.trim()) return;
    setValidating(true);
    setTagResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/validate-tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ codigo_nfc: codigo.trim().toUpperCase() }),
      });
      const data = await res.json();
      setTagResult(data);
      if (data.valid) {
        void fetchData();
        void fetchTags();
      }
    } catch {
      setTagResult({ valid: false, message: "Erro ao validar tag" });
    } finally {
      setValidating(false);
    }
  };

  const handleCriarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErro("");
    setAdminCriado(null);

    if (adminForm.nome.trim().length < 3) {
      setAdminErro("Informe o nome completo do administrador.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(adminForm.email.trim())) {
      setAdminErro("Informe um e-mail valido.");
      return;
    }
    if (adminForm.senha.length < 8) {
      setAdminErro("A senha precisa ter ao menos 8 caracteres.");
      return;
    }

    setCriandoAdmin(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome: adminForm.nome.trim(),
          email: adminForm.email.trim(),
          senha: adminForm.senha,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const detail = data?.detail;
        setAdminErro(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail) && detail[0]?.msg
            ? detail[0].msg
            : "Nao foi possivel criar o administrador"
        );
        return;
      }

      const criado = await res.json();
      setAdminCriado({ nome: criado.nome, email: criado.email });
      setAdminForm({ nome: "", email: "", senha: "" });
      void fetchData();
    } catch {
      setAdminErro("Erro de conexao com o servidor");
    } finally {
      setCriandoAdmin(false);
    }
  };

  const tagsFiltradas = tags.filter((t) => {
    if (filtroTag === "aguardando" && t.situacao !== "aguardando") return false;
    if (filtroTag === "validada" && t.situacao === "aguardando") return false;
    if (buscaTag.trim() && !t.codigo_nfc.toLowerCase().includes(buscaTag.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  const tagSelecionada = tags.find((t) => t.id === tagSelecionadaId) ?? null;

  const totalAguardando = tags.filter((t) => t.situacao === "aguardando").length;

  const usuariosFiltrados = users.filter((u) => {
    if (filtroSexo !== "todos" && (u.sexo || "nao_informado") !== filtroSexo) return false;
    if (filtroIdadeMin && (u.idade ?? 0) < Number(filtroIdadeMin)) return false;
    if (filtroIdadeMax && (u.idade ?? 0) > Number(filtroIdadeMax)) return false;
    if (buscaUsuario.trim()) {
      const termo = buscaUsuario.trim().toLowerCase();
      const alvo = `${u.nome || ""} ${u.email || ""}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6 p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visao geral do sistema
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            role="tablist"
            aria-label="Secoes do painel"
            className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1"
          >
            {(
              [
                { key: "visao", label: "Visao geral", icon: LayoutDashboard },
                { key: "usuarios", label: "Usuarios", icon: Users },
                { key: "recompensas", label: "Recompensas", icon: Gift },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={aba === t.key}
                onClick={() => setAba(t.key)}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors sm:flex-none ${
                  aba === t.key
                    ? "bg-success text-success-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden />
                {t.label}
              </button>
            ))}
          </div>
          {aba === "visao" && (
            <Button variant="secondary" onClick={handleClearFilters} className="min-h-11">
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {aba === "recompensas" && (
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">Adicionar recompensa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A recompensa entra no catalogo e aparece na pagina de Recompensas do app.
            </p>

            <form onSubmit={handleCriarRecompensa} className="mt-5 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rec-titulo">Titulo</Label>
                  <Input
                    id="rec-titulo"
                    value={formRecompensa.titulo}
                    onChange={(e) => setFormRecompensa((f) => ({ ...f, titulo: e.target.value }))}
                    placeholder="Cupom 15% Off"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rec-descricao">Descricao</Label>
                  <textarea
                    id="rec-descricao"
                    value={formRecompensa.descricao}
                    onChange={(e) => setFormRecompensa((f) => ({ ...f, descricao: e.target.value }))}
                    placeholder="Desconto em lojas parceiras de Cascavel"
                    maxLength={500}
                    rows={3}
                    className="w-full rounded-lg border border-field-border bg-background px-3.5 py-2.5 text-base tracking-normal text-foreground transition-[border-color,background-color] duration-100 ease-out placeholder:text-field-placeholder hover:border-field-border-hover focus-visible:border-field-border-focus focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rec-custo">Custo em pontos</Label>
                  <Input
                    id="rec-custo"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={formRecompensa.custo_pontos}
                    onChange={(e) => setFormRecompensa((f) => ({ ...f, custo_pontos: e.target.value }))}
                    placeholder="150"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rec-categoria">Categoria</Label>
                  <Select
                    id="rec-categoria"
                    value={formRecompensa.categoria}
                    onChange={(e) =>
                      setFormRecompensa((f) => ({
                        ...f,
                        categoria: e.target.value as RecompensaAdmin["categoria"],
                      }))
                    }
                  >
                    {CATEGORIAS_RECOMPENSA.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rec-icone">Icone (texto curto)</Label>
                  <Input
                    id="rec-icone"
                    value={formRecompensa.icone}
                    onChange={(e) => setFormRecompensa((f) => ({ ...f, icone: e.target.value }))}
                    placeholder="10"
                    maxLength={8}
                  />
                </div>
              </div>

              {erroRecompensa && (
                <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {erroRecompensa}
                </p>
              )}

              <Button type="submit" className="h-11 w-full font-semibold sm:w-auto" disabled={salvandoRecompensa}>
                {salvandoRecompensa ? "Salvando..." : "Adicionar recompensa"}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">Catalogo</h2>
                <Badge variant="default">{recompensas.length}</Badge>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onClick={() => void carregarRecompensas()}
                disabled={carregandoRecompensas}
              >
                {carregandoRecompensas ? "Carregando..." : "Atualizar"}
              </Button>
            </div>

            {recompensas.length === 0 && !carregandoRecompensas ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma recompensa no catalogo ainda.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {recompensas.map((recompensa) => (
                  <li
                    key={recompensa.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-sm font-bold text-success">
                      {recompensa.icone || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {recompensa.titulo}
                        </span>
                        <Badge variant="success">{recompensa.custo_pontos} pts</Badge>
                        <Badge variant="default">
                          {CATEGORIAS_RECOMPENSA.find((c) => c.value === recompensa.categoria)?.label ??
                            recompensa.categoria}
                        </Badge>
                        {!recompensa.ativa && <Badge variant="warning">Pausada</Badge>}
                      </div>
                      {recompensa.descricao ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                          {recompensa.descricao}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs italic text-muted-foreground">Sem descricao</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-11"
                      onClick={() => void handleAlternarRecompensa(recompensa)}
                    >
                      {recompensa.ativa ? "Pausar" : "Reativar"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {aba === "usuarios" ? (
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
                <Badge variant="default">{usuariosFiltrados.length}</Badge>
              </div>
              <Button
                variant="default"
                onClick={() => {
                  if (formAdminAberto) {
                    setFormAdminAberto(false);
                    setAdminCriado(null);
                    setAdminErro("");
                  } else {
                    setFormAdminAberto(true);
                  }
                }}
                aria-expanded={formAdminAberto}
                className="min-h-11 w-full gap-2 bg-success text-success-foreground sm:w-auto"
              >
                {formAdminAberto ? (
                  <X className="h-4 w-4" aria-hidden />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden />
                )}
                {formAdminAberto ? "Fechar" : "Criar novo admin"}
              </Button>
            </div>

            {(adminCriado || adminErro) && formAdminAberto && (
              <div className="mt-3">
                {adminCriado ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                    <span className="text-sm font-semibold text-success">
                      {adminCriado.nome} agora e administrador
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {adminCriado.email} — ja pode entrar com a senha definida
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
                    <span className="text-sm text-destructive">{adminErro}</span>
                  </div>
                )}
              </div>
            )}

            {formAdminAberto && !adminCriado && (
              <form onSubmit={handleCriarAdmin} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-nome" className="text-xs font-semibold text-muted-foreground">
                    Nome completo
                  </Label>
                  <Input
                    id="admin-nome"
                    value={adminForm.nome}
                    onChange={(e) => setAdminForm((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="Maria Souza"
                    autoComplete="off"
                    className="h-11 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold text-muted-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="maria@empresa.com"
                    autoComplete="off"
                    inputMode="email"
                    className="h-11 rounded-xl text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-senha" className="text-xs font-semibold text-muted-foreground">
                    Senha provisoria
                  </Label>
                  <Input
                    id="admin-senha"
                    type="password"
                    value={adminForm.senha}
                    onChange={(e) => setAdminForm((f) => ({ ...f, senha: e.target.value }))}
                    placeholder="Minimo de 8 caracteres"
                    autoComplete="new-password"
                    className="h-11 rounded-xl text-base"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="submit"
                    disabled={criandoAdmin}
                    className="min-h-11 w-full gap-2 bg-success text-success-foreground sm:w-auto"
                  >
                    {criandoAdmin ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" aria-hidden />
                        Criar administrador
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            <p className="text-sm text-muted-foreground mt-4 mb-4">
              Toque em um usuario para ver o perfil completo, o mesmo exibido na aba Perfil.
            </p>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={buscaUsuario}
                  onChange={(e) => setBuscaUsuario(e.target.value)}
                  placeholder="Buscar por nome ou e-mail"
                  aria-label="Buscar por nome ou e-mail"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground font-medium" htmlFor="filtro-sexo">
                    Sexo
                  </label>
                  <select
                    id="filtro-sexo"
                    value={filtroSexo}
                    onChange={(e) => setFiltroSexo(e.target.value)}
                    className="h-11 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="todos">Todos</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="nao_informado">Nao informado</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground font-medium" htmlFor="filtro-idade-min">
                    Idade Min
                  </label>
                  <input
                    id="filtro-idade-min"
                    type="number"
                    inputMode="numeric"
                    value={filtroIdadeMin}
                    onChange={(e) => setFiltroIdadeMin(e.target.value)}
                    placeholder="Min"
                    min="1"
                    max="120"
                    className="h-11 w-28 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground font-medium" htmlFor="filtro-idade-max">
                    Idade Max
                  </label>
                  <input
                    id="filtro-idade-max"
                    type="number"
                    inputMode="numeric"
                    value={filtroIdadeMax}
                    onChange={(e) => setFiltroIdadeMax(e.target.value)}
                    placeholder="Max"
                    min="1"
                    max="120"
                    className="h-11 w-28 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button variant="ghost" onClick={handleApplyFilters} className="min-h-11">
                  Aplicar
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground text-sm animate-pulse">Carregando...</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhum usuario encontrado
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {usuariosFiltrados.map((u) => {
                  const selecionado = usuarioDetalheId === u.id;
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => setUsuarioDetalheId(u.id)}
                        aria-pressed={selecionado}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                          selecionado
                            ? "border-success bg-success/10"
                            : "border-border bg-background hover:bg-muted/50"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl squircle border border-success/30 bg-success/10 text-sm font-bold text-success">
                          {getInitials(u.nome)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {u.nome}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Nfc className="h-3 w-3" aria-hidden />
                            {u.tags_validadas ?? 0}{" "}
                            {u.tags_validadas === 1 ? "tag validada" : "tags validadas"}
                          </span>
                        </span>
                        {u.tipo === "admin" && <Badge variant="default">Admin</Badge>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {detalheLoading && (
            <Card className="p-6">
              <p className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                Carregando perfil...
              </p>
            </Card>
          )}

          {usuarioDetalhe && !detalheLoading && (
            <>
              <Card className="p-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUsuarioDetalheId(null);
                    setUsuarioDetalhe(null);
                  }}
                  className="mb-3 -ml-2 min-h-11 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Voltar a lista
                </Button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl squircle bg-gradient-to-br from-success/20 via-success/10 to-transparent border-2 border-success/30 flex items-center justify-center text-success shadow-inner">
                        <span className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
                          {getInitials(usuarioDetalhe.nome)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-card flex items-center justify-center text-xs shadow-sm">
                        <span>{ecoProgress.ecoLevel.icon}</span>
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                          {usuarioDetalhe.nome}
                        </h2>
                        <Badge variant="success" className="text-[10px] py-0.5">
                          {getTipoLabel(usuarioDetalhe.tipo)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
                        <span className="truncate max-w-[220px] sm:max-w-xs font-mono">
                          {usuarioDetalhe.email}
                        </span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
                        <span>
                          {usuarioDetalhe.criado_em
                            ? `Membro desde ${formatDate(usuarioDetalhe.criado_em)}`
                            : "Membro ativo recente"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-success" aria-hidden />
                      <span>
                        Nivel {ecoProgress.ecoLevel.level} · {ecoProgress.ecoLevel.title}
                      </span>
                    </div>
                    <span className="font-semibold text-success tabular-nums">
                      {usuarioDetalhe.pontos} pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ecoProgress.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-success shadow-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                    <span>{ecoProgress.ecoLevel.minPoints} pts</span>
                    <span>
                      {ecoProgress.ecoLevel.nextThreshold
                        ? `Faltam ${ecoProgress.pointsToNext} pts para o proximo nivel`
                        : "Nivel maximo alcancado!"}
                    </span>
                    <span>
                      {ecoProgress.ecoLevel.nextThreshold
                        ? `${ecoProgress.ecoLevel.nextThreshold} pts`
                        : "∞"}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: "Ecopontos",
                    value: usuarioDetalhe.pontos,
                    caption: "Saldo acumulado",
                    icon: Leaf,
                    tone: "bg-success/10 text-success",
                  },
                  {
                    label: "Entregas",
                    value: usuarioDetalhe.entregas,
                    caption: "Descartes validados",
                    icon: Trophy,
                    tone: "bg-primary/10 text-primary",
                  },
                  {
                    label: "Arvores",
                    value: usuarioDetalhe.arvores,
                    caption: "Impacto estimado",
                    icon: Trees,
                    tone: "bg-success/10 text-success",
                  },
                  {
                    label: "Tags NFC",
                    value: usuarioDetalhe.tags_count,
                    caption: "Identificadores",
                    icon: QrCode,
                    tone: "bg-secondary text-secondary-foreground",
                  },
                ].map((s) => (
                  <Card key={s.label} className="p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </span>
                      <div className={`p-1.5 rounded-lg ${s.tone}`}>
                        <s.icon className="h-4 w-4" aria-hidden />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                        {s.value}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.caption}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Dados Pessoais
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Informacoes de identificacao da conta
                </p>
                <div className="mt-4 divide-y divide-border/60">
                  {[
                    {
                      label: "Nome Completo",
                      value: usuarioDetalhe.nome || "Nao informado",
                      icon: User,
                      mono: false,
                    },
                    { label: "E-mail", value: usuarioDetalhe.email || "-", icon: Mail, mono: true },
                    {
                      label: "Tipo de Conta",
                      value: getTipoLabel(usuarioDetalhe.tipo),
                      icon: ShieldCheck,
                      mono: false,
                    },
                    {
                      label: "CPF",
                      value: usuarioDetalhe.cpf || "Nao informado",
                      icon: Fingerprint,
                      mono: true,
                    },
                    {
                      label: "Sexo",
                      value: usuarioDetalhe.sexo
                        ? SEXO_LABELS[usuarioDetalhe.sexo] || usuarioDetalhe.sexo
                        : "Nao informado",
                      icon: User,
                      mono: false,
                    },
                    {
                      label: "Idade",
                      value: usuarioDetalhe.idade ?? "Nao informado",
                      icon: User,
                      mono: false,
                    },
                    {
                      label: "ID da Matricula",
                      value: `#${usuarioDetalhe.id}`,
                      icon: Fingerprint,
                      mono: true,
                    },
                  ].map((row) => (
                    <div key={row.label} className="py-3 flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <row.icon className="h-4 w-4 text-muted-foreground/70" aria-hidden />
                        {row.label}
                      </span>
                      <span
                        className={`text-sm text-foreground ${
                          row.mono ? "font-mono text-xs" : "font-semibold"
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-success" aria-hidden />
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Residencia & Coleta Domiciliar
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O numero de moradores ajusta as metas mensais e o impacto per capita.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                  <Users className="h-4 w-4 text-success shrink-0" aria-hidden />
                  <span>
                    Residencia cadastrada para{" "}
                    <strong>
                      {usuarioDetalhe.household_size}{" "}
                      {usuarioDetalhe.household_size === 1 ? "morador" : "moradores"}
                    </strong>
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Tags NFC
                  </h3>
                  <Badge variant="default">{usuarioDetalhe.tags.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Historico de tags registradas pelo usuario.
                </p>
                {usuarioDetalhe.tags.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma tag usada ainda
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {usuarioDetalhe.tags.map((t) => (
                      <li
                        key={`${t.id}-${t.data_entrega}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Nfc className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                          <span className="font-mono text-sm font-bold text-foreground">
                            {t.codigo_nfc}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          {t.data_entrega && (
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(t.data_entrega).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          <Badge
                            variant={
                              t.reciclagem_status === "validada" ? "success" : "warning"
                            }
                          >
                            {t.reciclagem_status === "validada" ? "Validada" : "Aguardando"}
                          </Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Conquistas
                  </h3>
                  <Badge variant="default">{usuarioDetalhe.conquistas.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Medalas conquistadas e pontos resgatados.
                </p>
                {usuarioDetalhe.conquistas.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma conquista registrada
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {usuarioDetalhe.conquistas.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
                      >
                        <Trophy
                          className={`h-3.5 w-3.5 ${
                            c.resgatada_em ? "text-success" : "text-muted-foreground"
                          }`}
                          aria-hidden
                        />
                        <span className="text-xs font-semibold text-foreground">
                          {c.conquista_codigo.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-success tabular-nums">
                          +{c.pontos_ganhos}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </div>
      ) : (
        <>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{metricLabel}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{metricValue}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{metricSecondaryLabel}</p>
            <p className="text-3xl font-bold text-muted-foreground mt-2">{metricSecondary}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Pontos</p>
            <p className="text-3xl font-bold text-success mt-2">{stats.total_pontos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Tags</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.total_tags_validadas}</p>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {chartType === "sexo" ? "Distribuicao por Sexo" : "Distribuicao por Faixa Etaria"}
            </h2>
            <Badge variant={chartTypeVariant}>{chartTypeLabel}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === "sexo" ? "default" : "secondary"}
              size="sm"
              onClick={() => setChartType("sexo")}
              className={chartType === "sexo" ? "bg-success text-success-foreground" : ""}
            >
              Sexo
            </Button>
            <Button
              variant={chartType === "idade" ? "default" : "secondary"}
              size="sm"
              onClick={() => setChartType("idade")}
              className={chartType === "idade" ? "bg-success text-success-foreground" : ""}
            >
              Idade
            </Button>
          </div>
        </div>
        <div className="h-64">
          {renderChart()}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Tags</h2>
            <Badge variant="default">
              <Nfc className="mr-1 h-3 w-3" aria-hidden />
              {tags.length}
            </Badge>
          </div>
          {totalAguardando > 0 && (
            <Badge variant="warning">{totalAguardando} aguardando validacao</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Toque em uma tag para ver quantas pessoas ja usaram e validar a reciclagem. Ao validar, o
          usuario recebe os pontos e a tag volta a ficar livre.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={buscaTag}
              onChange={(e) => setBuscaTag(e.target.value)}
              placeholder="Buscar codigo NFC"
              aria-label="Buscar codigo NFC"
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            {(
              [
                { key: "todas", label: "Todas" },
                { key: "aguardando", label: "Aguardando" },
                { key: "validada", label: "Validadas" },
              ] as const
            ).map((f) => (
              <Button
                key={f.key}
                variant={filtroTag === f.key ? "default" : "secondary"}
                size="sm"
                onClick={() => setFiltroTag(f.key)}
                className={`min-h-11 flex-1 sm:flex-none ${
                  filtroTag === f.key ? "bg-success text-success-foreground" : ""
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {tagsLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground text-sm animate-pulse">Carregando tags...</p>
          </div>
        ) : tagsFiltradas.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma tag encontrada
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tagsFiltradas.map((tag) => {
              const situacao = SITUACAO[tag.situacao];
              const selecionada = tagSelecionada?.id === tag.id;
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTagSelecionadaId(tag.id);
                      setTagResult(null);
                    }}
                    aria-pressed={selecionada}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      selecionada
                        ? "border-success bg-success/10"
                        : "border-border bg-background hover:bg-muted/50"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-sm font-bold text-foreground">
                        {tag.codigo_nfc}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" aria-hidden />
                        {tag.pessoas} {tag.pessoas === 1 ? "pessoa" : "pessoas"}
                        <span aria-hidden>&middot;</span>
                        {tag.total_usos} {tag.total_usos === 1 ? "uso" : "usos"}
                      </span>
                    </span>
                    <Badge variant={situacao.variant}>{situacao.label}</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {tagSelecionada && (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-base font-bold text-foreground">
                  {tagSelecionada.codigo_nfc}
                </p>
                <p className="text-xs text-muted-foreground">
                  Estado da tag: {tagSelecionada.status}
                </p>
              </div>
              <Badge variant={SITUACAO[tagSelecionada.situacao].variant}>
                {SITUACAO[tagSelecionada.situacao].label}
              </Badge>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Pessoas",
                  value: tagSelecionada.pessoas,
                  icon: Users,
                },
                {
                  label: "Usos totais",
                  value: tagSelecionada.total_usos,
                  icon: RotateCcw,
                },
                {
                  label: "Validacoes",
                  value: tagSelecionada.validacoes,
                  icon: CheckCircle2,
                },
                {
                  label: "Aguardando",
                  value: tagSelecionada.pendentes,
                  icon: Clock,
                },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-background p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <m.icon className="h-3 w-3" aria-hidden />
                    {m.label}
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-foreground">{m.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 text-sm text-muted-foreground">
              {tagSelecionada.ultima_utilizacao ? (
                <>
                  Ultimo uso em{" "}
                  {new Date(tagSelecionada.ultima_utilizacao).toLocaleDateString("pt-BR")}
                  {tagSelecionada.ultimo_usuario
                    ? ` por ${tagSelecionada.ultimo_usuario}`
                    : ""}
                  .
                </>
              ) : (
                "Esta tag ainda nao foi usada por ninguem."
              )}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="default"
                onClick={() => handleValidateTag(tagSelecionada.codigo_nfc)}
                disabled={validating || !tagSelecionada.pode_validar}
                className="min-h-11 bg-success text-success-foreground"
              >
                {validating
                  ? "Validando..."
                  : tagSelecionada.pode_validar
                  ? "Validar e Liberar"
                  : "Nada pendente"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTagSelecionadaId(null)}
                className="min-h-11"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {tagResult && (
          <div className="mt-4">
            {tagResult.valid ? (
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                <span className="text-success font-bold text-sm">
                  {tagResult.message || "Tag validada e liberada"}
                </span>
                {tagResult.tag?.codigo_nfc && (
                  <Badge variant="success">{tagResult.tag.codigo_nfc}</Badge>
                )}
                {typeof tagResult.reciclagens_validadas === "number" && (
                  <span className="text-xs text-muted-foreground">
                    Reciclagens confirmadas: {tagResult.reciclagens_validadas}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <span className="text-destructive font-bold text-sm">
                  {tagResult.message || "Tag invalida"}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

        </>
      )}

    </motion.div>
  );
}
