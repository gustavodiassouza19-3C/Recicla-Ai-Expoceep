"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Trophy, Gift, MapPin, User, Menu, X, LogOut, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { AchievementNotifications } from "@/components/dashboard/achievement-notifications";

const tabs = [
  { id: "/dashboard", label: "Inicio", icon: Home },
  { id: "/missions", label: "Missoes", icon: Trophy },
  { id: "/achievements", label: "Conquistas", icon: Trophy },
  { id: "/rewards", label: "Recompensas", icon: Gift },
  { id: "/eco-points", label: "EcoPoints", icon: MapPin },
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

  const activeTab = tabs.find((t) => t.id === pathname);
  const ActiveIcon = activeTab?.icon ?? Home;

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-success">
                <path d="M17 22H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 22V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 14C12 14 7 11 7 7C7 4 9 2 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M12 11C12 11 17 8 17 4C17 1 15 -1 12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="text-sm font-bold text-foreground tracking-tight">Recicla Ai</span>
            </div>

            <div className="flex items-center gap-1.5">
              <AchievementNotifications />
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 pb-2">
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
              className="fixed inset-0 z-[60] bg-black/50 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-background border-r border-border md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-success">
                      <path d="M17 22H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 22V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 14C12 14 7 11 7 7C7 4 9 2 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <path d="M12 11C12 11 17 8 17 4C17 1 15 -1 12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    <span className="text-sm font-bold text-foreground tracking-tight">Recicla Ai</span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
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
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
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
