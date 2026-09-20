"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Nfc, Recycle, Trophy, ArrowLeft, Sparkles, CheckCircle, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "animejs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastre-se com email e senha para comecar a reciclar.",
    color: "text-primary",
  },
  {
    icon: Nfc,
    title: "Vincule uma tag NFC",
    description: "Receba uma tag no ecoponto e vincule ela a sua conta pelo app.",
    color: "text-success",
  },
  {
    icon: Recycle,
    title: "Recicle",
    description: "Leve seus reciclaveis a um ecoponto e valide sua entrega com a tag.",
    color: "text-accent",
  },
  {
    icon: Trophy,
    title: "Ganhe pontos e conquistas",
    description: "Acumule pontos a cada reciclagem e desbloqueie 50 conquistas.",
    color: "text-warning",
  },
];

interface Tag {
  id: number;
  codigo_nfc: string;
  status: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export default function ComoFuncionaPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (heroRef.current) {
      animate(heroRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        ease: "outExpo",
      });
    }
    fetchTags();
  }, []);

  function fetchTags() {
    supabase
      .from("tags")
      .select("id, codigo_nfc, status")
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data) setTags(data);
      });
  }

  async function handleLinkTag() {
    if (!selectedTag) return;
    setError("");

    if (!user?.usuario_id) {
      setError("Voce precisa estar logado para vincular uma tag.");
      return;
    }

    if (selectedTag.status === "em_uso") {
      setError("Esta tag ja esta em uso.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("reciclagens").insert({
      usuario_id: user.usuario_id,
      tag_id: selectedTag.id,
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
      .eq("id", selectedTag.id);

    setSuccess(true);
    fetchTags();
    setSubmitting(false);

    setTimeout(() => {
      setSelectedTag(null);
      setSuccess(false);
    }, 2000);
  }

  function handleTagClick(tag: Tag) {
    if (!user) {
      router.push("/register");
      return;
    }
    if (tag.status === "em_uso") return;
    setSelectedTag(tag);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-primary/5" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-success/10 rounded-full blur-3xl" />

        <div ref={heroRef} className="relative p-4 md:p-8 opacity-0">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.push(user ? "/dashboard" : "/login")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-success" />
              <span className="text-xs font-semibold uppercase tracking-wider text-success">
                Feira de Profissoes
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">Como Funciona</h1>
            <p className="text-muted-foreground text-sm">
              O Recicla Ai transforma reciclagem em pontos, conquistas e recompensas. Veja como comecar:
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 md:p-8 pt-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} variants={item}>
                  <Card className="p-4 retro-border-card retro-shadow-sm retro-radius h-full">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                        <Icon className={`h-5 w-5 ${step.color}`} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Passo {i + 1}
                        </span>
                        <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Tags para teste */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4 retro-border-card retro-shadow-sm retro-radius">
              <div className="flex items-center gap-2 mb-4">
                <Nfc className="h-4 w-4 text-success" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Tags para Teste
                </h2>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                {user
                  ? "Toque em uma tag ativa para vincula-la a sua conta."
                  : "Crie sua conta primeiro, depois volte aqui para vincular uma tag."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag)}
                    disabled={tag.status === "em_uso" || submitting}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                      tag.status === "em_uso"
                        ? "bg-muted/30 border-border/30 opacity-50 cursor-not-allowed"
                        : user
                          ? "bg-muted/30 border-success/30 hover:border-success hover:bg-success/5 cursor-pointer"
                          : "bg-muted/30 border-border/30 cursor-pointer"
                    }`}
                  >
                    <span className="text-sm font-mono font-bold text-foreground">{tag.codigo_nfc}</span>
                    {tag.status === "ativa" ? (
                      <Badge variant="success" className="text-[9px]">
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[9px]">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        Em uso
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-xs text-success font-medium">
                  Dica: na feira, toque em uma tag com status &quot;OK&quot; para vincular automaticamente.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 mb-8"
          >
            <Card className="p-6 retro-border-card retro-shadow-sm retro-radius text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">Pronto para comecar?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Crie sua conta e comecar a reciclar agora mesmo!
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => router.push("/register")}
                  className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
                >
                  Criar Conta
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Ja tenho conta
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Dialog de vinculacao */}
      <AnimatePresence>
        {selectedTag && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => { setSelectedTag(null); setError(""); setSuccess(false); }}
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
                    onClick={() => { setSelectedTag(null); setError(""); setSuccess(false); }}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {success ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Tag vinculada com sucesso!</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Vincular tag <span className="font-mono font-bold text-foreground">{selectedTag.codigo_nfc}</span> a sua conta?
                    </p>

                    {error && (
                      <p className="text-xs text-destructive mb-3">{error}</p>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleLinkTag}
                      disabled={submitting}
                    >
                      {submitting ? "Vinculando..." : "Vincular"}
                    </Button>
                  </>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
