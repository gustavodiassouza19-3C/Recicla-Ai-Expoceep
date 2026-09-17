"use client";

import { useState, useEffect } from "react";

type VisualStyle = "retro" | "moderno";

function applyStyle(style: VisualStyle) {
  if (style === "retro") {
    document.documentElement.classList.add("style-retro");
  } else {
    document.documentElement.classList.remove("style-retro");
  }
}

export function useVisualStyle() {
  const [style, setStyle] = useState<VisualStyle>("moderno");

  useEffect(() => {
    const stored = localStorage.getItem("visual-style") as VisualStyle | null;
    const initial = stored === "retro" || stored === "moderno" ? stored : "moderno";
    setStyle(initial);
    applyStyle(initial);
  }, []);

  const toggleStyle = () => {
    const next: VisualStyle = style === "retro" ? "moderno" : "retro";
    setStyle(next);
    localStorage.setItem("visual-style", next);
    applyStyle(next);
  };

  return { style, toggleStyle };
}
