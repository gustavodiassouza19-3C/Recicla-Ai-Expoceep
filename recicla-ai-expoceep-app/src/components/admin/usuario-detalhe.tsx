"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Cloud,
  Droplets,
  Fingerprint,
  Home,
  Leaf,
  Mail,
  Nfc,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
  Trees,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, getEcoProgress, getInitials, getTipoLabel } from "@/lib/eco-level";
import { fetchUsuarioDetalhe } from "./api";
import { SEXO_LABELS } from "./constants";
import type { UsuarioDetalhe as UsuarioDetalheData } from "./types";

interface UsuarioDetalheProps {
  usuarioId: number;
  token: string | null;
  onFechar: () => void;
}

/** Busca o perfil so quando ha um id selecionado; desmontar limpa a requisicao. */
export function UsuarioDetalhe({ usuarioId, token, onFechar }: UsuarioDetalheProps) {
  const [detalhe, setDetalhe] = useState<UsuarioDetalheData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setCarregando(true);
      setDetalhe(null);
      try {
        const data = await fetchUsuarioDetalhe(usuarioId, token);
        if (alive) setDetalhe(data);
      } catch {
        if (alive) setDetalhe(null);
      } finally {
        if (alive) setCarregando(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [usuarioId, token]);

  if (carregando) {
    return (
      <Card className="p-6">
        <p className="py-8 text-center text-sm text-muted-foreground animate-pulse">
          Carregando perfil...
        </p>
      </Card>
    );
  }

  if (!detalhe) {
    return (
      <Card className="p-6">
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nao foi possivel carregar este perfil.
        </p>
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onFechar} className="min-h-11 gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar a lista
          </Button>
        </div>
      </Card>
    );
  }

  const ecoProgress = getEcoProgress(detalhe.pontos);

  const resumo = [
    {
      label: "Ecopontos",
      value: detalhe.pontos,
      caption: "Saldo acumulado",
      icon: Leaf,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Entregas",
      value: detalhe.entregas,
      caption: "Descartes validados",
      icon: Trophy,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Arvores",
      value: (detalhe.arvores ?? 0).toFixed(3).replace(".", ","),
      caption: "Impacto estimado",
      icon: Trees,
      tone: "bg-success/10 text-success",
    },
    {
      label: "CO2e",
      value: `${(detalhe.co2_kg ?? 0).toFixed(1).replace(".", ",")} kg`,
      caption: "Emissao evitada",
      icon: Cloud,
      tone: "bg-muted text-muted-foreground",
    },
    {
      label: "Agua",
      value: `${Math.round(detalhe.water_liters ?? 0)} L`,
      caption: "Agua economizada",
      icon: Droplets,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Tags NFC",
      value: detalhe.tags_count,
      caption: "Identificadores",
      icon: QrCode,
      tone: "bg-secondary text-secondary-foreground",
    },
  ];

  const dadosPessoais = [
    { label: "Nome Completo", value: detalhe.nome || "Nao informado", icon: User, mono: false },
    { label: "E-mail", value: detalhe.email || "-", icon: Mail, mono: true },
    { label: "Tipo de Conta", value: getTipoLabel(detalhe.tipo), icon: ShieldCheck, mono: false },
    { label: "CPF", value: detalhe.cpf || "Nao informado", icon: Fingerprint, mono: true },
    {
      label: "Sexo",
      value: detalhe.sexo
        ? SEXO_LABELS[detalhe.sexo] || detalhe.sexo
        : "Nao informado",
      icon: User,
      mono: false,
    },
    { label: "Idade", value: detalhe.idade ?? "Nao informado", icon: User, mono: false },
    { label: "ID da Matricula", value: `#${detalhe.id}`, icon: Fingerprint, mono: true },
  ];

  return (
    <>
      <Card className="p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFechar}
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
                  {getInitials(detalhe.nome)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-card flex items-center justify-center text-xs shadow-sm">
                <span>{ecoProgress.ecoLevel.icon}</span>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {detalhe.nome}
                </h2>
                <Badge variant="success" className="text-[10px] py-0.5">
                  {getTipoLabel(detalhe.tipo)}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
                <span className="truncate max-w-[220px] sm:max-w-xs font-mono">
                  {detalhe.email}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden />
                <span>
                  {detalhe.criado_em
                    ? `Membro desde ${formatDate(detalhe.criado_em)}`
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
              {detalhe.pontos} pts
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
              {ecoProgress.ecoLevel.nextThreshold ? `${ecoProgress.ecoLevel.nextThreshold} pts` : "∞"}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {resumo.map((s) => (
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
        <h3 className="text-base font-bold tracking-tight text-foreground">Dados Pessoais</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Informacoes de identificacao da conta
        </p>
        <div className="mt-4 divide-y divide-border/60">
          {dadosPessoais.map((row) => (
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
            Residencia &amp; Coleta Domiciliar
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tamanho da residencia informado no cadastro.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
          <Users className="h-4 w-4 text-success shrink-0" aria-hidden />
          <span>
            Residencia cadastrada para{" "}
            <strong>
              {detalhe.household_size}{" "}
              {detalhe.household_size === 1 ? "morador" : "moradores"}
            </strong>
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="text-base font-bold tracking-tight text-foreground">Tags NFC</h3>
          <Badge variant="default">{detalhe.tags.length}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Historico de tags registradas pelo usuario.
        </p>
        {detalhe.tags.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma tag usada ainda
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detalhe.tags.map((t) => (
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
                  <Badge variant={t.reciclagem_status === "validada" ? "success" : "warning"}>
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
          <h3 className="text-base font-bold tracking-tight text-foreground">Conquistas</h3>
          <Badge variant="default">{detalhe.conquistas.length}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Medalas conquistadas e pontos resgatados.
        </p>
        {detalhe.conquistas.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma conquista registrada
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {detalhe.conquistas.map((c) => (
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
                <span className="text-[11px] text-success tabular-nums">+{c.pontos_ganhos}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
