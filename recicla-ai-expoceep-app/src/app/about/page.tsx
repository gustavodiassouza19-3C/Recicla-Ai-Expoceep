"use client";

import { Nfc, Recycle, Gift, Leaf, Database, Server, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const flow = [
  {
    title: "Vinculo",
    description:
      "O cidadao recebe uma tag NFC fisica, vincula ao seu CPF no aplicativo e a prende na sacola de reciclaveis.",
  },
  {
    title: "Coleta e triagem",
    description:
      "A sacola e recolhida pela coleta seletiva e enviada ao ecoponto ou centro de triagem.",
  },
  {
    title: "Validacao",
    description:
      "Um funcionario autorizado le a tag NFC no celular para confirmar que o material chegou.",
  },
  {
    title: "Recompensa",
    description:
      "A confirmacao libera automaticamente uma recompensa no app. Ate 5 recompensas mensais por CPF, sem depender do peso ou tipo do material.",
  },
  {
    title: "Reuso",
    description:
      "O status da tag volta para disponivel e ela volta ao sistema para outra pessoa usar.",
  },
];

const stack = [
  {
    icon: Smartphone,
    layer: "Front-End",
    tech: "Next.js (React)",
    role: "Interface para acompanhar saldo/historico e para o funcionario ler a tag na triagem",
  },
  {
    icon: Server,
    layer: "Back-End",
    tech: "Python (FastAPI)",
    role: "API REST com regras de limite por CPF, validacao de seguranca e atualizacao de status",
  },
  {
    icon: Database,
    layer: "Banco de dados",
    tech: "Supabase (PostgreSQL)",
    role: "Tabelas de usuarios, tags, reciclagens, recompensas e RLS por conta",
  },
  {
    icon: Nfc,
    layer: "Hardware",
    tech: "Tags NFC",
    role: "Etiquetas fisicas com codigo unico, vinculadas temporariamente a cada entrega",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Intro */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-primary/5" />
        <div className="absolute -top-24 right-0 w-72 h-72 bg-success/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
          <motion.div {...fadeUp} className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95] mb-6">
              Reciclar urbano
              <br />
              <span className="text-success">sem friccao.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              O <strong className="text-foreground font-semibold">Recicla Ai</strong> incentiva a
              reciclagem urbana com tags NFC reutilizaveis vinculadas ao CPF do cidadao. O
              sistema aproveita a coleta seletiva ja existente na cidade — sem equipamento novo
              e sem coleta especial.
            </p>
          </motion.div>

          <motion.ul
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 max-w-3xl"
          >
            {[
              { icon: Recycle, text: "Validacao por NFC no ecoponto" },
              { icon: Gift, text: "Pontos e recompensas reais" },
              { icon: Leaf, text: "Impacto ambiental rastreavel" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-success" />
                </span>
                <span className="text-sm text-muted-foreground leading-snug pt-2">{text}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Fluxo */}
      <section aria-labelledby="fluxo-heading" className="py-16 md:py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-12 md:mb-16 max-w-2xl">
            <h2
              id="fluxo-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05] mb-4"
            >
              Como o sistema
              <br />
              <span className="text-success">funciona.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Do vinculo da tag ao reuso na proxima entrega — o ciclo completo em cinco etapas.
            </p>
          </motion.div>

          <ol className="space-y-0">
            {flow.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[auto_1fr] md:grid-cols-[4rem_1fr] gap-4 md:gap-8 py-6 border-b border-border/40 last:border-b-0"
              >
                <span
                  className="text-sm font-semibold text-success font-mono tabular-nums pt-1"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Arquitetura */}
      <section
        aria-labelledby="stack-heading"
        className="py-16 md:py-24 bg-muted/30 border-t border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-12 md:mb-16 max-w-2xl">
            <h2
              id="stack-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05] mb-4"
            >
              Arquitetura do
              <br />
              <span className="text-success">sistema.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Quatro camadas trabalhando juntas para validar entregas, liberar pontos e manter
              os dados seguros.
            </p>
          </motion.div>

          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <motion.table
              {...fadeUp}
              className="w-full min-w-[36rem] text-left border-collapse"
            >
              <caption className="sr-only">
                Camadas da arquitetura do Recicla Ai e suas funcoes
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Camada
                  </th>
                  <th
                    scope="col"
                    className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Tecnologia
                  </th>
                  <th
                    scope="col"
                    className="py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Funcao
                  </th>
                </tr>
              </thead>
              <tbody>
                {stack.map((row) => {
                  const Icon = row.icon;
                  return (
                    <tr key={row.layer} className="border-b border-border/40 last:border-b-0">
                      <th scope="row" className="py-4 pr-4 align-top font-normal">
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className="h-4 w-4 text-success shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm font-semibold text-foreground">
                            {row.layer}
                          </span>
                        </span>
                      </th>
                      <td className="py-4 pr-4 align-top">
                        <span className="text-sm text-foreground">{row.tech}</span>
                      </td>
                      <td className="py-4 align-top">
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {row.role}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </motion.table>
          </div>
        </div>
      </section>
    </div>
  );
}
