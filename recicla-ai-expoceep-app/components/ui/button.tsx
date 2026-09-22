import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-success text-success-foreground border-2 border-success hover:bg-success/90 retro-shadow-sm retro-press",
  secondary:
    "bg-transparent text-foreground border-2 border-foreground/30 hover:bg-muted hover:border-foreground/50 retro-shadow-sm retro-press",
  ghost:
    "bg-transparent hover:bg-muted text-foreground border-2 border-transparent",
  destructive:
    "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 retro-shadow-sm retro-press",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, asChild = false, variant = "primary", disabled, ...props },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(
            "inline-flex items-center justify-center px-4 py-2",
            "text-sm font-bold uppercase tracking-wide transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
"disabled:bg-muted disabled:text-muted-foreground disabled:border-muted disabled:pointer-events-none disabled:cursor-not-allowed",
            "squircle",
            "retro-radius",
            variantStyles[variant],
            className
          )}
          {...props}
        />
      );
    }

    return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.button
        className={cn(
          "inline-flex items-center justify-center px-4 py-2",
          "text-sm font-bold uppercase tracking-wide transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:pointer-events-none",
          "squircle",
          "retro-radius",
          variantStyles[variant],
          className
        )}
        ref={ref}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1 }}
        whileTap={disabled ? undefined : { scale: 1 }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, Button as button };
