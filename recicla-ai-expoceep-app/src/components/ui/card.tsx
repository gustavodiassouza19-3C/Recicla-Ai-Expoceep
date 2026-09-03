"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; disableMotion?: boolean };

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, disableMotion = false, ...props }, ref) => {
    const baseClassName = cn(
      "rounded-2xl border border-border/40 bg-card text-card-foreground shadow-elevation-2",
      interactive && "cursor-pointer",
      className
    );

    if (disableMotion || !interactive) {
      return <div ref={ref} className={baseClassName} {...props} />;
    }

    const motionProps = {
      whileHover: { y: -4, boxShadow: "var(--shadow-elevation-3)", transition: { type: "spring" as const, stiffness: 350, damping: 18 } },
      whileTap: { y: 0, boxShadow: "var(--shadow-elevation-2)", transition: { type: "spring" as const, stiffness: 400, damping: 17 } },
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    } as const;

    return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.div
        ref={ref}
        className={baseClassName}
        {...props}
        {...motionProps}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-h3 font-semibold tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-body text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };