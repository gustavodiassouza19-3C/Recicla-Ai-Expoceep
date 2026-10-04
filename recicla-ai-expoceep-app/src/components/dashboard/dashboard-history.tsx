"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Recycle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchHistory } from "@/lib/api";

interface HistoryEntry {
  id: number;
  tag_codigo: string;
  data_entrega: string;
  status: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
} as const;

const item = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

interface DashboardHistoryProps {
  /** Muda quando uma tag e vinculada: recarrega sem precisar de F5. */
  refreshKey?: number;
}

function DashboardHistory({ refreshKey = 0 }: DashboardHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchHistory()
      .then((rows) => {
        if (cancelled) return;
        setHistory(
          rows.slice(0, 5).map((entry) => ({
            id: entry.id,
            tag_codigo: entry.tags?.[0]?.codigo_nfc ?? "---",
            data_entrega: entry.data_entrega,
            status: entry.status,
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setHistory([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/10">
          <Clock className="h-2.5 w-2.5 text-success" />
        </div>
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Historico Recente
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex items-center gap-3 py-4">
          <Recycle className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            Nenhum registro. Vincule uma tag para comecar.
          </p>
        </div>
      ) : (
        <motion.div
          className="flex flex-col gap-1"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {history.map((entry) => (
            <motion.div key={entry.id} variants={item}>
              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-muted/30 border border-border/20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Recycle className="h-2.5 w-2.5 text-success shrink-0" />
                  <span className="text-[11px] font-medium text-foreground truncate">
                    {entry.tag_codigo}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(entry.data_entrega).toLocaleDateString("pt-BR")}
                  </span>
                  <Badge
                    variant={entry.status === "validada" ? "success" : "warning"}
                    className="text-[8px] px-1 py-0"
                  >
                    {entry.status}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export { DashboardHistory, DashboardHistory as dashboardHistory };
