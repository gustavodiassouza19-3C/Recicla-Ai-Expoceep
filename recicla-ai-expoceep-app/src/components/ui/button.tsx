"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-elevation-1 hover:shadow-elevation-2 border border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground shadow-elevation-1 hover:shadow-elevation-2 border border-transparent",
        outline:
          "bg-background text-foreground border border-border shadow-elevation-1 hover:bg-muted hover:shadow-elevation-1",
        secondary:
          "bg-secondary text-secondary-foreground shadow-elevation-1 hover:bg-secondary/80 hover:shadow-elevation-1 border border-transparent",
        ghost: "bg-transparent hover:bg-muted hover:shadow-elevation-1 border border-transparent",
        link: "bg-transparent text-primary underline-offset-4 hover:underline border border-transparent",
        success:
          "bg-success text-success-foreground shadow-elevation-1 hover:shadow-elevation-2 border border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl text-sm",
        sm: "h-9 px-3 rounded-lg text-xs",
        lg: "h-11 px-8 rounded-2xl text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const motionHover = { scale: 1.02, y: -1, transition: { type: "spring" as const, stiffness: 400, damping: 17 } };
const motionTap = { scale: 0.98, transition: { type: "spring" as const, stiffness: 400, damping: 17 } };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  disableMotion?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disableMotion = false, ...props }, ref) => {
    const baseClassName = cn(buttonVariants({ variant, size, className }));

    if (disableMotion) {
      const Comp = asChild ? Slot : "button";
      return <Comp className={baseClassName} ref={ref} {...props} />;
    }

    return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.button
        className={baseClassName}
        ref={ref}
        {...props}
        whileHover={motionHover}
        whileTap={motionTap}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };