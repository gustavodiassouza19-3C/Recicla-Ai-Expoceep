"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  icone: string;
  nome: string;
  pontos: number;
  desbloqueada: boolean;
  progresso?: number;
  total?: number;
  onClick?: () => void;
}

function AchievementBadge({
  icone,
  nome,
  pontos,
  desbloqueada,
  progresso,
  total,
  onClick,
}: AchievementBadgeProps) {
  const progressPercent =
    progresso !== undefined && total !== undefined && total > 0
      ? Math.min((progresso / total) * 100, 100)
      : desbloqueada
        ? 100
        : 0;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors w-full text-center",
        desbloqueada
          ? "border-success/50 bg-success/5 hover:bg-success/10"
          : "border-border/50 bg-muted/30 opacity-60 hover:opacity-80"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-xl",
          desbloqueada ? "bg-success/15" : "bg-muted grayscale"
        )}
      >
        {icone}
      </div>

      <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
        {nome}
      </p>

      <p className="text-[10px] text-muted-foreground font-semibold">
        +{pontos} pts
      </p>

      {!desbloqueada && progresso !== undefined && total !== undefined && (
        <div className="w-full">
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-success/60"
            />
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {progresso}/{total}
          </p>
        </div>
      )}

      {desbloqueada && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success text-[8px] text-white font-bold">
          ✓
        </div>
      )}
    </motion.button>
  );
}

export { AchievementBadge, AchievementBadge as achievementBadge };
