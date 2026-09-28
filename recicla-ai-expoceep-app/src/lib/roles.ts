export const TIPOS_ADMIN = ["admin", "administrador"] as const;

export function isAdminTipo(tipo?: string | null): boolean {
  return !!tipo && (TIPOS_ADMIN as readonly string[]).includes(tipo);
}
