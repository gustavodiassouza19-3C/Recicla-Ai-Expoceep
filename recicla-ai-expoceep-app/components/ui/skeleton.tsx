import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted", "squircle", className)}
      ref={ref}
      {...props}
    />
  );
});

Skeleton.displayName = "Skeleton";

export { Skeleton, Skeleton as skeleton };
