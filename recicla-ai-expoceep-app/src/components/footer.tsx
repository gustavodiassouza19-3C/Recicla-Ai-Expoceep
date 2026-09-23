"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Recycle, Heart } from "lucide-react";

function Footer() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register" || pathname === "/admin-dashboard") return null;

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
              <Leaf className="h-3 w-3 text-success" />
            </div>
            <span className="text-xs font-bold text-foreground tracking-tight">Recicla Ai</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              Sobre
            </Link>
            <Link href="/missions" className="hover:text-foreground transition-colors">
              Missoes
            </Link>
            <Link href="/rewards" className="hover:text-foreground transition-colors">
              Recompensas
            </Link>
            <Link href="/eco-points" className="hover:text-foreground transition-colors">
              EcoPoints
            </Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">
              Perfil
            </Link>
          </nav>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Feito com</span>
            <Heart className="h-2.5 w-2.5 text-destructive fill-destructive" />
            <span>para o planeta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer, Footer as footer };
