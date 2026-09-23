"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { fetchMe } from "@/lib/api";

interface PointsContextType {
  points: number;
  loading: boolean;
  error: string | null;
  setPoints: (points: number) => void;
  refetchPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchPoints = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("supabase_token") : null;
    if (!token) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchMe();
      if (typeof data.pontos === "number") {
        setPoints(data.pontos);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pontos");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PointsContext.Provider
      value={{ points, loading, error, setPoints, refetchPoints }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) {
    throw new Error("usePoints deve ser usado dentro de um PointsProvider");
  }
  return ctx;
}
