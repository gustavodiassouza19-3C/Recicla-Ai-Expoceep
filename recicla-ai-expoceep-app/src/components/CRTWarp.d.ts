import type { CSSProperties, ReactElement } from "react";

export interface CRTWarpProps {
  color?: string;
  backgroundColor?: string;
  speed?: number;
  curvature?: number;
  scanlineStrength?: number;
  scanlineFrequency?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  bloom?: number;
  bloomRadius?: number;
  noise?: number;
  vignette?: number;
  brightness?: number;
  pixelation?: number;
  rgbShift?: number;
  mouseReact?: boolean;
  mouseStrength?: number;
  dpr?: number;
  fps?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
}

declare function CRTWarp(props: CRTWarpProps): ReactElement;

export default CRTWarp;
