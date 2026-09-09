"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ImpactCardProps extends React.HTMLAttributes<HTMLDivElement> {
  validatedTags?: number;
}

function TreeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--success)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22V12" />
      <path d="M12 12C12 12 8 9 8 6C8 3.5 10 2 12 3C12 3 12 1 12 1" />
      <path d="M12 9C12 9 16 6 16 3C16 0.5 14 -1 12 0" />
      <path d="M9 22h6" />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

const ImpactCard = React.forwardRef<HTMLDivElement, ImpactCardProps>(
  ({ className, validatedTags = 12, ...props }, ref) => {
    const trees = Math.floor(validatedTags * 0.004 * 100) / 100;
    const water = Math.floor(validatedTags * 8);

    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <TreeIcon />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground font-mono tabular-nums leading-none">
              {trees.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Arvores preservadas
            </span>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DropIcon />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground font-mono tabular-nums leading-none">
              {water} L
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Agua economizada
            </span>
          </div>
        </motion.div>
      </div>
    );
  }
);

ImpactCard.displayName = "ImpactCard";

export { ImpactCard, ImpactCard as impactCard };
