"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AchievementsList } from "@/components/dashboard/achievements-list";

export default function MissionsPage() {
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
