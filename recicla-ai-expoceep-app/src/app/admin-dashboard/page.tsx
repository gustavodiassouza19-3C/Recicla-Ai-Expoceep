"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroSexo, setFiltroSexo] = useState("todos");
  const [filtroIdadeMin, setFiltroIdadeMin] = useState("");
  const [filtroIdadeMax, setFiltroIdadeMax] = useState("");
  const [metricView, setMetricView] = useState<"users" | "tags">("tags");
  const [chartType, setChartType] = useState<"sexo" | "idade">("sexo");
  const [codigoTag, setCodigoTag] = useState("");
  const [tagResult, setTagResult] = useState<{ valid: boolean; tag?: any; message?: string } | null>(null);
  const [validating, setValidating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtroSexo !== "todos") params.set("sexo", filtroSexo);
      if (filtroIdadeMin) params.set("idade_min", filtroIdadeMin);
      if (filtroIdadeMax) params.set("idade_max", filtroIdadeMax);

      const [usersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/users/tags?${params}`),
        fetch("/api/admin/stats"),
      ]);
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      setUsers(usersData.data || []);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filtroSexo, filtroIdadeMin, filtroIdadeMax]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sexoChartData = stats
    ? [
        { name: "Masculino", value: stats.por_sexo.masculino },
        { name: "Feminino", value: stats.por_sexo.feminino },
        { name: "Outro", value: stats.por_sexo.outro },
        { name: "Nao informado", value: stats.por_sexo.nao_informado },
      ].filter((d) => d.value > 0)
    : [];

  const idadeChartData = [
    { faixa: "18-25", total: stats?.por_faixa_etaria["18-25"] || 0 },
    { faixa: "26-35", total: stats?.por_faixa_etaria["26-35"] || 0 },
    { faixa: "36-45", total: stats?.por_faixa_etaria["36-45"] || 0 },
    { faixa: "46-55", total: stats?.por_faixa_etaria["46-55"] || 0 },
    { faixa: "56+", total: stats?.por_faixa_etaria["56+"] || 0 },
  ];

  const chartData: any = chartType === "sexo" ? sexoChartData : idadeChartData;
  const chartTypeLabel = chartType === "sexo" ? "Sexo" : "Faixa Etaria";
  const chartTypeVariant = chartType === "sexo" ? "default" : "success";
  const isPieChart = chartType === "sexo";

  const metricLabel = metricView === "tags" ? "Tags Validadas" : "Usuarios";
  const metricValue = metricView === "tags"
    ? stats?.total_tags_validadas || 0
    : stats?.total_usuarios || 0;
  const metricSecondary = metricView === "tags"
    ? stats?.total_usuarios || 0
    : stats?.total_tags_validadas || 0;
  const metricSecondaryLabel = metricView === "tags" ? "Usuarios" : "Tags Validadas";

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
              {chartData.map((_: any, index: number) => (
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

  const handleValidateTag = async () => {
    if (!codigoTag.trim()) return;
    setValidating(true);
    setTagResult(null);
    try {
      const res = await fetch("/api/admin/validate-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_nfc: codigoTag.trim().toUpperCase() }),
      });
      const data = await res.json();
      setTagResult(data);
    } catch (e) {
      setTagResult({ valid: false, message: "Erro ao validar tag" });
    } finally {
      setValidating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visao geral do sistema
          </p>
        </div>
        <Button variant="secondary" onClick={handleClearFilters}>
          Limpar Filtros
        </Button>
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Filtros por Metricas</h2>
          <div className="flex gap-2">
            <Button
              variant={metricView === "tags" ? "default" : "secondary"}
              size="sm"
              onClick={() => setMetricView("tags")}
              className={metricView === "tags" ? "bg-success text-success-foreground" : ""}
            >
              Tags Validadas
            </Button>
            <Button
              variant={metricView === "users" ? "default" : "secondary"}
              size="sm"
              onClick={() => setMetricView("users")}
              className={metricView === "users" ? "bg-success text-success-foreground" : ""}
            >
              Usuarios
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium">Sexo</label>
            <select
              value={filtroSexo}
              onChange={(e) => setFiltroSexo(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="todos">Todos</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium">Idade Min</label>
            <input
              type="number"
              value={filtroIdadeMin}
              onChange={(e) => setFiltroIdadeMin(e.target.value)}
              placeholder="Min"
              min="1"
              max="120"
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium">Idade Max</label>
            <input
              type="number"
              value={filtroIdadeMax}
              onChange={(e) => setFiltroIdadeMax(e.target.value)}
              placeholder="Max"
              min="1"
              max="120"
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={handleApplyFilters}>
            Aplicar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Validar Tag</h2>
          <Badge variant="success">NFC</Badge>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium">Codigo NFC</label>
            <input
              type="text"
              value={codigoTag}
              onChange={(e) => setCodigoTag(e.target.value)}
              placeholder="Ex: A1B2C"
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ width: "200px" }}
            />
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleValidateTag}
            disabled={validating || !codigoTag.trim()}
            className="bg-success text-success-foreground"
          >
            {validating ? "Validando..." : "Validar"}
          </Button>
        </div>
        {tagResult && (
          <div className="mt-4">
            {tagResult.valid ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                <span className="text-success font-bold text-sm">Tag Validada</span>
                <Badge variant="success">{tagResult.tag?.codigo_nfc}</Badge>
                <span className="text-xs text-muted-foreground">
                  Status: {tagResult.tag?.status}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <span className="text-destructive font-bold text-sm">{tagResult.message || "Tag invalida"}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Usuarios Cadastrados</h2>
          <Badge variant="default">{users.length}</Badge>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-sm animate-pulse">Carregando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Sexo
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Idade
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Tags Validadas
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Pontos
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Cadastro
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {user.nome}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.sexo === "masculino"
                            ? "default"
                            : user.sexo === "feminino"
                            ? "success"
                            : user.sexo === "outro"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {user.sexo
                          ? SEXO_LABELS[user.sexo] || user.sexo
                          : "Nao informado"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {user.idade ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-success font-medium">
                      {user.tags_validadas ?? 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-success font-medium">
                      {user.pontos}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.criado_em
                        ? new Date(user.criado_em).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                  </motion.tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhum usuario encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
