import { Gift, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";
import type { AbaAdmin, RecompensaAdmin, TagAdmin } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Pagina cheia o bastante para caber no celular sem virar scroll infinito. */
export const LIMITE_USUARIOS = 12;

export const SITUACAO: Record<
  TagAdmin["situacao"],
  { label: string; variant: "default" | "success" | "warning" | "destructive" }
> = {
  aguardando: { label: "Aguardando", variant: "warning" },
  validada: { label: "Validada", variant: "success" },
  nunca_usada: { label: "Livre", variant: "default" },
};

export const CATEGORIAS_RECOMPENSA: {
  value: RecompensaAdmin["categoria"];
  label: string;
}[] = [
  { value: "parceiro", label: "Parceiro" },
  { value: "desconto", label: "Desconto" },
  { value: "doacao", label: "Doacao" },
];

export const COLORS = ["#4ade80", "#f472b6", "#facc15", "#94a3b8"];

export const SEXO_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  nao_informado: "Nao informado",
};

export const TABS: { key: AbaAdmin; label: string; icon: LucideIcon }[] = [
  { key: "visao", label: "Visao geral", icon: LayoutDashboard },
  { key: "usuarios", label: "Usuarios", icon: Users },
  { key: "recompensas", label: "Recompensas", icon: Gift },
  { key: "configuracoes", label: "Configuracoes", icon: Settings },
];

export const OPCOES_FILTRO_TAG = [
  { key: "todas", label: "Todas" },
  { key: "aguardando", label: "Aguardando" },
  { key: "validada", label: "Validadas" },
] as const;

export const OPCOES_STATUS_RECOMPENSA = [
  { value: "todos", label: "Todos" },
  { value: "ativos", label: "Ativas" },
  { value: "pausados", label: "Pausadas" },
] as const;

export const FORM_RECOMPENSA_VAZIO: {
  titulo: string;
  descricao: string;
  custo_pontos: string;
  categoria: RecompensaAdmin["categoria"];
  icone: string;
} = {
  titulo: "",
  descricao: "",
  custo_pontos: "",
  categoria: "parceiro",
  icone: "",
};
