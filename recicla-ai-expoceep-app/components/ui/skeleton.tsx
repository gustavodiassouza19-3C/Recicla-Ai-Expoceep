import * as React from "react";
import { cn } from "@/lib/utils";

export { cn };

export const skeleton = React.forwardRef<HTMLDivElement, React.AnimationOpacityProps>({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "rounded-md h-6 bg-background/50 animate-pulse",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

skeleton.displayName = "Skeleton";

export { skeleton };