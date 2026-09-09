import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("h-6 rounded-md bg-background/50 animate-pulse", className)}
      ref={ref}
      {...props}
    />
  );
});

Skeleton.displayName = "Skeleton";

export { Skeleton, Skeleton as skeleton };
