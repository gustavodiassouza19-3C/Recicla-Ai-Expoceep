"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Target, MapPin, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const tabs = [
  { id: "/dashboard", label: "Inicio", icon: Home },
  { id: "/missions", label: "Missoes", icon: Target },
  { id: "/rewards", label: "Recompensas", icon: Gift },
  { id: "/eco-points", label: "EcoPoints", icon: MapPin },
  { id: "/profile", label: "Perfil", icon: User },
];

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return null;
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-md mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-success">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-bold text-foreground">Recicla Ai</span>
          </div>
        </div>

        <nav className="flex items-center gap-2 pb-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.id)}
                className="group relative rounded-lg px-2 py-1 outline-none sm:px-3 sm:py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 25,
                      mass: 0.8,
                    }}
                    className="absolute inset-0 rounded-lg border border-border bg-card"
                  />
                )}

                <motion.div
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  animate={{
                    filter: isActive
                      ? ["blur(0px)", "blur(4px)", "blur(0px)"]
                      : "blur(0px)",
                  }}
                  className={cn(
                    "relative z-10 flex items-center gap-2 text-xs tracking-tight whitespace-nowrap",
                    isActive
                      ? "font-bold text-foreground"
                      : "font-semibold text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.03 : 1 }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 15 },
                    }}
                    className="flex shrink-0 items-center justify-center"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                  <span className="text-xs tracking-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                </motion.div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export { Header, Header as header };
