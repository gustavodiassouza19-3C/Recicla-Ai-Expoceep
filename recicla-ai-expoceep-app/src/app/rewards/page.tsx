"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePoints } from "@/contexts/points-context";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, ChevronRight, Sparkles, TreePine, Droplets, Recycle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { animate } from "animejs";
import { toast } from "sonner";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "desconto" | "parceiro" | "doacao";
  icon: string;
  available: boolean;
}

interface CatalogItem {
  id: number;
  titulo: string;
  descricao: string | null;
  custo_pontos: number;
  categoria: "desconto" | "parceiro" | "doacao";
  icone: string | null;
  ativa: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  desconto: "Descontos",
  parceiro: "Parceiros",
  doacao: "Doacoes",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
} as const;

export default function RewardsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { points, loading: loadingPoints, refetchPoints } = usePoints();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set());
  const pointsRef = useRef<HTMLSpanElement>(null);

  // Catalogo vem do backend. Antes era um array fixo no arquivo, entao o que o
  // admin cria no painel nunca aparecia aqui.
  useEffect(() => {
    let cancelled = false;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/rewards`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { recompensas?: CatalogItem[] };

        if (cancelled) return;
        setRewards(
          (data.recompensas ?? []).map((item) => ({
            id: String(item.id),
            title: item.titulo,
            description: item.descricao ?? "",
            cost: item.custo_pontos,
            category: item.categoria,
            icon: item.icone ?? "?",
            available: item.ativa,
          }))
        );
      } catch {
        if (!cancelled) setRewards([]);
      } finally {
        if (!cancelled) setLoadingRewards(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    refetchPoints();
  }, [user, refetchPoints]);

  useEffect(() => {
    if (pointsRef.current && points > 0) {
      const obj = { val: 0 };
      animate(obj, {
        val: points,
        duration: 1500,
        ease: "outExpo",
        onUpdate: () => {
          if (pointsRef.current) {
            pointsRef.current.textContent = Math.round(obj.val).toLocaleString("pt-BR");
          }
        },
      });
    }
  }, [points]);

  // Enquanto a sessao resolve, o catalogo ja esta na tela — o saldo e a parte
  // que ainda nao pode ser montada, entao so ele vira skeleton.
  const authPending = loading || !user;

  const filtered = activeCategory === "all"
    ? rewards
    : rewards.filter((r) => r.category === activeCategory);

const handleResgate = async (reward: RewardItem) => {
  if (redeemingId) return;

  // Feedback imediato sem esperar a rede (so quando o saldo ja carregou)
  if (!loadingPoints && points < reward.cost) {
    toast.error("Pontos insuficientes", {
      description: `Voce tem ${points} pts e precisa de ${reward.cost} pts.`,
    });
    return;
  }

  setRedeemingId(reward.id);
  const tid = toast.loading(`Resgatando ${reward.title}...`);

  try {
    const data = await apiFetch<{ novo_total?: number }>(
      `/api/rewards/${reward.id}/resgate`,
      { method: "POST" }
    );

    setRedeemedIds((prev) => new Set(prev).add(reward.id));

    toast.success("Recompensa resgatada!", {
      id: tid,
      description: `${reward.title} · -${reward.cost} pts · Saldo: ${
        data.novo_total ?? "—"
      } pts`,
      duration: 5000,
    });

    // Refresca pontos após resgate bem-sucedido
    refetchPoints();
  } catch (e) {
    toast.error("Nao foi possivel resgatar", {
      id: tid,
      description: e instanceof Error ? e.message : "Erro ao resgatar",
    });
  } finally {
    setRedeemingId(null);
  }
};

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Estilo Banco */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-primary/5" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-success/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />

        <div className="relative p-4 md:p-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {authPending ? (
                <div className="mb-6 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-44" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Seu saldo
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-foreground font-mono tabular-nums" ref={pointsRef}>
                      0
                    </span>
                    <span className="text-lg font-semibold text-success">
                      pontos
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-muted-foreground">
                        +{Math.floor(points * 0.12)} este mes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Nunca expira
                      </span>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        </div>
      </div>

      {/* Impacto Ambiental - mini cards */}
      <div className="p-4 md:p-8 pt-0">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-2 mb-6"
          >
            <Card className="p-3 text-center retro-border-item retro-shadow-sm retro-radius">
              <TreePine className="h-5 w-5 text-success mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block font-mono">
                {authPending ? "—" : Math.floor(points * 0.004)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Arvores
              </span>
            </Card>
            <Card className="p-3 text-center retro-border-item retro-shadow-sm retro-radius">
              <Droplets className="h-5 w-5 text-primary mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block font-mono">
                {authPending ? "—" : Math.floor(points * 8)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Litros
              </span>
            </Card>
            <Card className="p-3 text-center retro-border-item retro-shadow-sm retro-radius">
              <Recycle className="h-5 w-5 text-accent mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block font-mono">
                {authPending ? "—" : Math.floor(points * 0.5)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Kg recic.
              </span>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Catalogo de Recompensas */}
      <div className="mb-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-success" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Catalogo
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-minimal mb-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold transition-colors retro-radius ${
                activeCategory === "all"
                  ? "bg-success text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold transition-colors retro-radius ${
                  activeCategory === key
                    ? "bg-success text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Lista de Recompensas */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {loadingRewards ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Carregando recompensas...
              </p>
            ) : (
              filtered.map((reward) => (
                <motion.div key={reward.id} variants={item}>
                  <Card className="p-4 retro-border-item retro-shadow-sm retro-radius w-full cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-success/10 text-success font-bold text-sm retro-radius shrink-0">
                        {reward.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground truncate">
                            {reward.title}
                          </span>
                          <Badge variant={reward.available ? "success" : "warning"}>
                            {reward.cost} pts
                          </Badge>
                        </div>
                        {reward.description ? (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {reward.description}
                          </p>
                        ) : null}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                    {reward.available && (
                      <motion.div
                        initial={false}
                        animate={
                          redeemedIds.has(reward.id)
                            ? { scale: [1, 1.03, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`p-3 mt-2 retro-border-item retro-shadow-sm retro-radius w-full border ${
                          redeemedIds.has(reward.id)
                            ? "border-success/50 bg-success/5"
                            : "border-success/20"
                        }`}
                      >
                        {redeemedIds.has(reward.id) ? (
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-success">
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                            Resgatado
                          </p>
                        ) : (
                          <>
                            <p className="text-xs text-success font-medium uppercase tracking-wider">
                              Resgatar por {reward.cost} pts
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              disabled={redeemingId !== null}
                              onClick={() => handleResgate(reward)}
                            >
                              {redeemingId === reward.id ? (
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                  Resgatando...
                                </span>
                              ) : (
                                "Resgatar"
                              )}
                            </Button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))
            )}
            {!loadingRewards && filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma recompensa nesta categoria.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}