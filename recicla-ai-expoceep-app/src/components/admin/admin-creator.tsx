"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdmin } from "./api";
import type { AdminForm } from "./types";

const FORM_VAZIO: AdminForm = { nome: "", email: "", senha: "" };

interface AdminCreatorProps {
  total: number;
  /** Recarrega a lista de usuarios apos a criacao. */
  onCriado: () => void;
}

/** Cabecalho da aba Usuarios + criacao de conta admin, isolada num bloco so. */
export function AdminCreator({ total, onCriado }: AdminCreatorProps) {
  const [aberto, setAberto] = useState(false);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<AdminForm>(FORM_VAZIO);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState<{ nome: string; email: string } | null>(null);

  const fechar = () => {
    setAberto(false);
    setCriado(null);
    setErro("");
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCriado(null);

    if (form.nome.trim().length < 3) {
      setErro("Informe o nome completo do administrador.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setErro("Informe um e-mail valido.");
      return;
    }
    if (form.senha.length < 8) {
      setErro("A senha precisa ter ao menos 8 caracteres.");
      return;
    }

    setCriando(true);
    try {
      const novo = await createAdmin(form);
      setCriado(novo);
      setForm(FORM_VAZIO);
      onCriado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro de conexao com o servidor");
    } finally {
      setCriando(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
          <Badge variant="default">{total}</Badge>
        </div>
        <Button
          variant="default"
          onClick={() => (aberto ? fechar() : setAberto(true))}
          aria-expanded={aberto}
          className="min-h-11 w-full gap-2 bg-success text-success-foreground sm:w-auto"
        >
          {aberto ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <UserPlus className="h-4 w-4" aria-hidden />
          )}
          {aberto ? "Fechar" : "Criar novo admin"}
        </Button>
      </div>

      {(criado || erro) && aberto && (
        <div className="mt-3">
          {criado ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
              <span className="text-sm font-semibold text-success">
                {criado.nome} agora e administrador
              </span>
              <span className="text-xs text-muted-foreground">
                {criado.email} — ja pode entrar com a senha definida
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
              <span className="text-sm text-destructive">{erro}</span>
            </div>
          )}
        </div>
      )}

      {aberto && !criado && (
        <form onSubmit={enviar} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="admin-nome" className="text-xs font-semibold text-muted-foreground">
              Nome completo
            </Label>
            <Input
              id="admin-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Maria Souza"
              autoComplete="off"
              className="h-11 rounded-xl text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-xs font-semibold text-muted-foreground">
              E-mail
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="maria@empresa.com"
              autoComplete="off"
              inputMode="email"
              className="h-11 rounded-xl text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-senha" className="text-xs font-semibold text-muted-foreground">
              Senha provisoria
            </Label>
            <Input
              id="admin-senha"
              type="password"
              value={form.senha}
              onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
              placeholder="Minimo de 8 caracteres"
              autoComplete="new-password"
              className="h-11 rounded-xl text-base"
            />
          </div>
          <div className="sm:col-span-3">
            <Button
              type="submit"
              disabled={criando}
              className="min-h-11 w-full gap-2 bg-success text-success-foreground sm:w-auto"
            >
              {criando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden />
                  Criar administrador
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
