"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { ScoreDisplay } from "@/components/dashboard/score-display";
import { HistoryList } from "@/components/dashboard/history-list";
import { ImpactCard } from "@/components/dashboard/impact-card";
import { NfcTagsCard } from "@/components/dashboard/nfc-tags-card";
import { MissionsCard } from "@/components/dashboard/missions-card";
import {
  fetchScoreHistory,
  fetchHistory,
  fetchMyTags,
  fetchImpact,
  fetchMyMissions,
  type ScoreDataPoint,
  type HistoryEntry,
  type UserTag,
  type ImpactData,
  type UserMissionItem,
} from "@/lib/api";
import { stagger, animate } from "animejs";


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const cardsRef = useRef<HTMLDivElement[]>([]);

  const [scoreData, setScoreData] = useState<ScoreDataPoint[]>([]);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [tagsData, setTagsData] = useState<UserTag[]>([]);
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [missionsData, setMissionsData] = useState<UserMissionItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchScoreHistory().then(setScoreData).catch(() => {});
    fetchHistory().then(setHistoryData).catch(() => {});
    fetchMyTags().then(setTagsData).catch(() => {});
    fetchImpact().then(setImpactData).catch(() => {});
    fetchMyMissions().then(setMissionsData).catch(() => {});
  }, [user]);

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
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta, {user.nome}!
          </p>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <Card ref={(el) => { if (el) cardsRef.current[0] = el; }} className="p-4 opacity-0 retro-border-card retro-shadow-md retro-radius">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pontuacao Mensal
                </h2>
                <ScoreDisplay />
              </div>
              <ScoreChart data={scoreData.length > 0 ? scoreData : undefined} />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[1] = el; }} className="flex flex-col h-[320px] opacity-0 retro-border-card retro-shadow-md retro-radius">
              <div className="px-4 pt-4 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Historico
                </h2>
              </div>
              <HistoryList
                className="flex-1 min-h-0"
                data={
                  historyData.length > 0
                    ? historyData.map((e) => ({
                        id: String(e.id),
                        attachedAt: new Date(e.data_entrega).toLocaleDateString("pt-BR"),
                        status: e.status === "validada" ? "validada" as const : "pendente" as const,
                        validatedAt: e.status === "validada" ? new Date(e.data_entrega).toLocaleDateString("pt-BR") : null,
                        location: e.tags?.codigo_nfc ? `Tag ${e.tags.codigo_nfc}` : null,
                      }))
                    : undefined
                }
              />
            </Card>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[2] = el; }} className="p-4 opacity-0 retro-border-card retro-shadow-md retro-radius">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Impacto Ambiental
              </h2>
              <ImpactCard
                validatedTags={impactData?.validated_count ?? 12}
              />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[3] = el; }} className="p-4 opacity-0 retro-border-card retro-shadow-md retro-radius">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Tags NFC
              </h2>
              <NfcTagsCard
                tags={
                  tagsData.length > 0
                    ? tagsData.map((t) => ({
                        id: String(t.id),
                        status: t.status === "ativa" ? "disponivel" as const : "em-uso" as const,
                        lastUsed: new Date(t.last_used).toLocaleDateString("pt-BR"),
                      }))
                    : undefined
                }
              />
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card ref={(el) => { if (el) cardsRef.current[4] = el; }} className="p-4 opacity-0 retro-border-card retro-shadow-md retro-radius">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Missoes
              </h2>
              <MissionsCard
                missions={
                  missionsData.length > 0
                    ? missionsData.map((m) => ({
                        id: String(m.mission.id),
                        name: m.mission.titulo,
                        description: m.mission.descricao,
                        current: m.progress,
                        target: m.mission.meta,
                        reward: m.mission.recompensa_pontos,
                        completed: m.completed,
                      }))
                    : undefined
                }
              />
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
