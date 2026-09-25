"use client";

import { motion } from "framer-motion";
import { Cloud, Droplets, TreePine } from "lucide-react";

// mock: números de exemplo — substituir por dados reais do banco
const impacts = [
  {
    icon: Cloud,
    value: "3.400",
    unit: "kg",
    label: "CO2e economizados",
    description: "Equivalente a tirar 2 carros da rua por um mês",
  },
  {
    icon: Droplets,
    value: "31.800",
    unit: "L",
    label: "Água poupada",
    description: "Suficiente para abastecer uma família por 3 meses",
  },
  {
    icon: TreePine,
    value: "20",
    unit: "",
    label: "Árvores salvas",
    description: "Cada árvore absorve 22kg de CO2 por ano",
  },
];

function ImpactSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
            Impacto da
            <br />
            <span className="text-success">comunidade.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {impacts.map((impact, i) => {
            const Icon = impact.icon;
            const wide = i === 0;
            return (
              <motion.div
                key={impact.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`p-6 md:p-8 rounded-2xl bg-card border border-border/50 ${
                  wide ? "md:col-span-2" : ""
                }`}
              >
                {wide ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <Icon className="h-6 w-6 text-success shrink-0" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                          {impact.value}
                        </span>
                        {impact.unit && (
                          <span className="text-xl font-medium text-muted-foreground">
                            {impact.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sm:border-l sm:border-border/60 sm:pl-6">
                      <p className="text-base font-medium text-foreground mb-1">
                        {impact.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {impact.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Icon className="h-6 w-6 text-success mb-4" />
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                        {impact.value}
                      </span>
                      {impact.unit && (
                        <span className="text-xl font-medium text-muted-foreground">
                          {impact.unit}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-foreground mb-1">
                      {impact.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {impact.description}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { ImpactSection, ImpactSection as impactSection };
