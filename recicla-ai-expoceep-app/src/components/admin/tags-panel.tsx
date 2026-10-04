"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Nfc,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { validateTag } from "./api";
import { OPCOES_FILTRO_TAG, SITUACAO } from "./constants";
import type { TagAdmin, TagResult } from "./types";

interface TagsPanelProps {
  tags: TagAdmin[];
  loading: boolean;
  token: string | null;
  /** Chamado quando uma validacao passa: o shell recarrega stats, usuarios e tags. */
  onValidado: () => void;
}

export function TagsPanel({ tags, loading, token, onValidado }: TagsPanelProps) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "aguardando" | "validada">("todas");
  const [selecionadaId, setSelecionadaId] = useState<number | null>(null);
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState<TagResult | null>(null);

  const filtradas = tags.filter((t) => {
    if (filtro === "aguardando" && t.situacao !== "aguardando") return false;
    if (filtro === "validada" && t.situacao === "aguardando") return false;
    if (busca.trim() && !t.codigo_nfc.toLowerCase().includes(busca.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  const selecionada = tags.find((t) => t.id === selecionadaId) ?? null;
  const totalAguardando = tags.filter((t) => t.situacao === "aguardando").length;

  const validar = async (codigo: string) => {
    if (!codigo.trim()) return;
    setValidando(true);
    setResultado(null);
    try {
      const data = await validateTag(codigo, token);
      setResultado(data);
      if (data.valid) onValidado();
    } catch {
      setResultado({ valid: false, message: "Erro ao validar tag" });
    } finally {
      setValidando(false);
    }
  };

  return (
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
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar codigo NFC"
            aria-label="Buscar codigo NFC"
            className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {OPCOES_FILTRO_TAG.map((f) => (
            <Button
              key={f.key}
              variant={filtro === f.key ? "default" : "secondary"}
              size="sm"
              onClick={() => setFiltro(f.key)}
              className={`min-h-11 flex-1 sm:flex-none ${
                filtro === f.key ? "bg-success text-success-foreground" : ""
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm animate-pulse">Carregando tags...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma tag encontrada</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((tag) => {
            const situacao = SITUACAO[tag.situacao];
            const selecionadaAtual = selecionada?.id === tag.id;
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelecionadaId(tag.id);
                    setResultado(null);
                  }}
                  aria-pressed={selecionadaAtual}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selecionadaAtual
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

      {selecionada && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-base font-bold text-foreground">
                {selecionada.codigo_nfc}
              </p>
              <p className="text-xs text-muted-foreground">Estado da tag: {selecionada.status}</p>
            </div>
            <Badge variant={SITUACAO[selecionada.situacao].variant}>
              {SITUACAO[selecionada.situacao].label}
            </Badge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Pessoas", value: selecionada.pessoas, icon: Users },
              { label: "Usos totais", value: selecionada.total_usos, icon: RotateCcw },
              { label: "Validacoes", value: selecionada.validacoes, icon: CheckCircle2 },
              { label: "Aguardando", value: selecionada.pendentes, icon: Clock },
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
            {selecionada.ultima_utilizacao ? (
              <>
                Ultimo uso em{" "}
                {new Date(selecionada.ultima_utilizacao).toLocaleDateString("pt-BR")}
                {selecionada.ultimo_usuario ? ` por ${selecionada.ultimo_usuario}` : ""}.
              </>
            ) : (
              "Esta tag ainda nao foi usada por ninguem."
            )}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="default"
              onClick={() => void validar(selecionada.codigo_nfc)}
              disabled={validando || !selecionada.pode_validar}
              className="min-h-11 bg-success text-success-foreground"
            >
              {validando
                ? "Validando..."
                : selecionada.pode_validar
                  ? "Validar e Liberar"
                  : "Nada pendente"}
            </Button>
            <Button variant="ghost" onClick={() => setSelecionadaId(null)} className="min-h-11">
              Fechar
            </Button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="mt-4">
          {resultado.valid ? (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
              <span className="text-success font-bold text-sm">
                {resultado.message || "Tag validada e liberada"}
              </span>
              {resultado.tag?.codigo_nfc && (
                <Badge variant="success">{resultado.tag.codigo_nfc}</Badge>
              )}
              {typeof resultado.reciclagens_validadas === "number" && (
                <span className="text-xs text-muted-foreground">
                  Reciclagens confirmadas: {resultado.reciclagens_validadas}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <span className="text-destructive font-bold text-sm">
                {resultado.message || "Tag invalida"}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
