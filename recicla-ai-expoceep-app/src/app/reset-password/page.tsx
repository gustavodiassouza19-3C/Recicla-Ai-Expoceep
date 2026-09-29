"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PASSWORD_MIN_LENGTH,
  PasswordStrength,
} from "@/components/ui/password-strength";
import { animate } from "animejs";
import { toast } from "sonner";
import { CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";

type Status = "verificando" | "pronto" | "invalido";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>("verificando");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();

  // Callback ref, e nao useEffect com []: o card do formulario so existe depois
  // que a checagem do link resolve, entao um efeito de mount rodaria com
  // cardRef.current === null e a classe opacity-0 ficaria presa para sempre.
  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    animate(node, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      ease: "outExpo",
    });
  }, []);

  // O link de recuperacao chega com ?code=..., que o cliente do Supabase troca
  // por uma sessao de recovery sozinho (detectSessionInUrl). Se o link expirou,
  // o Supabase redireciona com ?error=...&error_code=otp_expired.
  // Nao usamos useSearchParams para nao obrigar a pagina inteira a Suspense.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;

    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    const errorCode = params.get("error_code");
    if (urlError || errorCode === "otp_expired" || errorCode === "access_denied") {
      setStatus("invalido");
      return;
    }

    const marcarPronto = () => {
      if (!cancelled) setStatus("pronto");
    };

    // getSession() so resolve depois que a deteccao da URL termina: se o code
    // era valido, devolve a sessao de recovery; se nao era, devolve null.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        marcarPronto();
      } else {
        // Rede lenta pode falhar o getSession sem ser link invalido; da uma
        // segunda chance antes de fechar a pagina como invalida.
        timer = setTimeout(() => {
          supabase.auth.getSession().then(({ data: retry }) => {
            if (cancelled) return;
            setStatus(retry.session ? "pronto" : "invalido");
          });
        }, 1500);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") marcarPronto();
    });
    unsubscribe = () => data.subscription.unsubscribe();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`A senha precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // A sessao de recovery foi concedida pelo link do email e so vale para
    // trocar a senha; apos isso, encerramos para o proximo login com a senha
    // nova comecar de um estado limpo.
    await supabase.auth.signOut();
    setSalvo(true);
    toast.success("Senha alterada com sucesso!");
  };

  if (status === "verificando") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
        <Card shape="rounded" className="w-full max-w-sm p-8 text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-success/30 border-t-success"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Validando link de recuperação...
          </p>
        </Card>
      </div>
    );
  }

  if (status === "invalido") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
        <Card shape="rounded" className="w-full max-w-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Link inválido ou expirado
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            O link de recuperação já foi usado ou expirou. Peça um novo para
            redefinir sua senha.
          </p>
          <div className="mt-6 space-y-2">
            <Button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="h-11 w-full font-semibold"
            >
              Pedir novo link
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/login")}
              className="h-11 w-full font-semibold"
            >
              Voltar para entrar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (salvo) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
        <Card shape="rounded" className="w-full max-w-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Senha atualizada
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sua senha foi alterada com sucesso. Entre com a nova senha para
            continuar.
          </p>
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 h-11 w-full font-semibold"
          >
            Entrar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
      <Card ref={cardRef} shape="rounded" className="w-full max-w-sm p-8 opacity-0">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <KeyRound className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Nova senha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha uma senha para acessar sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`No minimo ${PASSWORD_MIN_LENGTH} caracteres`}
              aria-describedby={error ? "reset-error" : undefined}
              required
            />
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <PasswordInput
              id="confirm-password"
              name="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita sua senha"
              aria-invalid={
                confirmPassword.length > 0 && confirmPassword !== password
              }
              aria-describedby={error ? "reset-error" : undefined}
              required
            />
          </div>

          {error && (
            <p
              id="reset-error"
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground hover:underline"
          >
            Voltar para entrar
          </Link>
        </div>
      </Card>
    </div>
  );
}
