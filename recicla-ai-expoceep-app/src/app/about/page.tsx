"use client";

import Link from "next/link";
import { ArrowLeft, Leaf, Users, Cpu, Target, Layers, Gift, Recycle, Wallet, Wrench, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

const projectSteps = [
  {
    step: 1,
    title: "Cadastre-se",
    description: "Crie sua conta no nosso aplicativo ou site em poucos segundos.",
  },
  {
    step: 2,
    title: "Retire suas Tags",
    description:
      "Aproxime seu celular em um ponto automatizado e retire seus lacres inteligentes gratuitamente.",
  },
  {
    step: 3,
    title: "Embale e Identifique",
    description:
      "Separe o lixo reciclável e feche o saco usando o lacre/tag com tecnologia RFID/NFC.",
  },
  {
    step: 4,
    title: "Acumule Pontos",
    description:
      "Na central de triagem, a tag é lida automaticamente e os pontos caem direto na sua conta.",
  },
  {
    step: 5,
    title: "Troque por Benefícios",
    description: "Resgate vales-transporte, vale-alimentação, descontos e outros prêmios.",
  },
  {
    step: 6,
    title: "Ciclo Sustentável",
    description:
      "O lacre é limpo, zerado e retorna para as máquinas, garantindo reutilização contínua.",
  },
];

const goals = [
  "Tecnologia Acessível: Aplicativo e site intuitivos para controle de reciclagem.",
  "Tags Inteligentes: Identificação prática e reutilizável por RFID/NFC/QR Code.",
  "Incentivo Real: Recompensas atrativas para moradores e empresas.",
  "Aumento da Reciclagem: Elevar significativamente a taxa de reciclagem da cidade.",
];

const impacts = [
  {
    icon: Leaf,
    text: "Environmental: Rios e ruas mais limpos, redução da poluição e incentivo à economia circular.",
  },
  {
    icon: Users,
    text: "Social: Conscientização ambiental e apoio direto às cooperativas de reciclagem.",
  },
  {
    icon: Cpu,
    text: "Technological: Rastreabilidade e leitura em lote para maior eficiência do sistema.",
  },
];

const financeMetrics = [
  {
    label: "Economia Anual em Limpeza e Aterro (1/3 da Cidade)",
    value: "R$ 6.660.000,00 / ano",
    detail:
      "Economia direta ao redirecionar ~33,3 mil toneladas de lixo para a reciclagem (calculado a R$ 200/tonelada).",
    icon: PiggyBank,
  },
  {
    label: "Investimento Inicial no Estoque de Tags (Ano 1)",
    value: "R$ 18.450.000,00",
    detail:
      "Compra do parque tecnológico de 7,38 milhões de tags reutilizáveis (R$ 2,50/unidade) para atender 123 mil moradores.",
    icon: Layers,
  },
  {
    label: "Custo Anual de Manutenção (A partir do Ano 2)",
    value: "R$ 1.845.000,00 / ano",
    detail:
      "Estimativa de 10% de reposição anual de tags danificadas ou perdidas. O restante das tags retorna ao ciclo continuamente.",
    icon: Wrench,
  },
  {
    label: "Economia Líquida Recorrente (A partir do Ano 2)",
    value: "R$ 4.815.000,00 / ano",
    detail:
      "Resultado positivo limpo que fica nos cofres públicos a cada ano de operação do sistema.",
    icon: Wallet,
  },
];

const pillars = [
  {
    title: "Economia Recorrente vs. Custo Pontual",
    description:
      "Como as tags são higienizadas, zeradas e reutilizadas nas máquinas, o investimento pesado ocorre apenas no início. A partir do segundo ano, a economia com limpeza urbana supera em mais de 3,5 vezes o custo de manutenção do sistema.",
  },
  {
    title: "Aumento da Vida Útil do Aterro Sanitário",
    description:
      "A cada tonelada reciclada, economiza-se espaço em aterros sanitários, adiando a necessidade de grandes investimentos milionários na criação de novas células de descarte.",
  },
  {
    title: "Valorização da Economia Local",
    description:
      "O material triado e identificado chega com maior pureza às cooperativas de reciclagem, aumentando a renda dos cooperados e gerando movimentação econômica regional.",
  },
];

function splitPrefix(text: string) {
  const idx = text.indexOf(": ");
  if (idx === -1) return null;
  return { prefix: text.slice(0, idx), rest: text.slice(idx + 2) };
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero do projeto */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-primary/5" />
        <div className="absolute -top-24 right-0 w-72 h-72 bg-success/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-12 md:pb-20">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para o início
          </Link>

          <motion.div {...fadeUp} className="max-w-3xl mt-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95] mb-4">
              Projeto <span className="text-success">Recicla+</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Recompensando você por um futuro mais sustentável.
            </p>
          </motion.div>
        </div>
      </section>

      {/* O que é + Objetivo */}
      <section aria-labelledby="sobre-heading" className="py-12 md:py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div {...fadeUp}>
              <h2
                id="sobre-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4"
              >
                O que é o projeto?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-[75ch]">
                Um aplicativo inovador que transforma a reciclagem em um hábito recompensador.
                Através de um sistema inteligente de tags reutilizáveis, você descarta seu lixo
                reciclável e ganha pontos para trocar por benefícios.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 mb-4">
                <Target className="h-5 w-5 text-success" aria-hidden="true" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
                Nosso Objetivo
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-[75ch]">
                Incentivar a população a reciclar mais e melhor, conectando tecnologia,
                consciência ambiental e recompensas no dia a dia.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section
        aria-labelledby="como-funciona-heading"
        className="py-12 md:py-20 bg-muted/30 border-t border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-8 md:mb-12 max-w-2xl">
            <h2
              id="como-funciona-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.05] mb-4"
            >
              Como <span className="text-success">Funciona</span>
            </h2>
          </motion.div>

          <ol className="space-y-0">
            {projectSteps.map((step, i) => (
              <motion.li
                key={step.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[auto_1fr] md:grid-cols-[4rem_1fr] gap-4 md:gap-8 py-5 md:py-6 border-b border-border/40 last:border-b-0"
              >
                <span
                  className="text-sm font-semibold text-success font-mono tabular-nums pt-1"
                  aria-hidden="true"
                >
                  {String(step.step).padStart(2, "0")}
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

      {/* Metas */}
      <section aria-labelledby="metas-heading" className="py-12 md:py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-8 md:mb-12 max-w-2xl">
            <h2
              id="metas-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.05] mb-4"
            >
              Nossas <span className="text-success">Metas</span>
            </h2>
          </motion.div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {goals.map((goal, i) => {
              const parts = splitPrefix(goal);
              return (
                <motion.li
                  key={goal}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-border/60 bg-background p-4 md:p-5"
                >
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {parts ? (
                      <>
                        <span className="font-semibold text-foreground">{parts.prefix}:</span>{" "}
                        {parts.rest}
                      </>
                    ) : (
                      goal
                    )}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Impactos */}
      <section
        aria-labelledby="impactos-heading"
        className="py-12 md:py-20 bg-muted/30 border-t border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-8 md:mb-12 max-w-2xl">
            <h2
              id="impactos-heading"
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.05] mb-4"
            >
              Nossos <span className="text-success">Impactos</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {impacts.map((impact, i) => {
              const parts = splitPrefix(impact.text);
              const Icon = impact.icon;
              return (
                <motion.div
                  key={impact.text}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-border/60 bg-background p-4 md:p-5"
                >
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 mb-3">
                    <Icon className="h-5 w-5 text-success" aria-hidden="true" />
                  </span>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {parts ? (
                      <>
                        <span className="font-semibold text-foreground">{parts.prefix}:</span>{" "}
                        {parts.rest}
                      </>
                    ) : (
                      impact.text
                    )}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plano de Expansão */}
      <section
        aria-labelledby="expansao-heading"
        className="py-12 md:py-20 border-t border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-success/30 bg-success/5 p-6 md:p-10 max-w-3xl"
          >
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-success/10 mb-4">
              <Recycle className="h-5 w-5 text-success" aria-hidden="true" />
            </span>
            <h2
              id="expansao-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3"
            >
              Plano de <span className="text-success">Expansão</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[75ch]">
              Início em Cascavel (PR), com expansão planejada para todo o Estado do Paraná e, em
              seguida, para todo o Brasil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Viabilidade Financeira */}
      <section
        aria-labelledby="viabilidade-heading"
        className="py-12 md:py-20 bg-muted/30 border-t border-border/50"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div {...fadeUp} className="mb-8 md:mb-12 max-w-3xl">
            <h2
              id="viabilidade-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05] mb-4"
            >
              Viabilidade Financeira{" "}
              <span className="text-primary">&amp; Economia Real</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Um modelo sustentável onde a tecnologia de prevenção reduz custos públicos e gera
              economia recorrente.
            </p>
          </motion.div>

          {/* Lógica financeira */}
          <motion.div {...fadeUp} className="mb-10 md:mb-14 max-w-[75ch]">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              Entenda a Lógica Financeira
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Atualmente, o município de Cascavel gera cerca de 100 mil toneladas de resíduos ao
              ano. Tratar esse lixo custa aproximadamente R$ 200 por tonelada, resultando em um
              custo direto de R$ 20 milhões anuais para os cofres públicos. Com a adesão de 1/3 da
              população ao sistema de tags reutilizáveis, reduzimos significativamente esse custo
              de limpeza e aterro.
            </p>
          </motion.div>

          {/* Estudo de caso */}
          <div className="mb-10 md:mb-14">
            <motion.h3 {...fadeUp} className="text-xl sm:text-2xl font-bold text-foreground mb-5">
              Análise Financeira: Estudo de Caso Cascavel/PR
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {financeMetrics.map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-border/60 bg-background p-4 md:p-5 flex flex-col gap-2"
                  >
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                      {metric.label}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-foreground font-mono tabular-nums tracking-tight break-words">
                      {metric.value}
                    </span>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {metric.detail}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pilares */}
          <div className="mb-10 md:mb-14">
            <motion.h3 {...fadeUp} className="text-xl sm:text-2xl font-bold text-foreground mb-5">
              Por que este modelo traz &quot;lucro&quot; para a gestão pública?
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-border/60 bg-background p-4 md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-primary/10">
                      <Gift className="h-4 w-4 text-primary" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-foreground mb-1.5">
                        {pillar.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Payback */}
          <motion.div
            {...fadeUp}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-10"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
              Retorno sobre o Investimento (Payback)
            </h3>
            <p className="text-base md:text-lg text-foreground leading-relaxed max-w-[75ch] font-medium">
              O investimento inicial do parque de tags é amortizado ao longo do tempo,
              transformando a gestão de lixo municipal em uma operação com superávit de quase
              R$ 5 milhões por ano a partir do segundo ano.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
