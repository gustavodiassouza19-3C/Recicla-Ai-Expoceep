import * as React from "react";
import { cn } from "@/lib/utils";

export { cn };

export const input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 pr-8 file:text-fileicon file:pointer-events-none file:select-none outline-none placeholder-[placeholder]:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-disabled disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

input.displayName = "Input";

export { input };