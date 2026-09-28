"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PASSWORD_MIN_LENGTH,
  PasswordStrength,
} from "@/components/ui/password-strength";
import { animate } from "animejs";
import { Users, Minus, Plus, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sexo, setSexo] = useState("");
  const [idade, setIdade] = useState("");
  const [householdSize, setHouseholdSize] = useState(1);
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`A senha precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }

    if (householdSize < 1) {
      setError("Informe pelo menos 1 pessoa na residência.");
      return;
    }

    setLoading(true);

    const result = await register(
      nome,
      email,
      password,
      householdSize,
      sexo || undefined,
      idade ? parseInt(idade) : undefined
    );

    if (result.emailConfirmationRequired) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const presets = [1, 2, 3, 4, 5];

  if (confirmationSent) {
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
            Enviamos um email de confirmação para{" "}
            <strong className="font-semibold text-foreground">{email}</strong>.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            O email é enviado pelo <strong className="font-semibold text-foreground">Supabase Auth</strong>, usando o remetente padrão do Supabase.
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Recicla Ai
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="name"
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              id="sexo"
              name="sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
            >
              <option value="">Nao informar</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade">Idade</Label>
            <Input
              id="idade"
              name="idade"
              type="number"
              inputMode="numeric"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              placeholder="Sua idade"
              min={1}
              max={120}
            />
          </div>

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
              aria-describedby={error ? "register-error" : undefined}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`No minimo ${PASSWORD_MIN_LENGTH} caracteres`}
              aria-describedby={error ? "register-error" : undefined}
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
              aria-invalid={confirmPassword.length > 0 && confirmPassword !== password}
              aria-describedby={error ? "register-error" : undefined}
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Quantas pessoas moram com você?
              </span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              {presets.map((n) => {
                const selected = householdSize === n && !showCustom;

                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} pessoas`}
                    aria-pressed={selected}
                    onClick={() => {
                      setHouseholdSize(n);
                      setShowCustom(false);
                    }}
                    className={`h-11 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 ${
                      selected
                        ? "border-success bg-success text-success-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-success/40 hover:bg-success/5 hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                type="button"
                aria-label="6 ou mais pessoas"
                aria-pressed={showCustom}
                onClick={() => {
                  setHouseholdSize(Math.max(householdSize, 6));
                  setShowCustom(true);
                }}
                className={`h-11 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 ${
                  showCustom
                    ? "border-success bg-success text-success-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-success/40 hover:bg-success/5 hover:text-foreground"
                }`}
              >
                6+
              </button>
            </div>

            {showCustom && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-2">
                <button
                  type="button"
                  aria-label="Diminuir número de pessoas"
                  onClick={() => setHouseholdSize(Math.max(6, householdSize - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <Input
                  type="number"
                  inputMode="numeric"
                  aria-label="Número de pessoas"
                  min={6}
                  step={1}
                  value={householdSize}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 6) setHouseholdSize(v);
                  }}
                  className="h-11 w-20 text-center"
                />
                <button
                  type="button"
                  aria-label="Aumentar número de pessoas"
                  onClick={() => setHouseholdSize(householdSize + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Usado para estimar seu impacto ambiental
            </p>
          </div>

          {error && (
            <p
              id="register-error"
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ja tem conta?{" "}
          <Link href="/login" className="text-foreground hover:underline font-semibold">
            Entre
          </Link>
        </p>
      </Card>
    </div>
  );
}
