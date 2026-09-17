"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { animate, stagger } from "animejs";

interface HistoryEntry {
  id: string;
  attachedAt: string;
  status: "validada" | "pendente";
  validatedAt: string | null;
  location: string | null;
}

const mockHistory: HistoryEntry[] = [
  {
    id: "1",
    attachedAt: "02/09/2026",
    status: "validada",
    validatedAt: "03/09/2026",
    location: "Eco ponto Centro",
  },
  {
    id: "2",
    attachedAt: "28/08/2026",
    status: "validada",
    validatedAt: "29/08/2026",
    location: "Reciclagem Bairro Novo",
  },
  {
    id: "3",
    attachedAt: "20/08/2026",
    status: "pendente",
    validatedAt: null,
    location: null,
  },
  {
    id: "4",
    attachedAt: "15/08/2026",
    status: "validada",
    validatedAt: "16/08/2026",
    location: "Cooperativa Verde Viva",
  },
  {
    id: "5",
    attachedAt: "10/08/2026",
    status: "pendente",
    validatedAt: null,
    location: null,
  },
  {
    id: "6",
    attachedAt: "05/08/2026",
    status: "validada",
    validatedAt: "06/08/2026",
    location: "Eco ponto Sul",
  },
  {
    id: "7",
    attachedAt: "01/08/2026",
    status: "validada",
    validatedAt: "02/08/2026",
    location: "Reciclagem Industrial",
  },
];

const statusStyles: Record<HistoryEntry["status"], string> = {
  validada: "bg-success/10 text-success",
  pendente: "bg-warning/10 text-warning",
};

function MapPinIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export interface HistoryListProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: HistoryEntry[];
}

const HistoryList = React.forwardRef<HTMLDivElement, HistoryListProps>(
  ({ className, data = mockHistory, ...props }, ref) => {
    const itemsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
      const items = itemsRef.current.filter(Boolean);
      if (items.length === 0) return;
      animate(items, {
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 500,
        delay: stagger(80),
        ease: "outExpo",
      });
    }, [data]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-full",
          "[mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]",
          className
        )}
        {...props}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2 p-4">
            {data.map((entry, index) => (
              <div
                key={entry.id}
                ref={(el) => { if (el) itemsRef.current[index] = el; }}
                className="flex flex-col gap-2 retro-border-item retro-shadow-sm retro-radius bg-card px-4 py-3 opacity-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarIcon />
                    <span className="text-xs font-medium text-foreground truncate">
                      {entry.attachedAt}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border retro-radius",
                      entry.status === "validada" ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"
                    )}
                  >
                    {entry.status}
                  </span>
                </div>

                {entry.status === "validada" && entry.validatedAt && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Anotada em {entry.validatedAt}</span>
                  </div>
                )}

                {entry.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPinIcon />
                    <span className="truncate">{entry.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

HistoryList.displayName = "HistoryList";

export { HistoryList, HistoryList as historyList };
