"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssociarLacreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssociarLacreModal({ isOpen, onClose, onSuccess }: AssociarLacreModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormKey((k) => k + 1);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const codigo = formData.get("codigo") as string;
    
    if (!codigo?.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const isValid = /^LAC-\d{6}-[A-Z]{3}$/.test(codigo.trim().toUpperCase());
      
      if (!isValid) {
        throw new Error("Código inválido. Formato esperado: LAC-123456-ABC");
      }

      setSuccess(true);
      toast.success("Lacre associado com sucesso!", {
        description: `Código ${codigo.toUpperCase()} foi vinculado à sua conta.`,
      });
      onSuccess?.();
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao associar lacre");
      toast.error("Falha ao associar lacre", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCodigo = (value: string) => {
    const upper = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const parts = upper.split("-");
    if (parts.length === 1 && parts[0].length > 3) {
      return `${parts[0].slice(0, 3)}-${parts[0].slice(3)}`;
    }
    if (parts.length === 2 && parts[1].length > 6) {
      return `${parts[0]}-${parts[1].slice(0, 6)}-${parts[1].slice(6)}`;
    }
    return upper;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatCodigo(e.target.value);
  };

  if (!isOpen && !success) return null;

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <Card className="w-full max-w-md shadow-elevation-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle id="modal-title" className="text-h3">
                      Associar Novo Lacre
                    </CardTitle>
                    <CardDescription className="text-body">
                      Insira o código do lacre para vincular à sua conta
                    </CardDescription>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-1 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Fechar modal"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.form
                      key={formKey}
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="codigo-lacre" className="text-body font-medium">
                          Código do Lacre
                        </Label>
                        <div className="relative">
                          <Input
                            ref={inputRef}
                            id="codigo-lacre"
                            name="codigo"
                            type="text"
                            placeholder="LAC-123456-ABC"
                            defaultValue=""
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={cn(
                              "text-center text-lg tracking-widest font-mono",
                              "focus:ring-2 focus:ring-primary/30",
                              error && "border-destructive focus:ring-destructive/30"
                            )}
                            autoComplete="off"
                            aria-describedby={error ? "codigo-error" : "codigo-hint"}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <kbd className="text-muted-foreground/50 text-xs font-mono">
                              LAC-000000-AAA
                            </kbd>
                          </div>
                        </div>
                        {error && (
                          <motion.p
                            id="codigo-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-sm text-destructive flex items-center gap-1.5"
                          >
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                          </motion.p>
                        )}
                        <p id="codigo-hint" className="text-small text-muted-foreground">
                          Formato: LAC-000000-AAA (encontrado na etiqueta da sacola)
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 text-base"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Associando...
                          </>
                        ) : (
                          "Associar Lacre"
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
                      >
                        <CheckCircle2 className="h-8 w-8" />
                      </motion.div>
                      <h3 className="text-h3 font-semibold">Lacre Associado!</h3>
                      <p className="mt-1 text-body text-muted-foreground">
                        O código foi vinculado à sua conta.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}