"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AddTagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTagDialog({ isOpen, onClose, onSuccess }: AddTagDialogProps) {
  const [codigoNfc, setCodigoNfc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoNfc.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { addTag } = await import("@/lib/api");
      await addTag({ codigo_nfc: codigoNfc.trim().toUpperCase() });
      setCodigoNfc("");
      onSuccess?.();
      onClose();
    } catch {
      setError("Erro ao adicionar tag. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className={cn(
                "bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-lg",
                "retro-radius"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                  Adicionar Tag NFC
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">
                    Codigo NFC
                  </Label>
                  <Input
                    type="text"
                    placeholder="Ex: A1B2C"
                    value={codigoNfc}
                    onChange={(e) => setCodigoNfc(e.target.value.toUpperCase())}
                    className="bg-background text-foreground"
                    maxLength={10}
                    required
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={onClose}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || !codigoNfc.trim()}
                  >
                    {loading ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}