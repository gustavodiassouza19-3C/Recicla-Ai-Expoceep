"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { usePoints } from "@/contexts/points-context";
import { Card } from "@/components/ui";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { ScoreDisplay } from "@/components/dashboard/score-display";
import { ImpactCard } from "@/components/dashboard/impact-card";
import { NfcTagsCard } from "@/components/dashboard/nfc-tags-card";
import { DashboardHistory } from "@/components/dashboard/dashboard-history";
import { stagger, animate } from "animejs";
import { dashboardService } from "@/lib/dashboard-service";
import { Leaf, Recycle, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const { points, refetchPoints } = usePoints();

  const [scoreData, setScoreData] = useState<Array<{ month: string; score: number }>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    dashboardService.getDashboardSummary().then(({ scoreData: sd }) => {
      setScoreData(sd || []);
    });
    refetchPoints();
  }, [user, refreshKey, refetchPoints]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      delay: stagger(100),
      ease: "outExpo",
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Ola, {user?.nome || "--"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seu impacto ambiental em tempo real
          </p>
        </div>

        {/* Row 1 - Score */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-6">
            <Card ref={(el) => { if (el) cardsRef.current[0] = el; }} className="p-4 md:p-6 opacity-0 border-success/10 bg-gradient-to-br from-success/[0.02] to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Pontuacao Mensal
                  </h2>
                </div>
                <ScoreDisplay score={points} />
              </div>
              <ScoreChart data={scoreData} />
            </Card>
          </div>
        </div>

        {/* Row 2 - Impact + Tags + History */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[2] = el; }} className="p-4 md:p-5 opacity-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
                  <Leaf className="h-3 w-3 text-success" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Impacto Estimado
                </h2>
              </div>
              <ImpactCard
                householdSize={user?.household_size ?? 1}
              />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[3] = el; }} className="p-4 md:p-5 opacity-0">
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
            <Card ref={(el) => { if (el) cardsRef.current[4] = el; }} className="p-3 md:p-4 opacity-0">
              <DashboardHistory />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
