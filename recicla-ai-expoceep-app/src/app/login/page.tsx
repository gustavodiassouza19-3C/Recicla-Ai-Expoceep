"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SplashScreen } from "@/components/splash-screen";
import { animate } from "animejs";

function LeafIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
      <circle cx="24" cy="24" r="23" fill="var(--success)" fillOpacity={0.08} stroke="var(--success)" strokeWidth="1.5" strokeOpacity={0.2} />
      <path
        d="M24 36C24 36 14 30 14 20C14 14 18 10 24 12C24 12 24 8 24 8"
        stroke="var(--success)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 28C24 28 34 22 34 14C34 8 30 6 24 8"
        stroke="var(--success)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 36V22"
        stroke="var(--success)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 36C18 36 20 33 24 33C28 33 30 36 30 36"
        stroke="var(--success)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { login } = useAuth();
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
    setLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoggedIn(true);
  };

  if (loggedIn) {
    return <SplashScreen onComplete={() => router.push("/dashboard")} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-success/[0.03] to-transparent">
      <Card ref={cardRef} className="w-full max-w-sm p-8 opacity-0">
        <div className="text-center">
          <LeafIcon />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Recicla Ai
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Recicle, acumule pontos, transforme.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              placeholder="Sua senha"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Nao tem conta?{" "}
            <Link href="/register" className="text-foreground hover:underline font-semibold">
              Cadastre-se
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/como-funciona" className="text-success hover:underline font-semibold">
              Como funciona?
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
