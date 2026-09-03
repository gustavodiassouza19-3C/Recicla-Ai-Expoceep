"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Users, Award, Target, Sparkles, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssociarLacreModal } from "@/components/dashboard/associar-lacre-modal";
import { MetricCard, METRIC_ICONS } from "@/components/dashboard/metric-card";
import { LacresTable } from "@/components/dashboard/lacres-table";
import type { Lacre, DashboardMetrics, Usuario, LacreStatus } from "@/components/dashboard/types";
import { LACRE_STATUS_LABELS, LACRE_STATUS_VARIANTS } from "@/components/dashboard/types";

const mockUsuario: Usuario = {
  nome: "Maria Silva",
  email: "maria.silva@email.com",
};

const mockMetrics: DashboardMetrics = {
  saldoPontos: 2450,
  sacolasValidadas: 47,
  impactoCO2: 127.5,
};

const mockLacres: Lacre[] = [
  {
    id: "1",
    codigo: "LAC-123456-ABC",
    status: "PONTUADO",
    pontos: 150,
    cooperativa: "CoopRecicla Central",
    dataAssociacao: "2024-12-15T10:30:00Z",
    dataValidacao: "2024-12-16T14:22:00Z",
    dataPontuacao: "2024-12-16T15:00:00Z",
  },
  {
    id: "2",
    codigo: "LAC-789012-DEF",
    status: "VALIDADO",
    pontos: 200,
    cooperativa: "CoopRecicla Norte",
    dataAssociacao: "2024-12-10T08:15:00Z",
    dataValidacao: "2024-12-11T11:45:00Z",
  },
  {
    id: "3",
    codigo: "LAC-345678-GHI",
    status: "EM_USO",
    pontos: 100,
    cooperativa: "CoopRecicla Sul",
    dataAssociacao: "2024-12-18T16:20:00Z",
  },
  {
    id: "4",
    codigo: "LAC-901234-JKL",
    status: "ASSOCIADO",
    pontos: 75,
    cooperativa: "CoopRecicla Leste",
    dataAssociacao: "2024-12-05T09:00:00Z",
    dataValidacao: "2024-12-06T10:30:00Z",
    dataPontuacao: "2024-12-06T11:00:00Z",
  },
  {
    id: "5",
    codigo: "LAC-567890-MNO",
    status: "PONTUADO",
    pontos: 180,
    cooperativa: "CoopRecicla Oeste",
    dataAssociacao: "2024-11-28T13:45:00Z",
    dataValidacao: "2024-11-29T15:20:00Z",
    dataPontuacao: "2024-11-29T16:00:00Z",
  },
  {
    id: "6",
    codigo: "LAC-234567-PQR",
    status: "EM_USO",
    pontos: 120,
    cooperativa: "CoopRecicla Central",
    dataAssociacao: "2024-12-20T11:00:00Z",
  },
];

