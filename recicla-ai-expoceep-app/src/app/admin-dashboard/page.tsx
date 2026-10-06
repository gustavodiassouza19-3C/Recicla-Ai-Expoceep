"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { isAdminTipo } from "@/lib/roles";
import { ChartsCard } from "@/components/admin/charts-card";
import { ConfiguracoesPanel } from "@/components/admin/configuracoes-panel";
import { ProfileMenu } from "@/components/admin/profile-menu";
import { fetchAdminTags, fetchStatsAndUsers } from "@/components/admin/api";
import { TABS } from "@/components/admin/constants";
import { RecompensasPanel } from "@/components/admin/recompensas-panel";
import { StatsCards } from "@/components/admin/stats-cards";
import { TagsPanel } from "@/components/admin/tags-panel";
import { UsuarioDetalhe } from "@/components/admin/usuario-detalhe";
import { UsuariosPanel } from "@/components/admin/usuarios-panel";
import type {
  AbaAdmin,
  AdminFilters,
  Stats,
  TagAdmin,
  User,
} from "@/components/admin/types";

const FILTROS_PADRAO: AdminFilters = { sexo: "todos", idadeMin: "", idadeMax: "" };

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [aba, setAba] = useState<AbaAdmin>("visao");

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<AdminFilters>(FILTROS_PADRAO);

  const [tags, setTags] = useState<TagAdmin[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const [usuarioDetalheId, setUsuarioDetalheId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchStatsAndUsers(filtros, pagina, token);
      setUsers(data.users);
      setTotal(data.total);
      setStats(data.stats);
    } catch {
      setUsers([]);
      setTotal(0);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filtros, pagina, token]);

  const fetchTags = useCallback(async () => {
    try {
      setTags(await fetchAdminTags(token));
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

  useEffect(() => {
    if (!authLoading && (!user || !isAdminTipo(user.tipo))) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || !isAdminTipo(user.tipo)) {
    return null;
  }

  const alterarFiltro = (patch: Partial<AdminFilters>) => {
    setFiltros((f) => ({ ...f, ...patch }));
    // Mudou o recorte: a pagina deixa de fazer sentido.
    setPagina(1);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_PADRAO);
    setPagina(1);
  };

  const totalAguardando = tags.filter((t) => t.situacao === "aguardando").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6 p-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground mt-1">Visao geral do sistema</p>
          </div>
          <ProfileMenu />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Secoes do painel"
            className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1"
          >
            {TABS.map((t) => (
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
            <Button variant="secondary" onClick={limparFiltros} className="min-h-11">
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {aba === "visao" && (
        <div className="flex flex-col gap-6">
          <StatsCards
            stats={stats}
            totalTags={tags.length}
            tagsAguardando={totalAguardando}
          />
          <ChartsCard stats={stats} />
          <TagsPanel
            tags={tags}
            loading={tagsLoading}
            token={token}
            onValidado={() => {
              void fetchData();
              void fetchTags();
            }}
          />
        </div>
      )}

      {aba === "usuarios" && (
        <div className="flex flex-col gap-6">
          <UsuariosPanel
            users={users}
            total={total}
            page={pagina}
            loading={loading}
            filters={filtros}
            usuarioDetalheId={usuarioDetalheId}
            onFiltroChange={alterarFiltro}
            onAplicar={() => void fetchData()}
            onLimpar={limparFiltros}
            onPaginaChange={setPagina}
            onSelecionar={(id) =>
              setUsuarioDetalheId((atual) => (atual === id ? null : id))
            }
            onCriado={() => void fetchData()}
          />

          {usuarioDetalheId !== null && (
            <UsuarioDetalhe
              usuarioId={usuarioDetalheId}
              token={token}
              onFechar={() => setUsuarioDetalheId(null)}
            />
          )}
        </div>
      )}

      {aba === "recompensas" && <RecompensasPanel token={token} />}

      {aba === "configuracoes" && <ConfiguracoesPanel token={token} />}
    </motion.div>
  );
}
