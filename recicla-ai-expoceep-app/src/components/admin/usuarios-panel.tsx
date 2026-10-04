"use client";

import { useState } from "react";
import { Nfc, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/eco-level";
import { AdminCreator } from "./admin-creator";
import { LIMITE_USUARIOS } from "./constants";
import type { AdminFilters, User } from "./types";

interface UsuariosPanelProps {
  users: User[];
  total: number;
  page: number;
  loading: boolean;
  filters: AdminFilters;
  usuarioDetalheId: number | null;
  onFiltroChange: (patch: Partial<AdminFilters>) => void;
  onAplicar: () => void;
  onLimpar: () => void;
  onPaginaChange: (pagina: number) => void;
  onSelecionar: (usuarioId: number) => void;
  onCriado: () => void;
}

export function UsuariosPanel({
  users,
  total,
  page,
  loading,
  filters,
  usuarioDetalheId,
  onFiltroChange,
  onAplicar,
  onLimpar,
  onPaginaChange,
  onSelecionar,
  onCriado,
}: UsuariosPanelProps) {
  const [busca, setBusca] = useState("");

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_USUARIOS));

  const visiveis = users.filter((u) => {
    if (filters.sexo !== "todos" && (u.sexo || "nao_informado") !== filters.sexo) return false;
    if (filters.idadeMin && (u.idade ?? 0) < Number(filters.idadeMin)) return false;
    if (filters.idadeMax && (u.idade ?? 0) > Number(filters.idadeMax)) return false;
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      const alvo = `${u.nome || ""} ${u.email || ""}`.toLowerCase();
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });

  const inicio = total === 0 ? 0 : (page - 1) * LIMITE_USUARIOS + 1;
  const fim = Math.min(page * LIMITE_USUARIOS, total);

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <AdminCreator total={total} onCriado={onCriado} />

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
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              aria-label="Buscar por nome ou e-mail"
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label
                className="text-xs text-muted-foreground font-medium"
                htmlFor="filtro-sexo"
              >
                Sexo
              </label>
              <select
                id="filtro-sexo"
                value={filters.sexo}
                onChange={(e) => onFiltroChange({ sexo: e.target.value })}
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
              <label
                className="text-xs text-muted-foreground font-medium"
                htmlFor="filtro-idade-min"
              >
                Idade Min
              </label>
              <input
                id="filtro-idade-min"
                type="number"
                inputMode="numeric"
                value={filters.idadeMin}
                onChange={(e) => onFiltroChange({ idadeMin: e.target.value })}
                placeholder="Min"
                min="1"
                max="120"
                className="h-11 w-28 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs text-muted-foreground font-medium"
                htmlFor="filtro-idade-max"
              >
                Idade Max
              </label>
              <input
                id="filtro-idade-max"
                type="number"
                inputMode="numeric"
                value={filters.idadeMax}
                onChange={(e) => onFiltroChange({ idadeMax: e.target.value })}
                placeholder="Max"
                min="1"
                max="120"
                className="h-11 w-28 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button variant="ghost" onClick={onAplicar} className="min-h-11">
              Aplicar
            </Button>
            <Button variant="secondary" onClick={onLimpar} className="min-h-11">
              Limpar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground text-sm animate-pulse">Carregando...</p>
          </div>
        ) : visiveis.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhum usuario encontrado
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((u) => {
              const selecionado = usuarioDetalheId === u.id;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => onSelecionar(u.id)}
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

        {!loading && total > LIMITE_USUARIOS && (
          <nav
            aria-label="Paginacao de usuarios"
            className="mt-5 flex flex-col items-center gap-3 border-t border-border/60 pt-4 sm:flex-row sm:justify-between"
          >
            <p className="text-xs text-muted-foreground tabular-nums">
              Mostrando {inicio}–{fim} de {total} usuarios
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="min-h-11"
                disabled={page <= 1}
                onClick={() => onPaginaChange(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                Pagina {page} de {totalPaginas}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="min-h-11"
                disabled={page >= totalPaginas}
                onClick={() => onPaginaChange(page + 1)}
              >
                Proxima
              </Button>
            </div>
          </nav>
        )}
      </Card>
    </div>
  );
}
