"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createRecompensa,
  deleteRecompensa,
  fetchRecompensas,
  updateRecompensa,
} from "./api";
import {
  CATEGORIAS_RECOMPENSA,
  FORM_RECOMPENSA_VAZIO,
  OPCOES_STATUS_RECOMPENSA,
} from "./constants";
import type { RecompensaAdmin, RecompensaForm } from "./types";

/**
 * A aba de recompensas e autossuficiente: carrega e grava os dados sozinha,
 * porque nada fora dela consome o catalogo.
 */
export function RecompensasPanel({ token }: { token: string | null }) {
  const [recompensas, setRecompensas] = useState<RecompensaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState<RecompensaForm>(FORM_RECOMPENSA_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [status, setStatus] = useState<"todos" | "ativos" | "pausados">("todos");

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await fetchRecompensas(token);
      setRecompensas(lista);
    } catch {
      setRecompensas([]);
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      await recarregar();
    })();
  }, [recarregar]);

  const editando = editandoId !== null ? recompensas.find((r) => r.id === editandoId) : null;

  const pararEdicao = () => {
    setEditandoId(null);
    setForm(FORM_RECOMPENSA_VAZIO);
    setErro("");
  };

  const iniciarEdicao = (recompensa: RecompensaAdmin) => {
    setErro("");
    setEditandoId(recompensa.id);
    setForm({
      titulo: recompensa.titulo,
      descricao: recompensa.descricao ?? "",
      custo_pontos: String(recompensa.custo_pontos),
      categoria: recompensa.categoria,
      icone: recompensa.icone ?? "",
    });
    document
      .getElementById("form-recompensa")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro("");

    const custo = Number.parseInt(form.custo_pontos, 10);
    if (form.titulo.trim().length < 2) {
      setErro("Informe um titulo com pelo menos 2 caracteres.");
      return;
    }
    if (!Number.isFinite(custo) || custo <= 0) {
      setErro("Informe um custo em pontos maior que zero.");
      return;
    }

    setSalvando(true);
    try {
      if (editandoId !== null) {
        const alvo = recompensas.find((r) => r.id === editandoId);
        if (!alvo) throw new Error("Recompensa nao encontrada");
        await updateRecompensa(
          editandoId,
          {
            titulo: form.titulo.trim(),
            descricao: form.descricao.trim(),
            custo_pontos: custo,
            categoria: form.categoria,
            icone: form.icone.trim() || null,
            ativa: alvo.ativa,
          },
          token
        );
      } else {
        await createRecompensa(form, custo, token);
      }
      pararEdicao();
      await recarregar();
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : editandoId !== null
            ? "Erro ao atualizar recompensa"
            : "Erro ao criar recompensa"
      );
    } finally {
      setSalvando(false);
    }
  };

  const alternar = async (recompensa: RecompensaAdmin) => {
    setErro("");
    try {
      await updateRecompensa(
        recompensa.id,
        {
          titulo: recompensa.titulo,
          descricao: recompensa.descricao ?? "",
          custo_pontos: recompensa.custo_pontos,
          categoria: recompensa.categoria,
          icone: recompensa.icone,
          ativa: !recompensa.ativa,
        },
        token
      );
      await recarregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao atualizar recompensa");
    }
  };

  const confirmarExclusao = async () => {
    if (excluindoId === null) return;
    setExcluindo(true);
    setErro("");
    try {
      await deleteRecompensa(excluindoId, token);
      setExcluindoId(null);
      await recarregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover recompensa");
    } finally {
      setExcluindo(false);
    }
  };

  const filtradas = recompensas.filter((r) => {
    if (categoria !== "todas" && r.categoria !== categoria) return false;
    if (status === "ativos" && !r.ativa) return false;
    if (status === "pausados" && r.ativa) return false;
    if (busca.trim()) {
      const alvo = `${r.titulo} ${r.descricao ?? ""}`.toLowerCase();
      if (!alvo.includes(busca.trim().toLowerCase())) return false;
    }
    return true;
  });

  const temFiltro = busca.trim() !== "" || categoria !== "todas" || status !== "todos";

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6" id="form-recompensa">
        <h2 className="text-lg font-semibold text-foreground">
          {editando ? "Editar recompensa" : "Adicionar recompensa"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {editando
            ? "As alteracoes valem para o catalogo exibido na pagina de Recompensas do app."
            : "A recompensa entra no catalogo e aparece na pagina de Recompensas do app."}
        </p>

        <form onSubmit={enviar} className="mt-5 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rec-titulo">Titulo</Label>
              <Input
                id="rec-titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Cupom 15% Off"
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rec-descricao">Descricao</Label>
              <textarea
                id="rec-descricao"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
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
                value={form.custo_pontos}
                onChange={(e) => setForm((f) => ({ ...f, custo_pontos: e.target.value }))}
                placeholder="150"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-categoria">Categoria</Label>
              <Select
                id="rec-categoria"
                value={form.categoria}
                onChange={(e) =>
                  setForm((f) => ({
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
                value={form.icone}
                onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value }))}
                placeholder="10"
                maxLength={8}
              />
            </div>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {erro}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              className="h-11 gap-2 font-semibold"
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Salvando...
                </>
              ) : editando ? (
                <>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Salvar alteracoes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" aria-hidden />
                  Adicionar recompensa
                </>
              )}
            </Button>
            {editando && (
              <Button type="button" variant="secondary" className="h-11" onClick={pararEdicao}>
                Cancelar edicao
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Catalogo</h2>
            <Badge variant="default">
              {filtradas.length}
              {filtradas.length !== recompensas.length ? ` de ${recompensas.length}` : ""}
            </Badge>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            onClick={() => void recarregar()}
            disabled={carregando}
          >
            {carregando ? "Carregando..." : "Atualizar"}
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar recompensa"
              aria-label="Buscar recompensa"
              className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-label="Filtrar por categoria"
            className="h-11 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="todas">Todas categorias</option>
            {CATEGORIAS_RECOMPENSA.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            aria-label="Filtrar por situacao"
            className="h-11 rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {OPCOES_STATUS_RECOMPENSA.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {temFiltro && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() => {
                setBusca("");
                setCategoria("todas");
                setStatus("todos");
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {carregando && recompensas.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground animate-pulse">Carregando catalogo...</p>
        ) : filtradas.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {recompensas.length === 0
              ? "Nenhuma recompensa no catalogo ainda."
              : "Nenhuma recompensa corresponde aos filtros."}
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {filtradas.map((recompensa) => (
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
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11 gap-2"
                    onClick={() => iniciarEdicao(recompensa)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11"
                    onClick={() => void alternar(recompensa)}
                  >
                    {recompensa.ativa ? "Pausar" : "Reativar"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 gap-2 text-destructive hover:text-destructive"
                    onClick={() => setExcluindoId(recompensa.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AlertDialog
        open={excluindoId !== null}
        onOpenChange={(open) => {
          if (!open && !excluindo) setExcluindoId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover do catalogo?</AlertDialogTitle>
            <AlertDialogDescription>
              {recompensas.find((r) => r.id === excluindoId)?.titulo
                ? `"${recompensas.find((r) => r.id === excluindoId)?.titulo}" sai do catalogo
                   exibido no app e fica marcada como pausada neste painel. Resgates ja feitos
                   continuam no historico.`
                : "A recompensa sai do catalogo exibido no app e fica marcada como pausada neste painel. Resgates ja feitos continuam no historico."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmarExclusao()}
            >
              {excluindo ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
