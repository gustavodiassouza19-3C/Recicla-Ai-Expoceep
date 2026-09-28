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
  const [style, setStyle] = useState<VisualStyle>(() => {
    if (typeof window === "undefined") return "retro";
    return localStorage.getItem("visual-style") === "moderno" ? "moderno" : "retro";
  });

  useEffect(() => {
    applyStyle(style);
  }, [style]);

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
