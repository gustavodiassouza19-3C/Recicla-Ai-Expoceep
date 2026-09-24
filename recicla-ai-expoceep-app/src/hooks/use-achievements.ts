"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  checkAchievements,
  claimAchievement,
  claimAllAchievements,
  fetchPendingAchievements,
  type PendingAchievement,
} from "@/lib/api-achievements";
import { usePoints } from "@/contexts/points-context";

interface PendingPayload {
  pending?: PendingAchievement[];
}

async function applyPending(
  data: PendingPayload,
  setPending: (p: PendingAchievement[]) => void
) {
  if (Array.isArray(data.pending)) {
    setPending(data.pending);
  } else {
    const fresh = await fetchPendingAchievements();
    setPending(fresh.pending);
  }
}

export function useAchievements() {
  const [pending, setPending] = useState<PendingAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const { refetchPoints } = usePoints();

  const refreshPending = useCallback(async () => {
    try {
      const data = await fetchPendingAchievements();
      setPending(data.pending);
    } catch {
      setPending([]);
    }
  }, []);

  const runCheck = useCallback(async () => {
    try {
      const result = await checkAchievements();
      if (Array.isArray(result.pending)) {
        setPending(result.pending);
      }
      for (const a of result.novas_conquistas) {
        toast.info(`Conquista desbloqueada: ${a.nome}`, {
          description: `${a.descricao} — resgate +${a.pontos} pontos`,
          duration: 8000,
        });
      }
      return result;
    } catch {
      await refreshPending();
      return null;
    }
  }, [refreshPending]);

  const claim = useCallback(
    async (codigo: string) => {
      setClaiming(codigo);
      try {
        const result = await claimAchievement(codigo);
        await applyPending(result, setPending);
        await refetchPoints();
        toast.success(
          `+${result.claimed.pontos} pontos resgatados!`,
          { description: `Total: ${result.claimed.pontos_totais} pts` }
        );
        return result;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao resgatar prêmio");
        throw e;
      } finally {
        setClaiming(null);
      }
    },
    [refetchPoints]
  );

  const claimAll = useCallback(async () => {
    setClaiming("*");
    try {
      const result = await claimAllAchievements();
      await applyPending(result, setPending);
      await refetchPoints();
      if (result.pontos_ganhos > 0) {
        toast.success(`+${result.pontos_ganhos} pontos resgatados!`, {
          description: `${result.claimed.length} prêmio(s) coletado(s)`,
        });
      } else {
        toast.info("Nenhum prêmio para resgatar.");
      }
      return result;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao resgatar prêmios");
      throw e;
    } finally {
      setClaiming(null);
    }
  }, [refetchPoints]);

  useEffect(() => {
    let cancelled = false;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("supabase_token")
        : null;
    if (!token) return;

    (async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        await runCheck();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [runCheck]);

  return {
    pending,
    pendingCount: pending.length,
    loading,
    claiming,
    claim,
    claimAll,
    refreshPending,
    check: runCheck,
  };
}
