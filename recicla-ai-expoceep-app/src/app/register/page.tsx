"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { animate } from "animejs";
import { Users, Minus, Plus } from "lucide-react";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sexo, setSexo] = useState("");
  const [idade, setIdade] = useState("");
  const [householdSize, setHouseholdSize] = useState(1);
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState("");
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
      cpf || undefined,
      sexo || undefined,
      idade ? parseInt(idade) : undefined
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const presets = [1, 2, 3, 4, 5];

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
      <Card ref={cardRef} className="w-full max-w-sm p-8 opacity-0">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Recicla Ai
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider">
              Nome
            </Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf" className="text-xs font-semibold uppercase tracking-wider">
              CPF
            </Label>
            <Input
              id="cpf"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sexo" className="text-xs font-semibold uppercase tracking-wider">
              Sexo
            </Label>
            <select
              id="sexo"
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            >
              <option value="">Nao informar</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idade" className="text-xs font-semibold uppercase tracking-wider">
              Idade
            </Label>
            <Input
              id="idade"
              type="number"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              placeholder="Sua idade"
              min="1"
              max="120"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha"
              required
            />
          </div>

          {/* Household size */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Quantas pessoas moram com você?
              </span>
            </Label>

            <div className="flex gap-2">
              {presets.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setHouseholdSize(n); setShowCustom(false); }}
                  className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                    householdSize === n && !showCustom
                      ? "bg-success text-success-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                  showCustom
                    ? "bg-success text-success-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                6+
              </button>
            </div>

            {showCustom && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                  className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={householdSize}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 1) setHouseholdSize(v);
                  }}
                  className="h-8 w-20 text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() => setHouseholdSize(householdSize + 1)}
                  className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              Usado para estimar seu impacto ambiental
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
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
