"use client";

import { MotionConfig } from "framer-motion";

function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export { MotionProvider, MotionProvider as motionProvider };
