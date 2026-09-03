import type {
  LacreStatus,
  Role,
  RedemptionStatus,
  AuditTargetType,
} from "@/generated/prisma/client";

export type {
  LacreStatus,
  Role,
  RedemptionStatus,
  AuditTargetType,
};

export type LacreTransition = {
  from: LacreStatus;
  to: LacreStatus;
  label: string;
  description: string;
};

export const LACRE_TRANSITIONS: Record<LacreStatus, LacreStatus[]> = {
  DISPONIVEL: ["ASSOCIADO", "CANCELADO", "PERDIDO", "INVALIDO", "SUSPEITO", "DUPLICADO"],
  ASSOCIADO: ["EM_USO", "CANCELADO", "PERDIDO", "INVALIDO", "DISPONIVEL"],
  EM_USO: ["COLETADO", "PERDIDO", "CANCELADO", "INVALIDO"],
  COLETADO: ["EM_TRIAGEM", "PERDIDO", "INVALIDO"],
  EM_TRIAGEM: ["VALIDADO", "INVALIDO", "SUSPEITO", "DUPLICADO"],
  VALIDADO: ["PONTUADO", "INVALIDO"],
  PONTUADO: ["RESETADO"],
  RESETADO: ["DISPONIVEL", "CANCELADO"],
  PERDIDO: [],
  CANCELADO: ["DISPONIVEL"],
  INVALIDO: ["DISPONIVEL"],
  SUSPEITO: ["INVALIDO", "VALIDADO", "CANCELADO"],
  DUPLICADO: ["INVALIDO", "SUSPEITO"],
};

export const LACRE_STATUS_LABELS: Record<LacreStatus, string> = {
  DISPONIVEL: "Disponível",
  ASSOCIADO: "Associado",
  EM_USO: "Em Uso",
  COLETADO: "Coletado",
  EM_TRIAGEM: "Em Triagem",
  VALIDADO: "Validado",
  PONTUADO: "Pontuado",
  RESETADO: "Resetado",
  PERDIDO: "Perdido",
  CANCELADO: "Cancelado",
  INVALIDO: "Inválido",
  SUSPEITO: "Suspeito",
  DUPLICADO: "Duplicado",
};

export const LACRE_STATUS_ORDER: LacreStatus[] = [
  "DISPONIVEL",
  "ASSOCIADO",
  "EM_USO",
  "COLETADO",
  "EM_TRIAGEM",
  "VALIDADO",
  "PONTUADO",
  "RESETADO",
];

export const EXCEPTION_STATES: LacreStatus[] = [
  "PERDIDO",
  "CANCELADO",
  "INVALIDO",
  "SUSPEITO",
  "DUPLICADO",
];

export function canTransition(from: LacreStatus, to: LacreStatus): boolean {
  return LACRE_TRANSITIONS[from].includes(to);
}

export function isExceptionState(status: LacreStatus): boolean {
  return EXCEPTION_STATES.includes(status);
}

export function isTerminalState(status: LacreStatus): boolean {
  return LACRE_TRANSITIONS[status].length === 0;
}

export function getProgressPercentage(status: LacreStatus): number {
  const idx = LACRE_STATUS_ORDER.indexOf(status);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / LACRE_STATUS_ORDER.length) * 100);
}
