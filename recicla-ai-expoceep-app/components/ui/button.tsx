import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:ring-inset",
        "bg-primary text-primary-foreground hover:bg-primary/90",
      ), "data-[state=active]": "bg-primary/30", "data-[state=hover]": "bg-primary/80", "data-[state=focus]": "bg-primary/40", "data-[state=disabled]": "opacity-50 pointer-events-none" },
      ref={ref}
    >
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button as button };