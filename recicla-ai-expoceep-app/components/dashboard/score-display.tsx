"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  score?: number;
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
  ({ className, score = 420, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-4", className)}
        {...props}
      >
        <CoinPlantIcon />
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            Pontuacao total
          </span>
          <span className="text-3xl font-bold text-foreground font-mono tabular-nums leading-none mt-1">
            {score.toLocaleString()}
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
