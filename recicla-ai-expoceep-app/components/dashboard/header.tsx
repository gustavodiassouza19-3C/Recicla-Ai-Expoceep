"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Target, MapPin, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const tabs = [
  { id: "/dashboard", label: "Inicio", icon: Home },
  { id: "/missions", label: "Missoes", icon: Target },
  { id: "/eco-points", label: "EcoPoints", icon: MapPin },
  { id: "/profile", label: "Perfil", icon: User },
];

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-md mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-success">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-bold text-foreground">Recicla Ai</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-xs text-muted-foreground"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 pb-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.id)}
                className="group relative rounded-full px-2.5 py-1.5 outline-none sm:px-3 sm:py-2"
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
                    className="absolute inset-0 rounded-full border border-border bg-card shadow-xs"
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
                    "relative z-10 flex items-center gap-1.5 transition-colors duration-200 sm:gap-2",
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
                    <Icon className="h-3.5 w-3.5" />
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
