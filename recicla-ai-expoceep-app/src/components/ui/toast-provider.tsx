"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="system"
      className="toaster-group"
      toastOptions={{
        classNames: {
          toast: "group rounded-2xl border border-border/40 bg-card text-card-foreground shadow-elevation-3 p-4 min-w-[320px] max-w-md",
          description: "text-body text-muted-foreground",
          actionButton: "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
          cancelButton: "rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
          closeButton: "text-muted-foreground hover:text-foreground transition-colors",
        },
      }}
    />
  );
}