import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn(
          "border-2 border-border bg-card text-card-foreground",
          "shadow-[3px_3px_0_theme(colors.border/40)]",
          className
        )}
        style={{ borderRadius: 2 }}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card, Card as card };
