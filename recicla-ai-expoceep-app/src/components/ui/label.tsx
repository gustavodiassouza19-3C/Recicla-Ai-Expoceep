"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  disableMotion?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, disableMotion = false, children, ...props }, ref) => {
    const baseClassName = cn(
      "text-sm font-medium text-foreground",
      "transition-colors duration-150",
      className
    );

    if (disableMotion) {
      return <label className={baseClassName} ref={ref} {...props}>{children}</label>;
    }

    return (
      // @ts-expect-error - Framer Motion event handler types conflict with React native types
      <motion.label
        className={baseClassName}
        ref={ref}
        {...props}
        whileHover={{ color: "var(--primary)", transition: { type: "spring" as const, stiffness: 300, damping: 18 } }}
      >
        {children}
      </motion.label>
    );
  }
);
Label.displayName = "Label";

export { Label };