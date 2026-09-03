export type LacreStatus = "EM_USO" | "VALIDADO" | "PONTUADO" | "ASSOCIADO";

export interface Lacre {
  id: string;
  codigo: string;
  status: LacreStatus;
  pontos: number;
  cooperativa?: string;
  dataAssociacao: string;
  dataValidacao?: string;
  dataPontuacao?: string;
}

export interface DashboardMetrics {
  saldoPontos: number;
  sacolasValidadas: number;
  impactoCO2: number; // em kg
}

export interface Usuario {
  nome: string;
  email: string;
  avatar?: string;
}

export const LACRE_STATUS_LABELS: Record<LacreStatus, string> = {
  EM_USO: "Em Uso",
  VALIDADO: "Validado",
  PONTUADO: "Pontuado",
  ASSOCIADO: "Associado",
};

export const LACRE_STATUS_VARIANTS: Record<LacreStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  EM_USO: "warning",
  VALIDADO: "success",
  PONTUADO: "default",
  ASSOCIADO: "secondary",
};