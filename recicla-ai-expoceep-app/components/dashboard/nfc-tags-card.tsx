"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NfcTag {
  id: string;
  status: "disponivel" | "em-uso";
  lastUsed: string;
}

const mockTags: NfcTag[] = [
  { id: "001", status: "disponivel", lastUsed: "02/09/2026" },
  { id: "002", status: "em-uso", lastUsed: "28/08/2026" },
  { id: "003", status: "disponivel", lastUsed: "15/08/2026" },
];

const statusLabels: Record<NfcTag["status"], string> = {
  disponivel: "disponivel",
  "em-uso": "em uso",
};

function NfcIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted-foreground)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  );
}

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export interface NfcTagsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tags?: NfcTag[];
}

const NfcTagsCard = React.forwardRef<HTMLDivElement, NfcTagsCardProps>(
  ({ className, tags = mockTags, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col", className)} {...props}>
        <motion.div
          className="flex flex-col gap-2 max-h-[240px] overflow-y-auto scrollbar-minimal"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              variants={itemVariants}
              className="flex items-center gap-3 border-2 border-border/40 bg-card px-4 py-3 shadow-[2px_2px_0_theme(colors.border/20)]"
              style={{ borderRadius: 2 }}
            >
              <NfcIcon />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground">
                  Tag #{tag.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  Ultimo uso: {tag.lastUsed}
                </span>
              </div>
              <Badge variant={tag.status === "disponivel" ? "success" : "warning"}>
                {statusLabels[tag.status]}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
        <Button variant="ghost" className="w-full mt-3">
          Vincular Nova Tag
        </Button>
      </div>
    );
  }
);

NfcTagsCard.displayName = "NfcTagsCard";

export { NfcTagsCard, NfcTagsCard as nfcTagsCard };
