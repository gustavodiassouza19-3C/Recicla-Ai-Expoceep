"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePoints } from "@/contexts/points-context";
import { Card } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { ScoreDisplay } from "@/components/dashboard/score-display";
import { ImpactCard } from "@/components/dashboard/impact-card";
import { NfcTagsCard } from "@/components/dashboard/nfc-tags-card";
import { DashboardHistory } from "@/components/dashboard/dashboard-history";
import { stagger, animate } from "animejs";
import { fetchScoreHistory, type ScoreDataPoint } from "@/lib/api";
import { Leaf, Recycle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const { points, loading: loadingPoints, refetchPoints } = usePoints();

  const [scoreData, setScoreData] = useState<ScoreDataPoint[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // A pagina monta na hora. Só o que depende do token (saldo, impacto e
  // histórico) espera o auth — o restante já fica na tela.
  const authPending = loading || !user;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    // Só a série do gráfico. O summary antigo pedia 5 coisas a mais
    // (2 queries de pontos, histórico, tags e métricas de CO₂) e jogava
    // todas fora.
    fetchScoreHistory()
      .then(setScoreData)
      .catch(() => setScoreData([]));
    refetchPoints();
  }, [user, refreshKey, refetchPoints]);

  useEffect(() => {
    // Sempre depois do auth: os cards são renderizados desde o primeiro
    // paint e entrariam animando duas vezes se o efeito disparasse em
    // user === null.
    if (loading) return;
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: stagger(100),
      ease: "outExpo",
    });
  }, [loading]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10">
              <Leaf className="h-4 w-4 text-success" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-success">
              Eco Points
            </span>
          </div>
          {authPending ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Ola, {user?.nome || ""}
            </h1>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Seu impacto ambiental em tempo real
          </p>
        </div>

        {/* Row 1 - Score */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-6">
            <Card ref={(el) => { if (el) cardsRef.current[0] = el; }} className="p-4 md:p-6 border-success/10 bg-gradient-to-br from-success/[0.02] to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pontos por Mes
                  </h2>
                </div>
                {authPending || loadingPoints ? (
                  <Skeleton className="h-12 w-32" />
                ) : (
                  <ScoreDisplay score={points} />
                )}
              </div>
              {authPending ? (
                <Skeleton className="h-[180px] md:h-[280px] w-full" />
              ) : (
                <ScoreChart data={scoreData} />
              )}
            </Card>
          </div>
        </div>

        {/* Row 2 - Impact + Tags + History */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[1] = el; }} className="p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                  <Leaf className="h-3 w-3 text-success" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Impacto Estimado
                </h2>
              </div>
              {authPending ? (
                <div className="flex flex-col gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ImpactCard householdSize={user?.household_size ?? 1} />
              )}
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[2] = el; }} className="p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                  <Recycle className="h-3 w-3 text-success" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tags NFC
                </h2>
              </div>
              <NfcTagsCard onTagLinked={() => { setRefreshKey((k) => k + 1); refetchPoints(); }} />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[3] = el; }} className="p-3 md:p-4">
              <DashboardHistory refreshKey={refreshKey} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
