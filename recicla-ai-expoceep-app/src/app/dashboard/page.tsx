"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { ScoreDisplay } from "@/components/dashboard/score-display";
import { HistoryList } from "@/components/dashboard/history-list";
import { ImpactCard } from "@/components/dashboard/impact-card";
import { NfcTagsCard } from "@/components/dashboard/nfc-tags-card";
import { MissionsCard } from "@/components/dashboard/missions-card";
import { EcoPointsCard } from "@/components/dashboard/eco-points-card";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta, {user.nome}!
          </p>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="md:col-span-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Pontuacao Mensal
                </h2>
                <ScoreDisplay />
              </div>
              <ScoreChart />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="flex flex-col h-[320px]">
              <div className="px-4 pt-4 pb-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Historico
                </h2>
              </div>
              <HistoryList className="flex-1 min-h-0" />
            </Card>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-6">
          <div className="md:col-span-2">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Impacto Ambiental
              </h2>
              <ImpactCard />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Tags NFC
              </h2>
              <NfcTagsCard />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Missoes
              </h2>
              <MissionsCard />
            </Card>
          </div>
        </div>

        {/* Row 3 */}
        <div className="mt-6">
          <Card className="p-4">
            <EcoPointsCard />
          </Card>
        </div>
      </div>
    </div>
  );
}
