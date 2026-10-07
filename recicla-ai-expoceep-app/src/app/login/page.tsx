"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SplashScreen } from "@/components/splash-screen";
import { AuthGradientBackground } from "@/components/auth/auth-gradient-background";
import { isAdminTipo } from "@/lib/roles";
import { Repeat2 } from "lucide-react";
import { animate } from "animejs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [destino, setDestino] = useState<string | null>(null);
  const [trocaDeConta, setTrocaDeConta] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        ease: "outExpo",
      });
    }
  }, []);

  // Marcado pelo "Trocar de conta" do painel admin antes do logout. A flag e
  // consumida dentro do timeout: assim o StrictMode (que monta/desmonta o
  // effect) nao apaga a marcacao antes do form estar pronto.
  useEffect(() => {
    if (window.sessionStorage.getItem("troca_de_conta") !== "1") return;
    const id = window.setTimeout(() => {
      window.sessionStorage.removeItem("troca_de_conta");
      setTrocaDeConta(true);
      emailRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setDestino(isAdminTipo(result.tipo) ? "/admin-dashboard" : "/dashboard");
    setLoading(false);
  };

  if (destino) {
    return <SplashScreen onComplete={() => router.push(destino)} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-success/[0.03] to-transparent p-4">
      <div
        ref={cardRef}
        className="retro-border-card retro-shadow-lg retro-radius grid w-full max-w-4xl overflow-hidden bg-card opacity-0 lg:grid-cols-2"
      >
        <div className="p-6 sm:p-10">
          <div className="text-center">
            <Image
              src="/images/logo.webp"
              alt="Recicla Ai"
              width={640}
              height={982}
              className="mx-auto mb-4 h-12 w-auto"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Recicla Ai
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Recicle, acumule pontos, transforme.
            </p>
          </div>

          {trocaDeConta && (
            <p
              role="status"
              className="mt-6 flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-success"
            >
              <Repeat2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Sessao encerrada. Entre com outro e-mail para trocar de conta.
            </p>
          )}

          <form onSubmit={handleSubmit} className={`${trocaDeConta ? "mt-4" : "mt-8"} space-y-4`} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                ref={emailRef}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                aria-describedby={error ? "login-error" : undefined}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                aria-describedby={error ? "login-error" : undefined}
                required
              />
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-success hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-1 text-center space-y-0.5">
            <p className="text-sm text-muted-foreground">
              Nao tem conta?{" "}
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center text-foreground hover:underline font-semibold"
              >
                Cadastre-se
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center text-success hover:underline font-semibold"
              >
                Como funciona?
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden flex-col items-center justify-center gap-6 overflow-hidden bg-auth-panel p-10 lg:flex lg:border-l lg:border-auth-panel-border">
          <AuthGradientBackground />
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <Image
              src="/images/logo.webp"
              alt=""
              width={640}
              height={982}
              className="h-40 w-auto"
            />
            <p className="max-w-[22ch] text-balance text-lg font-medium leading-snug tracking-tight text-auth-panel-foreground">
              O que você descarta hoje decide o que existe amanhã.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
