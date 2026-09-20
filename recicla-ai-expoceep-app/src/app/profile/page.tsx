"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Sun, Moon, LogOut, Save, Loader2, Users, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, token, loading: authLoading, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [criadoEm, setCriadoEm] = useState("");
  const [pontos, setPontos] = useState(0);
  const [householdSize, setHouseholdSize] = useState(1);
  const [showCustomHousehold, setShowCustomHousehold] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setEmail(user.email || "");
      setHouseholdSize(user.household_size || 1);
    }
  }, [user]);

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
          setEmail(data.email || "");
          setTipo(data.tipo || "");
          setCriadoEm(data.criado_em || "");
          setPontos(data.pontos || 0);
        }
      } catch {
        // fallback to auth data
      }
    };

    fetchProfile();
  }, [user, token]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update household_size in Supabase
      if (user?.usuario_id) {
        const { error: updateError } = await supabase
          .from("usuarios")
          .update({ household_size: householdSize })
          .eq("id", user.usuario_id);

        if (updateError) {
          setError("Erro ao atualizar residência.");
          setSaving(false);
          return;
        }

        // Refresh user data in context
        await refreshUser();
      }

      // Update nome via API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        const data = await res.json();
        setNome(data.nome);
        setSuccess("Perfil atualizado com sucesso!");
        setIsEditing(false);

        const storedUser = localStorage.getItem("supabase_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.nome = data.nome;
          parsed.household_size = householdSize;
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

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
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

  const presets = [1, 2, 3, 4, 5];

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="border rounded-2xl bg-card border-border p-6 shadow-lg max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{isEditing ? "Editar Perfil" : "Meu Perfil"}</h1>
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

          {isEditing ? (
            <Card className="p-6 space-y-4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="space-y-3">
                  <div>
                    <Label className="block text-sm font-medium mb-1.5">Nome</Label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="rounded-xl border-input bg-input p-3.5 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-inset"
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-1.5">Email</Label>
                    <Input
                      disabled
                      value={email}
                      placeholder="seu@email.com"
                      className="rounded-xl border-input bg-input p-3.5 text-lg transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Não é possível alterar
                    </p>
                  </div>

                  {/* Household size */}
                  <div>
                    <Label className="block text-sm font-medium mb-1.5">
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
                          onClick={() => { setHouseholdSize(n); setShowCustomHousehold(false); }}
                          className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                            householdSize === n && !showCustomHousehold
                              ? "bg-success text-success-foreground shadow-sm"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowCustomHousehold(true)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                          showCustomHousehold
                            ? "bg-success text-success-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        6+
                      </button>
                    </div>

                    {showCustomHousehold && (
                      <div className="flex items-center gap-2 mt-2">
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
                        <span className="text-xs text-muted-foreground">pessoas</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 px-4 rounded-xl font-medium transition-all hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              </form>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              {success && (
                <p className="text-sm text-success">✓ {success}</p>
              )}
            </Card>
          ) : (
            <Card className="p-6 pt-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 rounded-xl bg-primary/10 text-primary" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">{nome || "—"}</h2>
                    <p className="text-sm text-muted-foreground">Membro desde {formatDate(criadoEm)}</p>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="capitalize text-sm text-muted-foreground">Tipo de conta</Label>
                    <p className="text-sm text-foreground">{tipo || "—"}</p>
                  </div>

                  <div>
                    <Label className="capitalize text-sm text-muted-foreground">Pontos</Label>
                    <p className="text-sm font-bold text-foreground">{pontos} pts</p>
                  </div>
                </dl>

                <Separator />

                {/* Household info */}
                <Card className="p-4 rounded-xl border-border/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-4 w-4 text-success" />
                    <h3 className="text-sm font-medium">Residência</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {householdSize} {householdSize === 1 ? "pessoa" : "pessoas"} morando na residência
                  </p>
                </Card>

                <Separator />

                <Card className="p-4 rounded-xl border-border/20">
                  <h3 className="capitalize text-sm font-medium mb-3">Configurações</h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isDark ? (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Sun className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-foreground">Tema</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="px-3 rounded-full py-1.5 text-xs transition-colors"
                      >
                        {isDark ? "Escuro" : "Claro"}
                      </Button>
                    </div>

                    <Separator />

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={logout}
                      className="w-full py-3 rounded-xl font-medium transition-all hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair da conta
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
