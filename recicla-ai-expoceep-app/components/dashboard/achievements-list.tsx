"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { AchievementBadge } from "@/components/dashboard/achievement-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchAchievementsProgress,
  claimAchievement,
} from "@/lib/api-achievements";
import type { AchievementProgressItem } from "@/lib/api-achievements";
import { usePoints } from "@/contexts/points-context";

const CATEGORIES = [
  { key: "all", label: "Todas" },
  { key: "tags", label: "TAGs" },
  { key: "tags_casa", label: "Casa" },
  { key: "sequencia", label: "Sequencia" },
  { key: "periodo", label: "Periodo" },
  { key: "pontos", label: "Pontos" },
  { key: "frequencia", label: "Frequencia" },
  { key: "compromisso", label: "Compromisso" },
];

interface AchievementDetailProps {
  achievement: AchievementProgressItem;
  onClose: () => void;
  onClaimed: (codigo: string) => void;
}

function AchievementDetail({
  achievement,
  onClose,
  onClaimed,
}: AchievementDetailProps) {
  const [claiming, setClaiming] = useState(false);
  const { refetchPoints } = usePoints();
  const progressPercent =
    achievement.condicao_valor > 0
      ? Math.min(
          (achievement.progresso_atual / achievement.condicao_valor) * 100,
          100
        )
      : 0;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const result = await claimAchievement(achievement.conquista_codigo);
      await refetchPoints();
      toast.success(`+${result.claimed.pontos} pontos resgatados!`, {
        description: `Total: ${result.claimed.pontos_totais} pts`,
      });
      onClaimed(achievement.conquista_codigo);
      onClose();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao resgatar prêmio"
      );
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold text-foreground">
                Detalhes
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl mb-3 ${
                achievement.desbloqueada ? "bg-success/15" : "bg-muted grayscale"
              }`}
            >
              {achievement.conquista_icone}
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {achievement.conquista_nome}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {achievement.conquista_descricao}
            </p>
            <p className="text-sm font-semibold text-success mt-2">
              +{achievement.conquista_pontos} pontos
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso</span>
                <span>
                  {achievement.progresso_atual}/{achievement.condicao_valor}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-success"
                />
              </div>
            </div>

            {achievement.desbloqueada && achievement.data_concessao && (
              <p className="text-xs text-muted-foreground text-center">
                Desbloqueada em{" "}
                {new Date(achievement.data_concessao).toLocaleDateString("pt-BR")}
              </p>
            )}

            {achievement.pendente_resgate && (
              <Button
                className="w-full"
                disabled={claiming}
                onClick={handleClaim}
              >
                {claiming ? "Resgatando..." : `Pegar prêmio (+${achievement.conquista_pontos})`}
              </Button>
            )}

            {achievement.desbloqueada && achievement.resgatada && (
              <div className="flex items-center justify-center gap-1.5 text-success text-sm font-medium">
                <span>✓</span>
                <span>Prêmio resgatado!</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function AchievementsList() {
  const [progress, setProgress] = useState<AchievementProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementProgressItem | null>(null);

  useEffect(() => {
    fetchAchievementsProgress()
      .then(setProgress)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "all"
      ? progress
      : progress.filter((p) => p.conquista_categoria === activeCategory);

  const unlocked = progress.filter((p) => p.desbloqueada).length;
  const pending = progress.filter((p) => p.pendente_resgate).length;
  const total = progress.length;

  const handleClaimed = (codigo: string) => {
    setProgress((prev) =>
      prev.map((item) =>
        item.conquista_codigo === codigo
          ? { ...item, resgatada: true, pendente_resgate: false }
          : item
      )
    );
    setSelectedAchievement((prev) =>
      prev && prev.conquista_codigo === codigo
        ? { ...prev, resgatada: true, pendente_resgate: false }
        : prev
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Carregando conquistas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-success" />
        <h2 className="text-sm font-semibold text-foreground">
          Conquistas
        </h2>
        <span className="text-xs text-muted-foreground">
          {unlocked}/{total}
        </span>
        {pending > 0 && (
          <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
            {pending} para resgatar
          </span>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-minimal">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat.key
                ? "bg-success text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <motion.div
              key={item.conquista_codigo}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <AchievementBadge
                icone={item.conquista_icone}
                nome={item.conquista_nome}
                pontos={item.conquista_pontos}
                desbloqueada={item.desbloqueada}
                pendenteResgate={item.pendente_resgate}
                progresso={item.progresso_atual}
                total={item.condicao_valor}
                onClick={() => setSelectedAchievement(item)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          Nenhuma conquista nesta categoria.
        </p>
      )}

      <AnimatePresence>
        {selectedAchievement && (
          <AchievementDetail
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
            onClaimed={handleClaimed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export { AchievementsList, AchievementsList as achievementsList };
