"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, LogOut, Save, Loader2, Palette } from "lucide-react";
import { useVisualStyle } from "@/hooks/use-visual-style";

export default function ProfilePage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [criadoEm, setCriadoEm] = useState("");
  const [pontos, setPontos] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { style: visualStyle, toggleStyle } = useVisualStyle();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setNome(data.nome || "");
          setCpf(data.cpf || "");
          setEmail(data.email || "");
          setTipo(data.tipo || "");
          setCriadoEm(data.criado_em || "");
          setPontos(data.pontos || 0);
        }
      } catch {
        setNome(user.nome || "");
        setEmail(user.email || "");
        setCpf(user.cpf || "");
      }
    };

    fetchProfile();
  }, [user, token]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, cpf }),
      });

      if (res.ok) {
        const data = await res.json();
        setNome(data.nome);
        setCpf(data.cpf);
        setPontos(data.pontos);
        setSuccess("Perfil atualizado com sucesso!");
        setIsEditing(false);

        const storedUser = localStorage.getItem("supabase_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.nome = data.nome;
          parsed.cpf = data.cpf;
          localStorage.setItem("supabase_user", JSON.stringify(parsed));
        }
      } else {
        setError("Erro ao atualizar perfil");
      }
    } catch {
      setError("Erro ao conectar com o servidor");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
          )}
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Dados Pessoais
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              {isEditing ? (
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-foreground mt-1">{nome || "—"}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm text-foreground mt-1">{email || "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nao e possivel alterar
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">CPF</Label>
              {isEditing ? (
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-foreground mt-1">{cpf || "—"}</p>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <p className="text-sm text-foreground mt-1">{tipo || "—"}</p>
              </div>
              <div className="text-right">
                <Label className="text-xs text-muted-foreground">Pontos</Label>
                <p className="text-sm font-bold text-foreground mt-1">
                  {pontos}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Membro desde
              </Label>
              <p className="text-sm text-foreground mt-1">
                {formatDate(criadoEm)}
              </p>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  setSuccess("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Salvar
              </Button>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-success mt-2">{success}</p>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Configuracoes
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Visual</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleStyle}
              >
                {visualStyle === "retro" ? "Retro" : "Moderno"}
              </Button>
            </div>

            <Separator />

            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
