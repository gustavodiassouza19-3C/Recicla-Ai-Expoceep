"use client";

import { useState, useEffect, useCallback } from "react";

type VisualStyle = "retro" | "moderno";

function applyStyle(style: VisualStyle) {
  if (style === "retro") {
    document.documentElement.classList.add("style-retro");
  } else {
    document.documentElement.classList.remove("style-retro");
  }
}

export function useVisualStyle() {
  const [style, setStyle] = useState<VisualStyle>("retro");

  useEffect(() => {
    const stored = localStorage.getItem("visual-style");
    const initial: VisualStyle = stored === "moderno" ? "moderno" : "retro";
    setStyle(initial);
    applyStyle(initial);
  }, []);

  const toggleStyle = useCallback(() => {
    setStyle((prev) => {
      const next: VisualStyle = prev === "retro" ? "moderno" : "retro";
      localStorage.setItem("visual-style", next);
      applyStyle(next);
      return next;
    });
  }, []);

  return { style, toggleStyle };
}