const statusLegend = [
  { status: "ASSOCIADO" as LacreStatus, label: "Recém associado, aguardando coleta" },
  { status: "EM_USO" as LacreStatus, label: "Sacola em processo de triagem" },
  { status: "VALIDADO" as LacreStatus, label: "Conteúdo validado pela cooperativa" },
  { status: "PONTUADO" as LacreStatus, label: "Pontos creditados na conta" },
];

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lacres, setLacres] = React.useState<Lacre[]>(mockLacres);
  const [isLoading, setIsLoading] = React.useState(false);
  const hasMore = lacres.length < 20;

  const handleAssociarSuccess = () => {
    const novoLacre: Lacre = {
      id: String(Date.now()),
      codigo: `LAC-${String(Math.floor(Math.random() * 900000) + 100000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      status: "ASSOCIADO",
      pontos: Math.floor(Math.random() * 150) + 50,
      cooperativa: "CoopRecicla Central",
      dataAssociacao: new Date().toISOString(),
    };
    setLacres((prev) => [novoLacre, ...prev]);
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      const novosLacres: Lacre[] = [
        {
          id: String(Date.now() + 1),
          codigo: `LAC-${String(Math.floor(Math.random() * 900000) + 100000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          status: "ASSOCIADO" as LacreStatus,
          pontos: Math.floor(Math.random() * 150) + 50,
          cooperativa: "CoopRecicla Central",
          dataAssociacao: new Date().toISOString(),
        },
        {
          id: String(Date.now() + 2),
          codigo: `LAC-${String(Math.floor(Math.random() * 900000) + 100000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          status: "EM_USO" as LacreStatus,
          pontos: Math.floor(Math.random() * 150) + 50,
          cooperativa: "CoopRecicla Norte",
          dataAssociacao: new Date().toISOString(),
        },
      ];
      setLacres((prev) => [...prev, ...novosLacres]);
      setIsLoading(false);
    }, 800);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background"
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/10 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.header
          variants={itemVariants}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
                className="text-display font-semibold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
              >
                Olá, {mockUsuario.nome.split(" ")[0]}! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 15 }}
                className="mt-2 text-body-lg"
              >
                Acompanhe seus lacres, pontos e impacto ambiental em tempo real.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
            >
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="group gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>Associar Novo Lacre</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Button>
            </motion.div>
          </div>
        </motion.header>

        <motion.section
          variants={containerVariants}
          className="mb-8 sm:mb-10"
          aria-label="Métricas do dashboard"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Saldo de Pontos"
              value={mockMetrics.saldoPontos.toLocaleString("pt-BR")}
              description="Disponíveis para resgate"
              icon={METRIC_ICONS.saldoPontos}
              iconColor="#16a34a"
              iconBg="#dcfce7"
              trend={{ value: "+320", label: "este mês", positive: true }}
              delay={0.1}
            />
            <MetricCard
              title="Sacolas Validadas"
              value={mockMetrics.sacolasValidadas}
              description="Processadas com sucesso"
              icon={METRIC_ICONS.sacolasValidadas}
              iconColor="#2563eb"
              iconBg="#dbeafe"
              trend={{ value: "+12", label: "este mês", positive: true }}
              delay={0.18}
            />
            <MetricCard
              title="Impacto CO₂ Evitado"
              value={`${mockMetrics.impactoCO2.toFixed(1)} kg`}
              description="Equivalente a 58 árvores"
              icon={METRIC_ICONS.impactoCO2}
              iconColor="#ea580c"
              iconBg="#ffedd5"
              trend={{ value: "+15.2 kg", label: "este mês", positive: true }}
              delay={0.26}
            />
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-8 sm:mb-10"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold">Meta Mensal</h3>
                    <p className="text-body text-muted-foreground">
                      Associe 5 lacres esta semana para desbloquear bônus de 500 pontos!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 bg-background/80 backdrop-blur rounded-xl px-4 py-2 border border-border/40">
                    <div className="flex h-6 w-24 items-center overflow-hidden rounded-lg bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-success rounded-lg"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">65%</span>
                  </div>
                  <Badge variant="default" className="gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    5 lacres
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-h1 font-semibold">Seus Lacres</h2>
              <p className="text-body text-muted-foreground mt-1">
                Acompanhe o status de cada lacre associado à sua conta
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {statusLegend.map((item) => (
                <Badge
                  key={item.status}
                  variant={LACRE_STATUS_VARIANTS[item.status]}
                  className="gap-1.5"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "currentColor" }} />
                  {LACRE_STATUS_LABELS[item.status]}
                </Badge>
              ))}
            </div>
          </div>

          <LacresTable
            lacres={lacres}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Como funciona o ciclo do lacre</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Users, title: "1. Associe", desc: "Escaneie ou digite o código do lacre na sacola" },
                  { icon: Package, title: "2. Coleta", desc: "A cooperativa recolhe e leva para triagem" },
                  { icon: CheckCircle2, title: "3. Validação", desc: "Conteúdo verificado e pesado" },
                  { icon: Award, title: "4. Pontuação", desc: "Pontos creditados automaticamente na conta" },
                ].map((step, index) => (
                  <motion.div
                    key={step.title}
                    variants={itemVariants}
                    style={{ transitionDelay: `${0.3 + index * 0.08}s` }}
                    className="flex flex-col gap-3 p-4 rounded-2xl border border-border/40 bg-muted/30 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <AssociarLacreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAssociarSuccess}
      />
    </motion.div>
  );
}