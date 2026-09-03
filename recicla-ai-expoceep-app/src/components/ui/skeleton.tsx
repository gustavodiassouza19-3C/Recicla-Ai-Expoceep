"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  disableMotion?: boolean;
}

function Skeleton({
  className,
  variant = "text",
  width,
  height,
  disableMotion = false,
  ...props
}: SkeletonProps) {
  const baseClassName = cn("skeleton-shimmer bg-muted", {
    "rounded-xl": variant !== "circular",
    "rounded-full": variant === "circular",
    "h-4 w-full max-w-xs": variant === "text",
    "h-10 w-10": variant === "circular",
  }, className);

  const style = {
    width: width ?? undefined,
    height: height ?? undefined,
  } as React.CSSProperties;

  if (disableMotion) {
    return <div className={baseClassName} style={style} {...props} />;
  }

  const motionProps = {
    initial: { opacity: 0.4 },
    animate: { opacity: [0.4, 1, 0.4] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
  } as const;

  return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.div className={baseClassName} style={style} {...props} {...motionProps} />
    );
}

export { Skeleton };