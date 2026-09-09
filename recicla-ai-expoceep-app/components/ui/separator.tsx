import * as React from "react";
import { cn } from "@/lib/utils";

export { cn };

export const separator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>({ className, ...props }, ref) => {
  return (
    <hr
      className={cn("my-4 border-t border-border", className)}
      ref={ref}
      {...props}
    />
  );
});

separator.displayName = "Separator";

export { separator };