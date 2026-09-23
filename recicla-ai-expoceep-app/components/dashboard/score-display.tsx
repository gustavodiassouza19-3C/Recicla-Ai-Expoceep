"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "animejs";

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  score?: number;
  loading?: boolean;
}

function CoinPlantIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <circle cx="20" cy="20" r="18" fill="var(--primary)" fillOpacity={0.12} />
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeOpacity={0.3}
      />
      <circle cx="20" cy="20" r="14" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity={0.15} />
      <path
        d="M20 28V20"
        stroke="var(--success)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 22C20 22 16 20 16 17C16 14.5 18 13 20 14C20 14 20 12 20 12"
        stroke="var(--success)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 19C20 19 24 17 24 14C24 11.5 22 10 20 11"
        stroke="var(--success)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M17 28C17 28 18.5 26 20 26C21.5 26 23 28 23 28"
        stroke="var(--success)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
  ({ className, score = 0, loading = false, ...props }, ref) => {
    const scoreRef = useRef<HTMLSpanElement>(null);
    const lastAnimated = useRef(0);

    useEffect(() => {
      if (!scoreRef.current) return;

      if (loading) {
        scoreRef.current.textContent = "…";
        return;
      }

      if (score === lastAnimated.current) {
        scoreRef.current.textContent = score.toLocaleString("pt-BR");
        return;
      }

      const from = lastAnimated.current;
      lastAnimated.current = score;
      const el = scoreRef.current;
      const obj = { val: from };

      if (from === score) {
        el.textContent = score.toLocaleString("pt-BR");
        return;
      }

      animate(obj, {
        val: score,
        duration: 1500,
        ease: "outExpo",
        onUpdate: () => {
          if (el) el.textContent = Math.round(obj.val).toLocaleString("pt-BR");
        },
        onComplete: () => {
          if (el) el.textContent = score.toLocaleString("pt-BR");
        },
      });
    }, [score, loading]);

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-4", className)}
        {...props}
      >
        <CoinPlantIcon />
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Pontuacao total
          </span>
          <span
            ref={scoreRef}
            className="text-3xl font-bold text-success font-mono tabular-nums leading-none mt-1"
          >
            {loading ? "…" : score.toLocaleString("pt-BR")}
          </span>
          <span className="text-[11px] text-muted-foreground mt-1">
            pontos acumulados
          </span>
        </div>
      </div>
    );
  }
);

ScoreDisplay.displayName = "ScoreDisplay";

export { ScoreDisplay, ScoreDisplay as scoreDisplay };
