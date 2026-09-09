"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SplashScreen } from "@/components/splash-screen";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [user, loading, router]);

  return <SplashScreen onComplete={() => {}} />;
}
