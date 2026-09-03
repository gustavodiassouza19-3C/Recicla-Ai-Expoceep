"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package, Leaf, Coins, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
  delay?: number;
  className?: string;
}

const iconVariants = {
  initial: { opacity: 0, scale: 0.8, rotate: -15 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.8, rotate: 15 },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  iconColor,
  iconBg,
  trend,
  delay = 0,
  className,
}: MetricCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", stiffness: 100, damping: 15, delay }}
      className={cn("group", className)}
    >
      <Card interactive={true} className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <motion.div
                variants={iconVariants}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0",
                  "transition-colors duration-300 group-hover:scale-105"
                )}
                style={{ backgroundColor: iconBg, color: iconColor }}
              >
                {icon}
              </motion.div>
              <div className="mt-4 space-y-1">
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.1, type: "spring", stiffness: 200, damping: 18 }}
                  className="text-body text-muted-foreground"
                >
                  {title}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.15, type: "spring", stiffness: 200, damping: 18 }}
                  className="text-display font-semibold tracking-tight text-foreground"
                >
                  {value}
                </motion.p>
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.2, type: "spring", stiffness: 200, damping: 18 }}
                    className="text-small text-muted-foreground"
                  >
                    {description}
                  </motion.p>
                )}
              </div>
            </div>
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.25, type: "spring", stiffness: 200, damping: 18 }}
                className={cn(
                  "flex flex-col items-end gap-1 text-right shrink-0",
                  "transition-opacity duration-300 group-hover:opacity-100 opacity-70"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium flex items-center gap-1",
                    trend.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.positive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4 rotate-180" />
                  )}
                  {trend.value}
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export const METRIC_ICONS = {
  saldoPontos: (
    <Coins className="h-6 w-6" />
  ),
  sacolasValidadas: (
    <Package className="h-6 w-6" />
  ),
  impactoCO2: (
    <Leaf className="h-6 w-6" />
  ),
};