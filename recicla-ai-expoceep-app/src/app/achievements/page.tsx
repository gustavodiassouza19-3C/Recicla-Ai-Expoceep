"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { AchievementBadge } from "@/components/dashboard/achievement-badge";
import { Card } from "@/components/ui/card";
import { Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "animejs";

interface Conquista {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  pontos: number;
  condicao_tipo: string;
  condicao_valor: number;
  categoria: string;
}

interface ConquistaComProgresso extends Conquista {
  desbloqueada: boolean;
  progresso_atual: number;
  data_concessao: string | null;
}

const CATEGORIES = [
  { key: "all", label: "Todas" },
  { key: "tags", label: "Tags" },
  { key: "sequencia", label: "Sequencia" },
  { key: "periodo", label: "Periodo" },
  { key: "pontos", label: "Pontos" },
  { key: "frequencia", label: "Frequencia" },
  { key: "compromisso", label: "Compromisso" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
} as const;

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

function ConquistaDetail({
  conquista,
  onClose,
}: {
  conquista: ConquistaComProgresso;
  onClose: () => void;
}) {
  const progressPercent =
    conquista.condicao_valor > 0
      ? Math.min((conquista.progresso_atual / conquista.condicao_valor) * 100, 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full max-w-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold text-foreground">Detalhes</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-4">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl mb-3 ${
                conquista.desbloqueada ? "bg-success/15" : "bg-muted grayscale"
              }`}
            >
              {conquista.icone}
            </div>
            <h2 className="text-lg font-bold text-foreground">{conquista.nome}</h2>
            <p className="text-sm text-muted-foreground mt-1">{conquista.descricao}</p>
            <p className="text-sm font-semibold text-success mt-2">
              +{conquista.pontos} pontos
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso</span>
                <span>
                  {conquista.progresso_atual}/{conquista.condicao_valor}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-success"
                />
              </div>
            </div>

            {conquista.desbloqueada && conquista.data_concessao && (
              <p className="text-xs text-muted-foreground text-center">
                Desbloqueada em{" "}
                {new Date(conquista.data_concessao).toLocaleDateString("pt-BR")}
              </p>
            )}

            {conquista.desbloqueada && (
              <div className="flex items-center justify-center gap-1.5 text-success text-sm font-medium">
                <span>✓</span>
                <span>Conquistada!</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [conquistas, setConquistas] = useState<ConquistaComProgresso[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState<ConquistaComProgresso | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const [
        { data: allConquistas, error: cError },
        { data: userConquistas, error: ucError },
      ] = await Promise.all([
        supabase
          .from("conquistas")
          .select("id, codigo, nome, descricao, icone, pontos, condicao_tipo, condicao_valor, categoria")
          .order("id", { ascending: true }),
        supabase
          .from("usuario_conquistas")
          .select("conquista_id, pontos_ganhos, concedida_em"),
      ]);

      if (cError) {
        console.error("Erro ao buscar conquistas:", cError);
        setLoadingData(false);
        return;
      }

      const unlockedMap = new Map<number, { pontos_ganhos: number; concedida_em: string | null }>();
      if (!ucError && userConquistas) {
        userConquistas.forEach((uc: { conquista_id: number; pontos_ganhos: number; concedida_em: string | null }) => {
          unlockedMap.set(uc.conquista_id, {
            pontos_ganhos: uc.pontos_ganhos,
            concedida_em: uc.concedida_em,
          });
        });
      }

      const enriched: ConquistaComProgresso[] = (allConquistas || []).map((c) => {
        const unlocked = unlockedMap.has(c.id);
        return {
          ...c,
          desbloqueada: unlocked,
          progresso_atual: unlocked ? c.condicao_valor : 0,
          data_concessao: unlocked ? unlockedMap.get(c.id)?.concedida_em ?? null : null,
        };
      });

      setConquistas(enriched);
      setLoadingData(false);
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        ease: "outExpo",
      });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const filtered =
    activeCategory === "all"
      ? conquistas
      : conquistas.filter((c) => c.categoria === activeCategory);

  const unlocked = conquistas.filter((c) => c.desbloqueada).length;
  const total = conquistas.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8">
        <div ref={containerRef} className="max-w-2xl mx-auto opacity-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Conquistas</h1>
            <p className="text-muted-foreground mt-1">
              {unlocked}/{total} desbloqueadas
            </p>
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-minimal">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "bg-success text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground text-sm">Carregando conquistas...</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-3 gap-2"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filtered.map((c) => (
                <motion.div key={c.id} variants={item}>
                  <AchievementBadge
                    icone={c.icone}
                    nome={c.nome}
                    pontos={c.pontos}
                    desbloqueada={c.desbloqueada}
                    progresso={c.progresso_atual}
                    total={c.condicao_valor}
                    onClick={() => setSelected(c)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {filtered.length === 0 && !loadingData && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Nenhuma conquista nesta categoria.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ConquistaDetail
            conquista={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
