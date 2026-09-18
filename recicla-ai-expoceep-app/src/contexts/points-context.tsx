"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PointsContextType {
  points: number;
  setPoints: (points: number) => void;
  refetchPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);

  const refetchPoints = useCallback(async () => {
    const token = localStorage.getItem("supabase_token");
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.pontos !== undefined) {
          setPoints(data.pontos);
        }
      }
    } catch {}
  }, []);

  return (
    <PointsContext.Provider value={{ points, setPoints, refetchPoints }}>
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
