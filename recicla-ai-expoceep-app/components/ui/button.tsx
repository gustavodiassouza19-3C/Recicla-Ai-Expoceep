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
    "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost:
    "bg-transparent hover:bg-muted text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
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
            "inline-flex items-center justify-center rounded-lg px-4 py-2",
            "text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:pointer-events-none",
            "squircle",
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
          "inline-flex items-center justify-center rounded-lg px-4 py-2",
          "text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "squircle",
          variantStyles[variant],
          className
        )}
        ref={ref}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, Button as button };
