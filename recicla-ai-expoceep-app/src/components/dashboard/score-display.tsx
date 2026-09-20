"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "animejs";

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  score?: number;
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 40 40"
      fill="none"
      className={cn("md:w-10 md:h-10 shrink-0", className)}
    >
      <circle cx="20" cy="20" r="18" fill="var(--success)" fillOpacity={0.08} />
      <circle cx="20" cy="20" r="18" stroke="var(--success)" strokeWidth="1.5" strokeOpacity={0.2} />
      <path d="M20 30V22" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 22C20 22 15 19 15 15C15 12 17 10 20 12" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 20C20 20 25 17 25 13C25 10 23 8 20 10" stroke="var(--success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
  ({ className, score = 0, ...props }, ref) => {
    const scoreRef = useRef<HTMLSpanElement>(null);
    const animated = useRef(false);

    useEffect(() => {
      if (!scoreRef.current || score === 0) return;
      if (animated.current) {
        scoreRef.current.textContent = score.toLocaleString("pt-BR");
        return;
      }
      animated.current = true;
      const el = scoreRef.current;
      const obj = { val: 0 };
      animate(obj, {
        val: score,
        duration: 1500,
        ease: "outExpo",
        onUpdate: () => {
          if (el) el.textContent = Math.round(obj.val).toLocaleString("pt-BR");
        },
      });
    }, [score]);

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 md:gap-3", className)}
        {...props}
      >
        <SproutIcon />
        <div className="flex flex-col">
          <span className="text-[9px] md:text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Pontuacao total
          </span>
          <span ref={scoreRef} className="text-xl md:text-3xl font-bold text-success font-mono tabular-nums leading-none mt-0.5 md:mt-1">
            0
          </span>
          <span className="text-[9px] md:text-[11px] text-muted-foreground mt-0.5 md:mt-1">
            pontos acumulados
          </span>
        </div>
      </div>
    );
  }
);

ScoreDisplay.displayName = "ScoreDisplay";

export { ScoreDisplay, ScoreDisplay as scoreDisplay };
