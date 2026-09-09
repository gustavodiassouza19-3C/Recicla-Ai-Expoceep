import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      className={cn("select-none text-sm font-medium text-foreground", "squircle", className)}
      ref={ref}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label, Label as label };
