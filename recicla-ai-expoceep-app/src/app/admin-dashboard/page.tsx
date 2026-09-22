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
import { Separator } from "@/components/ui/separator";

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
}

interface Stats {
  total_usuarios: number;
  total_pontos: number;
  por_sexo: { masculino: number; feminino: number; outro: number; nao_informado: number };
  por_faixa_etaria: { "18-25": number; "26-35": number; "36-45": number; "46-55": number; "56+": number };
}

const COLORS = ["#4ade80", "#f472b6", "#facc15", "#94a3b8"];
const SEXO_COLORS: Record<string, string> = {
  masculino: "#4ade80",
  feminino: "#f472b6",
  outro: "#facc15",
  nao_informado: "#94a3b8",
};
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

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtroSexo !== "todos") params.set("sexo", filtroSexo);
      if (filtroIdadeMin) params.set("idade_min", filtroIdadeMin);
      if (filtroIdadeMax) params.set("idade_max", filtroIdadeMax);

      const [usersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/users?${params}`),
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

  const handleClearFilters = () => {
    setFiltroSexo("todos");
    setFiltroIdadeMin("");
    setFiltroIdadeMax("");
  };

  const handleApplyFilters = () => {
    fetchData();
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
            Visao geral dos usuarios do sistema
          </p>
        </div>
        <Button variant="secondary" onClick={handleClearFilters}>
          Limpar Filtros
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Usuarios</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.total_usuarios}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Pontos</p>
            <p className="text-3xl font-bold text-success mt-2">{stats.total_pontos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Masculinos</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.por_sexo.masculino}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Femininas</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.por_sexo.feminino}</p>
          </Card>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Distribuicao por Sexo</h2>
          <Badge variant="default">Sexo</Badge>
        </div>
        <div className="h-64 flex items-center justify-center">
          {sexoChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sexoChartData}
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
                  {sexoChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">Sem dados disponiveis</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Distribuicao por Faixa Etaria</h2>
          <Badge variant="success">Idade</Badge>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={idadeChartData}>
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
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
          <Button variant="ghost" size="sm" onClick={handleApplyFilters}>
            Aplicar
          </Button>
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
        </div>
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
                    <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
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
