"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { animate } from "animejs";
import { CheckCircle2, ShieldAlert } from "lucide-react";

type Status = "verificando" | "confirmado" | "invalido";

/**
 * Le query string e hash juntos: o Supabase pode entregar as credenciais em
 * `?code=`/`?error=` (query) ou `#access_token=...` (hash, fluxo implicito).
 * parseParametersFromURL do proprio auth-js faz a mesma fusao.
 */
function parseCallbackParams(): URLSearchParams {
  const { search, hash } = window.location;
  const query = search.startsWith("?") ? search.slice(1) : search;
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(`${query}&${fragment}`);
}

/**
 * Tela especial exibida quando o usuario clica no link de confirmacao de
 * cadastro do email. Informa o sucesso e leva para o login.
 *
 * A rota e publica (auth-guard) porque o visitante chega aqui deslogado, de
 * um email, possivelmente em outro navegador.
 */
export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<Status>("verificando");
  const router = useRouter();

  // Callback ref: o card de sucesso so monta depois que a checagem do link
  // resolve, entao um useEffect de mount rodaria com cardRef.current === null
  // e a classe opacity-0 ficaria presa para sempre.
  const cardRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    animate(node, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      ease: "outExpo",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (next: Status) => {
      if (!cancelled) setStatus(next);
    };

    // Toda a leitura da URL roda em um microtask: chamar setState sincrono no
    // corpo do effect viola a regra react-hooks/set-state-in-effect.
    queueMicrotask(() => {
      const params = parseCallbackParams();
      const urlError = params.get("error");
      const errorCode = params.get("error_code");
      const tokenHash = params.get("token_hash");
      const otpType = params.get("type");
      const hasCode = Boolean(params.get("code"));
      const hasImplicitToken = Boolean(params.get("access_token"));

      // O Supabase sinaliza falha de verificacao (link expirado ou revogado)
      // com ?error=...&error_code=..., antes de qualquer credencial.
      if (urlError || errorCode === "otp_expired" || errorCode === "access_denied") {
        finish("invalido");
        return;
      }

      // Alguns templates de email entregam ?token_hash=&type= em vez de
      // credenciais na URL. A verificacao por aqui e uma chamada direta e
      // funciona em qualquer navegador.
      if (tokenHash) {
        supabase.auth
          .verifyOtp({
            token_hash: tokenHash,
            type: (otpType || "signup") as EmailOtpType,
          })
          .then(({ error }) => finish(error ? "invalido" : "confirmado"));
        return;
      }

      // Visita direta a rota, sem credenciais: nao ha link para confirmar.
      if (!hasCode && !hasImplicitToken) {
        finish("invalido");
        return;
      }

      // Credenciais so existem depois que a verificacao passou la no Supabase.
      // O cliente troca por sessao sozinho (detectSessionInUrl). Se a sessao
      // nao aparecer (rede lenta, outro navegador), o email mesmo assim esta
      // confirmado — a tela de sucesso manda o usuario pro login, e la ele
      // entra com email e senha normalmente.
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        if (data.session) {
          finish("confirmado");
          return;
        }
        // Rede lenta pode resolver a troca da URL um pouco depois: espera uma
        // segunda chance antes de fechar a espera.
        timer = setTimeout(() => finish("confirmado"), 1500);
      });
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (status === "verificando") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
        <Card shape="rounded" className="w-full max-w-sm p-8 text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-success/30 border-t-success"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Confirmando seu email...
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
            Este link já foi usado ou expirou. Entre na sua conta para continuar.
          </p>
          <div className="mt-6 space-y-2">
            <Button
              type="button"
              onClick={() => router.push("/login")}
              className="h-11 w-full font-semibold"
            >
              Ir para o login
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/")}
              className="h-11 w-full font-semibold"
            >
              Voltar para o início
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
      <Card ref={cardRef} shape="rounded" className="w-full max-w-sm p-8 text-center opacity-0">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email confirmado!
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Tudo certo! Sua conta foi verificada com sucesso. Entre com seu email
          e senha para começar a reciclar e ganhar recompensas.
        </p>
        <Button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 h-11 w-full font-semibold"
        >
          Ir para o login
        </Button>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground hover:underline"
          >
            Voltar para o início
          </Link>
        </div>
      </Card>
    </div>
  );
}
