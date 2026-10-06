export interface TagAdmin {
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

export interface User {
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

export interface UsuarioDetalhe {
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
  co2_kg: number;
  water_liters: number;
  kg_reciclado: number;
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

export interface RecompensaAdmin {
  id: number;
  titulo: string;
  descricao: string | null;
  custo_pontos: number;
  categoria: "desconto" | "parceiro" | "doacao";
  icone: string | null;
  ativa: boolean;
  criado_em?: string;
}

export type AbaAdmin = "visao" | "usuarios" | "recompensas" | "configuracoes";

/** Configuracao global do site (chave/valor gravada em site_config). */
export interface SiteConfig {
  link_votacao: string;
}

export interface Stats {
  total_usuarios: number;
  total_tags_validadas: number;
  total_pontos: number;
  por_sexo: { masculino: number; feminino: number; outro: number; nao_informado: number };
  por_faixa_etaria: {
    "18-25": number;
    "26-35": number;
    "36-45": number;
    "46-55": number;
    "56+": number;
  };
}

export interface ChartData {
  name?: string;
  value?: number;
  faixa?: string;
  total?: number;
}

export interface TagResult {
  valid: boolean;
  message?: string;
  tag?: { codigo_nfc?: string; status?: string };
  reciclagens_validadas?: number;
}

export interface AdminFilters {
  sexo: string;
  idadeMin: string;
  idadeMax: string;
}

export interface UsersPage {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface RecompensaForm {
  titulo: string;
  descricao: string;
  custo_pontos: string;
  categoria: RecompensaAdmin["categoria"];
  icone: string;
}

export interface AdminForm {
  nome: string;
  email: string;
  senha: string;
}
