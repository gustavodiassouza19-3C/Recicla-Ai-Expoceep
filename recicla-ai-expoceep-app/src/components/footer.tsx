"use client";

import { usePathname } from "next/navigation";

function Footer() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register" || pathname === "/admin-dashboard") return null;

  return <footer className="border-t border-border bg-background/80 backdrop-blur-md" />;
}

export { Footer, Footer as footer };