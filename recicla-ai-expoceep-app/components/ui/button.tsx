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
    "bg-success text-success-foreground border-2 border-success hover:bg-success/90 shadow-[2px_2px_0_theme(colors.success/30)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
  secondary:
    "bg-transparent text-foreground border-2 border-foreground/30 hover:bg-muted hover:border-foreground/50 shadow-[2px_2px_0_theme(colors.foreground/10)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
  ghost:
    "bg-transparent hover:bg-muted text-foreground border-2 border-transparent",
  destructive:
    "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 shadow-[2px_2px_0_theme(colors.destructive/30)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
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
            "disabled:opacity-40 disabled:pointer-events-none",
            "squircle",
            variantStyles[variant],
            className
          )}
          style={{ borderRadius: 2 }}
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
          variantStyles[variant],
          className
        )}
        style={{ borderRadius: 2 }}
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
