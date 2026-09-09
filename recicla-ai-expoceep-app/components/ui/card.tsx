import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn("rounded-lg border border-border bg-card p-6", "data-[state=hover]": "bg-card/80"}, className)
      ref={ref}
    >
      {children}
    </Comp>
  );
});

Card.displayName = "Card";

export { Card as card };