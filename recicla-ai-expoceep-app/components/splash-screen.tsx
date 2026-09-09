"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PixelCard from "@/components/PixelCard";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const pixelCardEl = wrapperRef.current.querySelector("[class*='group']");
    if (pixelCardEl) {
      pixelCardEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    }
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-background"
        >
          <div ref={wrapperRef} className="w-full h-full">
            <PixelCard
              variant="blue"
              gap={10}
              speed={25}
              colors="#e0f2fe,#7dd3fc,#0ea5e9"
              noFocus={false}
              className="!w-full !h-full !rounded-none !aspect-auto !border-none"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Recicla Ai
                </h1>
                <p className="text-sm text-muted-foreground animate-pulse">
                  Carregando...
                </p>
              </div>
            </PixelCard>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
