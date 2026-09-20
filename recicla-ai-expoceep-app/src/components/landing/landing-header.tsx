"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LandingHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <button onClick={() => router.push("/")} className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-success">
              <path d="M17 22H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 22V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 14C12 14 7 11 7 7C7 4 9 2 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M12 11C12 11 17 8 17 4C17 1 15 -1 12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className={`text-base font-bold tracking-tight transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>
              Recicla Ai
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Como funciona", href: "#como-funciona" },
              { label: "Funcionalidades", href: "#features" },
              { label: "Perguntas", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => router.push("/login")}
              className={`text-sm transition-colors ${
                scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-5 py-2.5 text-sm font-medium text-white bg-success rounded-full hover:bg-success/90 transition-colors"
            >
              Comecar Agora
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden p-2 rounded-full transition-colors ${
              scrolled ? "hover:bg-muted" : "hover:bg-white/10"
            }`}
          >
            <Menu className={`h-5 w-5 ${scrolled ? "text-foreground" : "text-white"}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border p-6 md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                <a
                  href="#como-funciona"
                  onClick={() => setMenuOpen(false)}
                  className="text-base text-foreground hover:text-success transition-colors"
                >
                  Como funciona
                </a>
                <a
                  href="#features"
                  onClick={() => setMenuOpen(false)}
                  className="text-base text-foreground hover:text-success transition-colors"
                >
                  Funcionalidades
                </a>
                <a
                  href="#faq"
                  onClick={() => setMenuOpen(false)}
                  className="text-base text-foreground hover:text-success transition-colors"
                >
                  Perguntas
                </a>
                <hr className="border-border" />
                <button
                  onClick={() => { setMenuOpen(false); router.push("/login"); }}
                  className="text-base text-foreground hover:text-success transition-colors text-left"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); router.push("/register"); }}
                  className="w-full px-5 py-3 text-base font-medium text-white bg-success rounded-full hover:bg-success/90 transition-colors"
                >
                  Comecar Agora
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export { LandingHeader, LandingHeader as landingHeader };
