"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { usePoints } from "@/contexts/points-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { fetchImpact, fetchMyTags } from "@/lib/api";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Home,
  Users,
  Leaf,
  Sparkles,
  Trophy,
  QrCode,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Pencil,
  Save,
  X,
  Check,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Trees,
  TrendingUp,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

type ThemeOption = "light" | "dark" | "system";

interface EcoLevel {
  title: string;
  level: number;
  icon: string;
  nextThreshold: number | null;
  minPoints: number;
}

function getEcoLevel(points: number): EcoLevel {
  if (points >= 1000) {
    return {
      title: "Mestre da Reciclagem",
      level: 4,
      icon: "🌍",
      nextThreshold: null,
      minPoints: 1000,
    };
  }
  if (points >= 500) {
    return {
      title: "Guardião Verde",
      level: 3,
      icon: "🌳",
      nextThreshold: 1000,
      minPoints: 500,
    };
  }
  if (points >= 100) {
    return {
      title: "Eco Consciente",
      level: 2,
      icon: "🌿",
      nextThreshold: 500,
      minPoints: 100,
    };
  }
  return {
    title: "Reciclador Iniciante",
    level: 1,
    icon: "🌱",
    nextThreshold: 100,
    minPoints: 0,
  };
}

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function ProfilePage() {
  const { user, token, loading: authLoading, logout, refreshUser } = useAuth();
  const { points: contextPoints, refetchPoints } = usePoints();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // User Profile State
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("cidadao");
  const [criadoEm, setCriadoEm] = useState("");
  const [pontos, setPontos] = useState(0);
  const [usuarioId, setUsuarioId] = useState<number | string>("");

  // Household state
  const [householdSize, setHouseholdSize] = useState(1);
  const [initialHouseholdSize, setInitialHouseholdSize] = useState(1);
  const [showCustomHousehold, setShowCustomHousehold] = useState(false);
  const [savingHousehold, setSavingHousehold] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Statistics state
  const [validatedCount, setValidatedCount] = useState(0);
  const [treesSaved, setTreesSaved] = useState(0);
  const [tagsCount, setTagsCount] = useState(0);

  // Theme & Logout State
  const [theme, setTheme] = useState<ThemeOption>("system");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync theme on initial mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeOption | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else {
      setTheme("system");
    }
  }, []);

  const applyTheme = useCallback((newTheme: ThemeOption) => {
    setTheme(newTheme);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = newTheme === "dark" || (newTheme === "system" && prefersDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
  }, []);

  // Listen to system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Initialize from auth context
  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setEditNome(user.nome || "");
      setEmail(user.email || "");
      const hSize = user.household_size || 1;
      setHouseholdSize(hSize);
      setInitialHouseholdSize(hSize);
      if (hSize > 5) setShowCustomHousehold(true);
      if (user.usuario_id) setUsuarioId(user.usuario_id);
    }
  }, [user]);

  // Fetch full profile and stats
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function loadData() {
      // 1. Fetch user data from backend API or Supabase fallback
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/users/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setNome(data.nome || user?.nome || "");
            setEditNome(data.nome || user?.nome || "");
            setEmail(data.email || user?.email || "");
            setTipo(data.tipo || "cidadao");
            setCriadoEm(data.criado_em || "");
            setPontos(typeof data.pontos === "number" ? data.pontos : 0);
            if (data.id) setUsuarioId(data.id);
          }
        } else {
          throw new Error("Fallback to Supabase");
        }
      } catch {
        // Direct Supabase fallback
        if (user?.usuario_id) {
          try {
            const { data: row } = await supabase
              .from("usuarios")
              .select("*")
              .eq("id", user.usuario_id)
              .single();

            if (row && isMounted) {
              setNome(row.nome || user.nome || "");
              setEditNome(row.nome || user.nome || "");
              setEmail(row.email || user.email || "");
              setTipo(row.tipo || "cidadao");
              setCriadoEm(row.criado_em || "");
              if (row.household_size) {
                setHouseholdSize(row.household_size);
                setInitialHouseholdSize(row.household_size);
              }
            }
          } catch {
            // Keep auth data
          }
        }
      }

      // 2. Fetch Impact data
      try {
        const impact = await fetchImpact();
        if (isMounted && impact) {
          setValidatedCount(impact.validated_count || 0);
          setTreesSaved(impact.trees || 0);
        }
      } catch {
        // Non-critical stat
      }

      // 3. Fetch Tags count
      try {
        const tags = await fetchMyTags();
        if (isMounted && Array.isArray(tags)) {
          setTagsCount(tags.length);
        }
      } catch {
        // Non-critical stat
      }
    }

    loadData();
    refetchPoints();

    return () => {
      isMounted = false;
    };
  }, [user, token, refetchPoints]);

  // Points precedence: contextPoints if > 0 or pontos state
  const displayPoints = contextPoints > 0 ? contextPoints : pontos;
  const ecoLevel = getEcoLevel(displayPoints);

  // Calculate progress to next tier
  const progressPercent = ecoLevel.nextThreshold
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((displayPoints - ecoLevel.minPoints) /
              (ecoLevel.nextThreshold - ecoLevel.minPoints)) *
              100
          )
        )
      )
    : 100;

  const pointsToNext = ecoLevel.nextThreshold
    ? Math.max(0, ecoLevel.nextThreshold - displayPoints)
    : 0;

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNome.trim()) {
      setProfileError("O nome não pode estar em branco.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    try {
      let saved = false;

      // 1. Try Backend API
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nome: editNome.trim(), email }),
        });

        if (res.ok) {
          const data = await res.json();
          setNome(data.nome);
          saved = true;
        }
      } catch {
        // Proceed to Supabase direct update
      }

      // 2. Direct Supabase update if user ID is known
      if (user?.usuario_id) {
        const { error: supaError } = await supabase
          .from("usuarios")
          .update({ nome: editNome.trim() })
          .eq("id", user.usuario_id);

        if (!supaError) {
          setNome(editNome.trim());
          saved = true;
        }
      }

      if (saved) {
        // Update local storage
        const storedUser = localStorage.getItem("supabase_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.nome = editNome.trim();
          localStorage.setItem("supabase_user", JSON.stringify(parsed));
        }

        await refreshUser();
        setIsEditing(false);
        toast.success("Perfil atualizado com sucesso!");
      } else {
        setProfileError("Não foi possível salvar as alterações. Tente novamente.");
        toast.error("Erro ao atualizar o perfil.");
      }
    } catch {
      setProfileError("Erro de comunicação com o servidor.");
      toast.error("Erro de conexão.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Household Size Save
  const handleSaveHousehold = async (newSize: number) => {
    setHouseholdSize(newSize);
    setSavingHousehold(true);

    try {
      if (user?.usuario_id) {
        const { error: updateError } = await supabase
          .from("usuarios")
          .update({ household_size: newSize })
          .eq("id", user.usuario_id);

        if (updateError) {
          toast.error("Erro ao salvar número de moradores.");
          return;
        }

        const storedUser = localStorage.getItem("supabase_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.household_size = newSize;
          localStorage.setItem("supabase_user", JSON.stringify(parsed));
        }

        setInitialHouseholdSize(newSize);
        await refreshUser();
        toast.success(`Residência atualizada: ${newSize} ${newSize === 1 ? "morador" : "moradores"}`);
      }
    } catch {
      toast.error("Erro ao conectar com o banco de dados.");
    } finally {
      setSavingHousehold(false);
    }
  };

  const householdPresets = [1, 2, 3, 4, 5];

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-success" />
          <p className="text-sm font-medium text-muted-foreground">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-2 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation context bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 px-1 -ml-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Início</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conta Ativa
            </span>
          </div>
        </div>

        {/* Hero Identity Surface */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-7 shadow-sm transition-all"
        >
          {/* Subtle eco ambient gradient background */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-success/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Avatar with status and squircle styling */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl squircle bg-gradient-to-br from-success/20 via-success/10 to-transparent border-2 border-success/30 flex items-center justify-center text-success shadow-inner">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
                    {getInitials(nome || user.nome)}
                  </span>
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-card flex items-center justify-center text-xs shadow-sm"
                  title={ecoLevel.title}
                >
                  <span>{ecoLevel.icon}</span>
                </div>
              </div>

              {/* Name & Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {nome || user.nome || "Usuário"}
                  </h1>
                  <Badge variant="success" className="text-[10px] tracking-wide py-0.5">
                    {tipo === "admin" ? "Administrador" : "Cidadão"}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="truncate max-w-[220px] sm:max-w-xs">{email || user.email}</span>
                  <span title="E-mail verificado" className="inline-flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success inline-block shrink-0" />
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{criadoEm ? `Membro desde ${formatDate(criadoEm)}` : "Membro ativo recente"}</span>
                </div>
              </div>
            </div>

            {/* Quick Edit Action Button */}
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditNome(nome);
                  setIsEditing(true);
                }}
                className="w-full sm:w-auto min-h-[44px] gap-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-transform active:scale-[0.97]"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                Editar Perfil
              </Button>
            )}
          </div>

          {/* Level progression bar */}
          <div className="mt-6 pt-5 border-t border-border/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-success" />
                <span>Nível {ecoLevel.level} · {ecoLevel.title}</span>
              </div>
              <span className="font-semibold text-success tabular-nums">
                {displayPoints} pts
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
              <motion.div
                initial={shouldReduceMotion ? { width: `${progressPercent}%` } : { width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-success shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
              <span>{ecoLevel.minPoints} pts</span>
              <span>
                {ecoLevel.nextThreshold
                  ? `Faltam ${pointsToNext} pts para o próximo nível`
                  : "Nível máximo alcançado!"}
              </span>
              <span>{ecoLevel.nextThreshold ? `${ecoLevel.nextThreshold} pts` : "∞"}</span>
            </div>
          </div>
        </motion.section>

        {/* Eco Impact Stats Cluster */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-success/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                EcoPoints
              </span>
              <div className="p-1.5 rounded-lg bg-success/10 text-success">
                <Leaf className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                {displayPoints}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Saldo acumulado</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-success/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Entregas
              </span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                {validatedCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Descartes validados</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-success/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Árvores
              </span>
              <div className="p-1.5 rounded-lg bg-success/10 text-success">
                <Trees className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                {treesSaved}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Impacto estimado</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-success/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Tags NFC
              </span>
              <div className="p-1.5 rounded-lg bg-secondary text-secondary-foreground">
                <QrCode className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground tabular-nums">
                {tagsCount}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Identificadores</p>
            </div>
          </div>
        </motion.section>

        {/* Personal Details & Edit Form */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Dados Pessoais
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Informações de identificação da sua conta
              </p>
            </div>

            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setProfileError("");
                }}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="edit-form"
                initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSaveProfile}
                className="space-y-4 pt-1"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-xs font-semibold text-muted-foreground">
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-11 rounded-xl text-base px-3.5 bg-background border-border focus-visible:ring-success"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                      E-mail Cadastrado
                    </Label>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-success" />
                      Não editável
                    </span>
                  </div>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="h-11 rounded-xl text-base px-3.5 bg-muted/40 border-border/80 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    O e-mail é o identificador de segurança da sua conta no Supabase.
                  </p>
                </div>

                {profileError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 min-h-[44px] rounded-xl font-medium transition-transform active:scale-[0.98]"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileError("");
                    }}
                    className="min-h-[44px] px-5 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="view-list"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-border/60"
              >
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground/70" />
                    Nome Completo
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {nome || "Não informado"}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground/70" />
                    E-mail
                  </span>
                  <span className="text-sm text-foreground font-mono text-xs">
                    {email || "—"}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground/70" />
                    Tipo de Conta
                  </span>
                  <span className="text-sm capitalize font-medium text-foreground">
                    {tipo || "Cidadão"}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground/70" />
                    ID da Matrícula
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    #{usuarioId || user.usuario_id || "—"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Household Configuration */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-success" />
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  Residência & Coleta Domiciliar
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                O número de moradores ajusta as metas mensais e permite calcular o impacto ecológico per capita da sua residência.
              </p>
            </div>

            {savingHousehold && (
              <Loader2 className="h-4 w-4 animate-spin text-success shrink-0" />
            )}
          </div>

          <div className="space-y-3 pt-1">
            <Label className="block text-xs font-semibold text-muted-foreground">
              Quantas pessoas moram com você?
            </Label>

            <div className="grid grid-cols-6 gap-2">
              {householdPresets.map((n) => {
                const isSelected = householdSize === n && !showCustomHousehold;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setShowCustomHousehold(false);
                      handleSaveHousehold(n);
                    }}
                    disabled={savingHousehold}
                    className={`h-11 rounded-xl text-sm font-semibold transition-all touch-manipulation select-none active:scale-[0.97] flex items-center justify-center ${
                      isSelected
                        ? "bg-success text-success-foreground shadow-sm ring-2 ring-success/30"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setShowCustomHousehold(true);
                  if (householdSize < 6) {
                    handleSaveHousehold(6);
                  }
                }}
                disabled={savingHousehold}
                className={`h-11 rounded-xl text-sm font-semibold transition-all touch-manipulation select-none active:scale-[0.97] flex items-center justify-center ${
                  showCustomHousehold || householdSize >= 6
                    ? "bg-success text-success-foreground shadow-sm ring-2 ring-success/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                6+
              </button>
            </div>

            {showCustomHousehold && (
              <div className="flex items-center gap-3 pt-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  step={1}
                  value={householdSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      setHouseholdSize(val);
                    }
                  }}
                  onBlur={() => {
                    if (householdSize !== initialHouseholdSize) {
                      handleSaveHousehold(householdSize);
                    }
                  }}
                  className="h-11 w-28 text-center text-base font-semibold"
                  inputMode="numeric"
                />
                <span className="text-xs text-muted-foreground">
                  moradores cadastrados na residência
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
              <Users className="h-4 w-4 text-success shrink-0" />
              <span>
                Atualmente calculado para <strong>{householdSize} {householdSize === 1 ? "pessoa" : "pessoas"}</strong> na sua residência.
              </span>
            </div>
          </div>
        </motion.section>

        {/* System Preferences (Theme Selector) */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Aparência da Aplicação
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alterne o esquema de cores para o seu conforto visual
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1 bg-muted/40 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => applyTheme("light")}
              className={`h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all touch-manipulation select-none active:scale-[0.98] ${
                theme === "light"
                  ? "bg-card text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="h-4 w-4 text-warning" />
              <span>Claro</span>
            </button>

            <button
              type="button"
              onClick={() => applyTheme("dark")}
              className={`h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all touch-manipulation select-none active:scale-[0.98] ${
                theme === "dark"
                  ? "bg-card text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="h-4 w-4 text-primary" />
              <span>Escuro</span>
            </button>

            <button
              type="button"
              onClick={() => applyTheme("system")}
              className={`h-11 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all touch-manipulation select-none active:scale-[0.98] ${
                theme === "system"
                  ? "bg-card text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span>Sistema</span>
            </button>
          </div>
        </motion.section>

        {/* Security & Logout Section */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Sessão & Segurança
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Encerre a sessão ativa neste dispositivo
            </p>
          </div>

          <AnimatePresence mode="wait">
            {showLogoutConfirm ? (
              <motion.div
                key="confirm"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Deseja realmente sair da sua conta?</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={logout}
                    className="flex-1 min-h-[44px] rounded-xl font-medium"
                  >
                    Sim, encerrar sessão
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 min-h-[44px] rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    Voltar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full min-h-[44px] rounded-xl text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive font-medium transition-transform active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da conta
              </Button>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}
