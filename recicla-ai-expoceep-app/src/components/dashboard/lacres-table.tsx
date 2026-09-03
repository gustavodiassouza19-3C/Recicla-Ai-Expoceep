"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { LACRE_STATUS_LABELS, LACRE_STATUS_VARIANTS } from "./types";
import type { Lacre, LacreStatus } from "./types";

interface LacresTableProps {
  lacres: Lacre[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const statusIcons: Record<LacreStatus, React.ReactNode> = {
  EM_USO: <Clock className="h-3.5 w-3.5" />,
  VALIDADO: <CheckCircle2 className="h-3.5 w-3.5" />,
  PONTUADO: <Package className="h-3.5 w-3.5" />,
  ASSOCIADO: <CheckCircle2 className="h-3.5 w-3.5" />,
};

const rowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0 },
};

export function LacresTable({ lacres, isLoading = false, onLoadMore, hasMore = false }: LacresTableProps) {
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof Lacre; direction: "asc" | "desc" } | null>({
    key: "dataAssociacao",
    direction: "desc",
  });

  const sortedLacres = React.useMemo(() => {
    if (!sortConfig) return lacres;
    return [...lacres].sort((a, b) => {
      const aVal = a[sortConfig.key] as string | number | Date | undefined;
      const bVal = b[sortConfig.key] as string | number | Date | undefined;
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [lacres, sortConfig]);

  const handleSort = (key: keyof Lacre) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: LacreStatus) => {
    const Label = LACRE_STATUS_LABELS[status];
    const variant = LACRE_STATUS_VARIANTS[status];
    return (
      <Badge variant={variant} className="gap-1.5">
        {statusIcons[status]}
        {Label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4" role="status" aria-label="Carregando lacres">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <Skeleton variant="rectangular" className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton variant="text" className="h-5 w-20" />
                    <Skeleton variant="text" className="h-5 w-24" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lacres.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<Package className="h-12 w-12 text-muted-foreground/40" />}
            title="Nenhum lacre encontrado"
            description="Associe seu primeiro lacre para começar a acumular pontos e acompanhar seu impacto ambiental."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-h3">Lacres Associados</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{lacres.length} lacre{lacres.length !== 1 ? "s" : ""}</span>
            {hasMore && <span className="text-muted-foreground/50">• Carregando mais...</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_80px_120px_140px_100px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider bg-muted/30">
            <button
              onClick={() => handleSort("codigo")}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors text-left"
            >
              Código
              {sortConfig?.key === "codigo" && (
                sortConfig.direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => handleSort("pontos")}
              className="flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
            >
              Pontos
              {sortConfig?.key === "pontos" && (
                sortConfig.direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => handleSort("status")}
              className="flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
            >
              Status
              {sortConfig?.key === "status" && (
                sortConfig.direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => handleSort("dataAssociacao")}
              className="flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
            >
              Associado em
              {sortConfig?.key === "dataAssociacao" && (
                sortConfig.direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            <span>Validação</span>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="divide-y divide-border/40"
            >
              {sortedLacres.map((lacre, index) => (
                <motion.div
                  key={lacre.id}
                  variants={rowVariants}
                  custom={index}
                  className="md:grid grid-cols-[1fr_80px_120px_140px_100px] gap-4 px-4 py-4 items-center transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-medium text-foreground truncate">{lacre.codigo}</p>
                      <p className="text-xs text-muted-foreground">+{lacre.pontos} pts</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <span className="font-medium tabular-nums text-foreground">{lacre.pontos}</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-center">
                    {getStatusBadge(lacre.status)}
                  </div>

                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(lacre.dataAssociacao)}</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-center">
                    {lacre.dataValidacao ? (
                      <span className="text-sm text-success font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {formatDate(lacre.dataValidacao)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Aguardando
                      </span>
                    )}
                  </div>

                  <div className="md:hidden flex flex-col gap-3 w-full pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pontos</span>
                      <span className="font-medium tabular-nums">{lacre.pontos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(lacre.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Associado em</span>
                      <span className="text-sm text-muted-foreground">{formatDate(lacre.dataAssociacao)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Validação</span>
                      {lacre.dataValidacao ? (
                        <span className="text-sm text-success font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {formatDate(lacre.dataValidacao)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Aguardando
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {hasMore && onLoadMore && (
            <div className="p-4 border-t border-border/40">
              <Button
                variant="outline"
                className="w-full"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Carregar mais lacres"
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}