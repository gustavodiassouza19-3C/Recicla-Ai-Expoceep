"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-0.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent hover:bg-primary/90 shadow-elevation-1",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80 shadow-elevation-1",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/90 shadow-elevation-1",
        outline:
          "bg-transparent text-foreground border-border hover:bg-muted shadow-elevation-1",
        success:
          "bg-success/15 text-success border-success/30 hover:bg-success/25 shadow-elevation-1",
        warning:
          "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25 shadow-elevation-1",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  disableMotion?: boolean;
}

function Badge({ className, variant, size, disableMotion = false, ...props }: BadgeProps) {
  const baseClassName = cn(badgeVariants({ variant, size, className }));

  if (disableMotion) {
    return <div className={baseClassName} {...props} />;
  }

  const motionProps = {
    whileHover: { scale: 1.03, transition: { type: "spring" as const, stiffness: 400, damping: 17 } },
    whileTap: { scale: 0.97, transition: { type: "spring" as const, stiffness: 400, damping: 17 } },
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  } as const;

  return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.div className={baseClassName} {...props} {...motionProps} />
    );
}

export { Badge, badgeVariants };