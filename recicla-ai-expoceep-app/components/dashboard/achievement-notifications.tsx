"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/hooks/use-achievements";

function AchievementNotifications() {
  const { pending, pendingCount, claiming, claim, claimAll } =
    useAchievements();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pendingCount === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Prêmios de conquistas: ${pendingCount} pendente(s)`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted",
          open && "bg-muted"
        )}
      >
        <Gift className="h-4 w-4" />
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-success px-1 text-[10px] font-bold text-white"
          aria-hidden
        >
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="dialog"
            aria-label="Prêmios de conquistas"
            className="absolute right-0 top-10 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-3 shadow-floating"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Prêmios liberados
                </p>
                <p className="text-xs text-muted-foreground">
                  {pendingCount} conquista(s) aguardando resgate
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mb-3 max-h-64 space-y-2 overflow-y-auto">
              {pending.map((item) => (
                <li
                  key={item.codigo}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-card p-2"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-lg"
                    aria-hidden
                  >
                    {item.icone}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {item.nome}
                    </p>
                    <p className="text-[11px] font-medium text-success">
                      +{item.pontos} pts
                    </p>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={claiming === item.codigo}
                    onClick={() => claim(item.codigo)}
                    aria-label={`Pegar prêmio: ${item.nome}`}
                  >
                    {claiming === item.codigo ? "..." : "Pegar"}
                  </Button>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              size="sm"
              disabled={claiming === "*"}
              onClick={claimAll}
            >
              <Trophy data-icon="inline-start" />
              {claiming === "*"
                ? "Resgatando..."
                : `Pegar todos (+${pending.reduce((s, p) => s + p.pontos, 0)} pts)`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { AchievementNotifications, AchievementNotifications as achievementNotifications };
