"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trophy, Gift, MapPin, User, Menu, X, LogOut, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { AchievementNotifications } from "@/components/dashboard/achievement-notifications";

const tabs = [
  { id: "/dashboard", label: "Inicio", icon: Home },
  { id: "/achievements", label: "Conquistas", icon: Trophy },
  { id: "/rewards", label: "Recompensas", icon: Gift },
  { id: "/eco-points", label: "Ecopontos", icon: MapPin },
  { id: "/about", label: "Sobre", icon: HelpCircle },
  { id: "/profile", label: "Perfil", icon: User },
];

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;
  if (!user) return null;
  if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/admin-dashboard") return null;


  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 md:px-8">
          <div className="mx-auto flex min-h-11 max-w-6xl items-center gap-2 lg:min-h-14">
            <div className="flex shrink-0 items-center gap-1.5">
              <Image src="/images/logo.webp" alt="Recicla Ai" width={640} height={982} className="h-4 w-auto" />
              <span className="text-sm font-bold text-foreground tracking-tight">Recicla Ai</span>
            </div>

            {/* Desktop nav - na mesma linha da logo */}
            <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
              {tabs.map((tab) => {
                const isActive = pathname === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.id)}
                    className="group relative flex min-h-11 items-center rounded-full px-2.5 py-1.5 outline-none sm:px-3 sm:py-2"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab"
                        transition={{ type: "spring", stiffness: 280, damping: 25, mass: 0.8 }}
                        className="absolute inset-0 rounded-full border border-border bg-card shadow-xs"
                      />
                    )}
                    <motion.div
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      animate={{ filter: isActive ? ["blur(0px)", "blur(4px)", "blur(0px)"] : "blur(0px)" }}
                      className={cn(
                        "relative z-10 flex items-center gap-1.5 transition-colors duration-200 sm:gap-2",
                        isActive ? "font-bold text-foreground" : "font-semibold text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <motion.div
                        animate={{ scale: isActive ? 1.03 : 1 }}
                        transition={{ scale: { type: "spring", stiffness: 300, damping: 15 } }}
                        className="flex shrink-0 items-center justify-center"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </motion.div>
                      <span className="text-xs tracking-tight whitespace-nowrap">{tab.label}</span>
                    </motion.div>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <AchievementNotifications />
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-background border-r border-border lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <Image src="/images/logo.webp" alt="Recicla Ai" width={640} height={982} className="h-4 w-auto" />
                    <span className="text-sm font-bold text-foreground tracking-tight">Recicla Ai</span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5 text-foreground" />
                  </button>
                </div>

                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user.nome}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-2 py-3">
                  {tabs.map((tab) => {
                    const isActive = pathname === tab.id;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          router.push(tab.id);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-success/10 text-success"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="px-2 pb-4 border-t border-border pt-3">
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export { Header, Header as header };
