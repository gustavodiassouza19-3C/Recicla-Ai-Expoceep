"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AchievementsList } from "@/components/dashboard/achievements-list";
import { animate } from "animejs";

export default function MissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        ease: "outExpo",
      });
    }
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
      <div ref={containerRef} className="max-w-6xl mx-auto opacity-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Missoes</h1>
          <p className="text-muted-foreground mt-1">
            Complete missoes e desbloqueie conquistas para ganhar pontos extras!
          </p>
        </div>

        <AchievementsList />
      </div>
    </div>
  );
}
