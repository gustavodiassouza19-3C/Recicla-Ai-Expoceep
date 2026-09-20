"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "animejs";
import { calculateEnvironmentalImpact } from "@/lib/environmental-factors";

interface ImpactCardProps extends React.HTMLAttributes<HTMLDivElement> {
  householdSize?: number;
}

function TreeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 22H7" />
      <path d="M12 22V14" />
      <path d="M12 14C12 14 7 11 7 7C7 4 9 2 12 3" />
      <path d="M12 11C12 11 17 8 17 4C17 1 15 -1 12 1" />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.15 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

const ImpactCard = React.forwardRef<HTMLDivElement, ImpactCardProps>(
  ({ className, householdSize = 1, ...props }, ref) => {
    const impact = calculateEnvironmentalImpact(householdSize);
    const co2Ref = useRef<HTMLSpanElement>(null);
    const waterRef = useRef<HTMLSpanElement>(null);
    const treesRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (co2Ref.current) {
        const obj = { val: 0 };
        animate(obj, {
          val: impact.co2,
          duration: 1800,
          ease: "outExpo",
          onUpdate: () => {
            if (co2Ref.current) co2Ref.current.textContent = `${obj.val.toFixed(2).replace(".", ",")} kg`;
          },
        });
      }
      if (waterRef.current) {
        const obj = { val: 0 };
        animate(obj, {
          val: impact.water,
          duration: 1800,
          ease: "outExpo",
          onUpdate: () => {
            if (waterRef.current) waterRef.current.textContent = `${obj.val.toFixed(1).replace(".", ",")} L`;
          },
        });
      }
      if (treesRef.current) {
        const obj = { val: 0 };
        animate(obj, {
          val: impact.trees,
          duration: 1800,
          ease: "outExpo",
          onUpdate: () => {
            if (treesRef.current) treesRef.current.textContent = obj.val.toFixed(3).replace(".", ",");
          },
        });
      }
    }, [impact.co2, impact.water, impact.trees]);

    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        {/* CO₂ */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50">
            <CloudIcon />
          </div>
          <div className="flex flex-col">
            <span ref={co2Ref} className="text-xl font-bold text-foreground font-mono tabular-nums leading-none">
              0,00 kg
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              CO₂e estimado
            </span>
          </div>
        </div>

        {/* Água */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-oklch(0.55 0.15 250 / 0.1)">
            <DropIcon />
          </div>
          <div className="flex flex-col">
            <span ref={waterRef} className="text-xl font-bold text-foreground font-mono tabular-nums leading-none">
              0,0 L
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              de água economizada
            </span>
          </div>
        </div>

        {/* Árvores */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10">
            <TreeIcon />
          </div>
          <div className="flex flex-col">
            <span ref={treesRef} className="text-xl font-bold text-foreground font-mono tabular-nums leading-none">
              0,000
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              árvores equivalentes
            </span>
          </div>
        </div>

        <p className="text-[9px] text-muted-foreground/60 mt-1">
          Estimativa calculada com base no número de moradores informado no cadastro.
        </p>
      </div>
    );
  }
);

ImpactCard.displayName = "ImpactCard";

export { ImpactCard, ImpactCard as impactCard };
