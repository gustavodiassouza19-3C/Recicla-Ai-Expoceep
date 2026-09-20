"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SquiCircleFilterProps extends React.SVGProps<SVGSVGElement> {
  blurValue?: number;
  colorMatrixValue?: number;
  alphaValue?: number;
}

const SquiCircleFilter = React.forwardRef<SVGSVGElement, SquiCircleFilterProps>(
  (
    {
      className,
      blurValue = 10,
      colorMatrixValue = 20,
      alphaValue = -7,
      ...props
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        className={cn("absolute bottom-0 left-0", className)}
        version="1.1"
        {...props}
      >
        <defs>
          <filter id="SquiCircleFilter">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blurValue}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${colorMatrixValue} ${alphaValue}`}
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    );
  }
);

SquiCircleFilter.displayName = "SquiCircleFilter";

export { SquiCircleFilter, SquiCircleFilter as squiCircleFilter };
