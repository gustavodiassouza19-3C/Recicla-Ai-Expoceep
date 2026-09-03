"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  disableMotion?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, disableMotion = false, ...props }, ref) => {
    const baseClassName = cn(
      "shrink-0 bg-border/40",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      "transition-opacity duration-200",
      className
    );

    const motionProps = {
      initial: { opacity: 0, scaleX: 0, scaleY: 0 },
      animate: { opacity: 1, scaleX: 1, scaleY: 1 },
      transition: { type: "spring" as const, stiffness: 200, damping: 20 },
    } as const;

    if (disableMotion) {
      return (
        <div
          ref={ref}
          className={baseClassName}
          role={decorative ? "none" : "separator"}
          aria-orientation={orientation}
          {...props}
        />
      );
    }

    return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.div
        ref={ref}
        className={baseClassName}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation}
        {...props}
        {...motionProps}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };