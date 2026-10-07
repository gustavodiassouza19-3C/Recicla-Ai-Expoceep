"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

/**
 * Porta unica de acesso do app: toda rota exige login.
 * Publicas sao a landing, as telas de autenticacao — sem estas nao existe forma de entrar. Nao ha middleware porque a sessao vive em localStorage
 * (client do Supabase) e o middleware de borda nao enxerga.
 */
const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading || isPublic || user) return;
    router.replace("/login");
  }, [loading, isPublic, user, router, pathname]);

  // Conteudo privado so renderiza quando ha sessao. Enquanto a sessao ainda
  // nao resolveu, o shell das paginas (esqueleto) aparece normalmente.
  if (!isPublic && !loading && !user) return null;

  return <>{children}</>;
}
