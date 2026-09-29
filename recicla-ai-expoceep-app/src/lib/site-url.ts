/**
 * URL publica do app, usada nos links que saem por email (recuperacao de senha
 * e confirmacao de cadastro).
 *
 * Nao usamos apenas `window.location.origin`: em dev local ele devolve
 * "http://localhost:3000", e o usuario receberia um link que so abre na maquina
 * de quem esta desenvolvendo. Aqui localhost cai no fallback
 * (NEXT_PUBLIC_SITE_URL), enquanto qualquer outro host -- producao ou preview --
 * e respeitado como esta.
 */
const FALLBACK_SITE_URL = "https://recicla-ai-expoceep.vercel.app";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (!LOCAL_HOSTNAMES.has(hostname) && origin !== "null") {
      return origin;
    }
  }

  return process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
}

/** Monta um caminho absoluto do app a partir de getSiteUrl. */
export function getSitePath(path: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
