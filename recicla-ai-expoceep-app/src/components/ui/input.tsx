"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disableMotion?: boolean;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disableMotion = false, error, ...props }, ref) => {
    const baseClassName = cn(
      "flex h-10 w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm",
      "placeholder:text-muted-foreground/60",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-[border-color,box-shadow] duration-150",
      error && "border-destructive focus-visible:ring-destructive/30",
      className
    );

    if (disableMotion) {
      return <input type={type} className={baseClassName} ref={ref} {...props} />;
    }

    return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.input
        type={type}
        className={baseClassName}
        ref={ref}
        {...props}
        whileHover={{ boxShadow: "var(--shadow-elevation-1)", transition: { type: "spring" as const, stiffness: 300, damping: 18 } }}
        whileFocus={{ boxShadow: "var(--shadow-elevation-2)", scale: 1.005, transition: { type: "spring" as const, stiffness: 400, damping: 17 } }}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };