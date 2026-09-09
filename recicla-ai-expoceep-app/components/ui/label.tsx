import * as React from "react";
import { cn } from "@/lib/utils";

export { cn };

export const label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>({ className, ...props }, ref) => {
  return (
    <label
      className={cn("flex h-10 w-full select-none cursor-pointer", className)}
      ref={ref}
      {...props}
    />
  );
});

label.displayName = "Label";

export { label };