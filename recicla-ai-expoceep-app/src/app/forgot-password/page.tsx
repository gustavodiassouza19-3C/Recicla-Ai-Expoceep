"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { animate } from "animejs";
import { MailCheck, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const { requestResetPassword } = useAuth();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Informe o email da sua conta.");
      return;
    }

    setLoading(true);
    const result = await requestResetPassword(email.trim());
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
        <Card shape="rounded" className="w-full max-w-sm p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <MailCheck className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Confira seu email
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Se <strong className="font-semibold text-foreground">{email}</strong>{" "}
            tiver uma conta na Recicla Ai, enviamos um link para redefinir sua
            senha.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            O link expira em pouco tempo. Se nao chegar, confira a caixa de spam
            ou tente novamente.
          </p>
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 h-11 w-full font-semibold"
          >
            Voltar para entrar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
      <Card ref={cardRef} shape="rounded" className="w-full max-w-sm p-8 opacity-0">
        <div className="text-center mb-6">
          <Image
            src="/images/logo.jpeg"
            alt="Recicla Ai"
            width={1024}
            height={1536}
            className="mx-auto mb-4 h-12 w-auto"
          />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Recuperar senha
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Digite seu email e enviaremos o link de redefinicao.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              aria-describedby={error ? "forgot-error" : undefined}
              required
            />
          </div>

          {error && (
            <p
              id="forgot-error"
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Voltar para entrar
          </Link>
        </div>
      </Card>
    </div>
  );
}
