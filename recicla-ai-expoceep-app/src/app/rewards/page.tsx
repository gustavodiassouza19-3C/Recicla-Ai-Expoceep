"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePoints } from "@/contexts/points-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, Clock, ChevronRight, Sparkles, TreePine, Droplets, Recycle } from "lucide-react";
import { motion } from "framer-motion";
import { animate } from "animejs";

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "desconto" | "parceiro" | "doacao";
  icon: string;
  available: boolean;
}

const REWARDS: RewardItem[] = [
  {
    id: "1",
    title: "Cupom 10% Off",
    description: "Desconto em lojas parceiras de Cascavel",
    cost: 100,
    category: "desconto",
    icon: "D",
    available: true,
  },
  {
    id: "2",
    title: "Plantar 1 Arvore",
    description: "Doar sua pontuacao para plantio de arvore",
    cost: 200,
    category: "doacao",
    icon: "A",
    available: true,
  },
  {
    id: "3",
    title: "Cafe Gratuito",
    description: "Um cafe gratis no Parque Ecologico",
    cost: 50,
    category: "parceiro",
    icon: "C",
    available: true,
  },
  {
    id: "4",
    title: "Kit Reciclavel",
    description: "Lixeira separadora para sua casa",
    cost: 300,
    category: "parceiro",
    icon: "R",
    available: true,
  },
  {
    id: "5",
    title: "Doar 5L Agua",
    description: "5 litros de agua doados para projecao social",
    cost: 150,
    category: "doacao",
    icon: "5L",
    available: true,
  },
  {
    id: "6",
    title: "Cupom 20% Off",
    description: "Desconto especial em lojas de Cascavel",
    cost: 250,
    category: "desconto",
    icon: "20",
    available: false,
  },
];

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
};

export default function RewardsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { points, refetchPoints } = usePoints();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const pointsRef = useRef<HTMLSpanElement>(null);

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

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const filtered = activeCategory === "all"
    ? REWARDS
    : REWARDS.filter((r) => r.category === activeCategory);

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

              {/* Acoes rapidas */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  className="w-full justify-center gap-2"
                  onClick={() => {}}
                >
                  <Gift className="h-4 w-4" />
                  Resgatar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2"
                  onClick={() => {}}
                >
                  <TrendingUp className="h-4 w-4" />
                  Historico
                </Button>
              </div>
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
                {Math.floor(points * 0.004)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Arvores
              </span>
            </Card>
            <Card className="p-3 text-center retro-border-item retro-shadow-sm retro-radius">
              <Droplets className="h-5 w-5 text-primary mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block font-mono">
                {Math.floor(points * 8)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Litros
              </span>
            </Card>
            <Card className="p-3 text-center retro-border-item retro-shadow-sm retro-radius">
              <Recycle className="h-5 w-5 text-accent mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block font-mono">
                {Math.floor(points * 0.5)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Kg recic.
              </span>
            </Card>
          </motion.div>

          {/* Catalogo de Recompensas */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-success" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Catalogo
              </h2>
            </div>

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
          </div>

          {/* Lista de Recompensas */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {filtered.map((reward) => (
              <motion.div key={reward.id} variants={item}>
                <Card className="p-4 retro-border-item retro-shadow-sm retro-radius cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
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
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {reward.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Nenhuma recompensa nesta categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
