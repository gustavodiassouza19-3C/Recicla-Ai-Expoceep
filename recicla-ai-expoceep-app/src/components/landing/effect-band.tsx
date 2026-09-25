"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import CRTWarp from "@/components/CRTWarp";

const LIGHT_BG = "#f9f6f2";
const DARK_BG = "#0a0a0a";
const LIGHT_ACCENT = "#b9c7a8";
const DARK_ACCENT = "#779256";

export function EffectBand({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ opacity: dark ? 0.55 : 0.45 }}
      >
        <CRTWarp
          color={dark ? DARK_ACCENT : LIGHT_ACCENT}
          backgroundColor={dark ? DARK_BG : LIGHT_BG}
          speed={0.12}
          brightness={1}
          bloom={0.4}
          noise={0.02}
          rgbShift={0.004}
          scanlineStrength={0.08}
          waveAmplitude={0.24}
          waveFrequency={4}
          vignette={0.85}
          mouseReact={false}
          fps={30}
          dpr={1}
          paused={reduceMotion === true}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
