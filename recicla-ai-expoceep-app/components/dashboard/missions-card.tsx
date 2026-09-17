"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { animate, stagger } from "animejs";

interface Mission {
  id: string;
  name: string;
  description: string;
  current: number;
  target: number;
  reward: number;
  completed: boolean;
}

const mockMissions: Mission[] = [
  {
    id: "1",
    name: "Recicle 5 vezes este mes",
    description: "Entregue 5 sacolas reciclaveis",
    current: 3,
    target: 5,
    reward: 50,
    completed: false,
  },
  {
    id: "2",
    name: "Use 3 tags diferentes",
    description: "Vincule e use 3 tags NFC",
    current: 1,
    target: 3,
    reward: 30,
    completed: false,
  },
  {
    id: "3",
    name: "Primeira entrega do mes",
    description: "Faca sua primeira reciclagem",
    current: 1,
    target: 1,
    reward: 20,
    completed: true,
  },
];

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--success)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export interface MissionsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  missions?: Mission[];
}

const MissionsCard = React.forwardRef<HTMLDivElement, MissionsCardProps>(
  ({ className, missions = mockMissions, ...props }, ref) => {
    const progressRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
      const bars = progressRefs.current.filter(Boolean);
      if (bars.length === 0) return;
      bars.forEach((bar, i) => {
        const target = bar.dataset.target || "0%";
        animate(bar, {
          width: target,
          duration: 1200,
          delay: i * 150,
          ease: "outExpo",
        });
      });
    }, [missions]);

    return (
      <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
        <motion.div
          className="flex flex-col gap-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              variants={itemVariants}
              className="flex flex-col gap-2 border-2 border-border/40 bg-card px-4 py-3 shadow-[2px_2px_0_theme(colors.border/20)]"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground truncate">
                  {mission.name}
                </span>
                <Badge>+{mission.reward} pts</Badge>
              </div>

              <span className="text-xs text-muted-foreground">
                {mission.description}
              </span>

              {mission.completed ? (
                <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                  <CheckIcon />
                  <span>Concluida</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 bg-muted overflow-hidden border border-border/40" style={{ borderRadius: 2 }}>
                    <div
                      ref={(el: HTMLDivElement | null) => { if (el) progressRefs.current[index] = el; }}
                      data-target={`${(mission.current / mission.target) * 100}%`}
                      className="h-full bg-success"
                      style={{ width: "0%", borderRadius: 2 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mission.current}/{mission.target}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }
);

MissionsCard.displayName = "MissionsCard";

export { MissionsCard, MissionsCard as missionsCard };
