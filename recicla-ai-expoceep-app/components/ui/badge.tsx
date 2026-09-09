import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", "bg-primary/10 text-primary", className), "data-[state=active]": "bg-primary/30", "data-[state=hover]": "bg-primary/80", "data-[state=focus]": "bg-primary/40" },
      ref={ref}
    >
      {children}
    </Comp>
  );
});

Badge.displayName = "Badge";

export { Badge as badge };