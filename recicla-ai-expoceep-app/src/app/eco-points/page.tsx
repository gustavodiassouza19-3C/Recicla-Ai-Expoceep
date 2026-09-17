"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui";
import { EcoPointsCard } from "@/components/dashboard/eco-points-card";
import { animate } from "animejs";

export default function EcoPointsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">EcoPoints</h1>
          <p className="text-muted-foreground mt-1">
            Encontre ecopontos proximos para entregar seus reciclaveis.
          </p>
        </div>
        <Card ref={cardRef} className="p-6 opacity-0 retro-border-card retro-shadow-md retro-radius">
          <EcoPointsCard />
        </Card>
      </div>
    </div>
  );
}
