"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { X, Plus, Wifi } from "lucide-react";

interface NfcTag {
  id: number;
  codigo_nfc: string;
  status: string;
}

const statusLabels: Record<string, string> = {
  ativa: "disponivel",
  em_uso: "em uso",
  indisponivel: "indisponivel",
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

function NfcTagsCard({ className, onTagLinked }: { className?: string; onTagLinked?: () => void }) {
  const { user } = useAuth();
  const [tags, setTags] = useState<NfcTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagCode, setTagCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fetchTags() {
    supabase
      .from("tags")
      .select("id, codigo_nfc, status")
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data) setTags(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchTags();
  }, []);

  async function handleLink() {
    setError("");
    const code = tagCode.trim().toUpperCase();
    if (!code) {
      setError("Digite o codigo da tag.");
      return;
    }

    setSubmitting(true);

    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .select("id, status")
      .eq("codigo_nfc", code)
      .single();

    if (tagError || !tag) {
      setError("Tag nao encontrada.");
      setSubmitting(false);
      return;
    }

    if (tag.status === "em_uso") {
      setError("Esta tag ja esta em uso.");
      setSubmitting(false);
      return;
    }

    if (!user?.usuario_id) {
      setError("Usuario nao autenticado.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("reciclagens").insert({
      usuario_id: user.usuario_id,
      tag_id: tag.id,
      status: "pendente",
      data_entrega: new Date().toISOString(),
    });

    if (insertError) {
      setError("Erro ao vincular tag.");
      setSubmitting(false);
      return;
    }

    await supabase
      .from("tags")
      .update({ status: "em_uso" })
      .eq("id", tag.id);

    setTagCode("");
    setDialogOpen(false);
    fetchTags();
    setSubmitting(false);
    onTagLinked?.();
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <motion.div
        className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto scrollbar-minimal"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <p className="text-muted-foreground text-xs py-2">Carregando...</p>
        ) : tags.length === 0 ? (
          <p className="text-muted-foreground text-xs py-2">Nenhuma tag encontrada.</p>
        ) : (
          tags.map((tag) => (
            <motion.div
              key={tag.id}
              variants={itemVariants}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/30"
            >
              <Wifi className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground flex-1 truncate">
                {tag.codigo_nfc}
              </span>
              <Badge variant={tag.status === "ativa" ? "success" : tag.status === "em_uso" ? "warning" : "default"}>
                {statusLabels[tag.status] ?? tag.status}
              </Badge>
            </motion.div>
          ))
        )}
      </motion.div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2 text-xs gap-1.5"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        Vincular Nova Tag
      </Button>

      <AnimatePresence>
        {dialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => { setDialogOpen(false); setError(""); setTagCode(""); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Vincular Tag</h3>
                  <button
                    onClick={() => { setDialogOpen(false); setError(""); setTagCode(""); }}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Digite o codigo NFC da tag que deseja vincular a sua conta.
                </p>

                <Input
                  placeholder="Ex: A1B2C"
                  value={tagCode}
                  onChange={(e) => setTagCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleLink(); }}
                  autoFocus
                />

                {error && (
                  <p className="text-xs text-destructive mt-2">{error}</p>
                )}

                <Button
                  className="w-full mt-4"
                  onClick={handleLink}
                  disabled={submitting}
                >
                  {submitting ? "Vinculando..." : "Vincular"}
                </Button>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export { NfcTagsCard, NfcTagsCard as nfcTagsCard };
