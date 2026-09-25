"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

function LandingHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 50;
    setScrolled((prev) => (prev === next ? prev : next));
  });

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
              { label: "Sobre", href: "/about" },
            ].map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  if (link.href.startsWith("/")) {
                    router.push(link.href);
                  } else {
                    document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`text-sm py-2 transition-colors ${
                  scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => router.push("/login")}
              className={`text-sm py-2 transition-colors ${
                scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-5 py-2.5 text-sm font-medium bg-success text-success-foreground rounded-full hover:bg-success/90 transition-colors"
            >
              Começar Agora
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden p-3 rounded-full transition-colors ${
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
                  className="p-3 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                <a
                  href="#como-funciona"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-base text-foreground hover:text-success transition-colors"
                >
                  Como funciona
                </a>
                <a
                  href="#features"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-base text-foreground hover:text-success transition-colors"
                >
                  Funcionalidades
                </a>
                <a
                  href="#faq"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-base text-foreground hover:text-success transition-colors"
                >
                  Perguntas
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/about");
                  }}
                  className="py-2.5 text-base text-foreground hover:text-success transition-colors text-left"
                >
                  Sobre
                </button>
                <hr className="border-border" />
                <button
                  onClick={() => { setMenuOpen(false); router.push("/login"); }}
                  className="py-2.5 text-base text-foreground hover:text-success transition-colors text-left"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); router.push("/register"); }}
                  className="w-full px-5 py-3 text-base font-medium bg-success text-success-foreground rounded-full hover:bg-success/90 transition-colors"
                >
                  Começar Agora
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
