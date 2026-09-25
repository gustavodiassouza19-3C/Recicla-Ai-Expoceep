"use client";

import { motion } from "framer-motion";

// mock: números de exemplo — substituir por dados reais do banco
const stats = [
  { value: "150+", label: "Usuários ativos reciclando" },
  { value: "1.200", label: "Reciclagens validadas" },
  { value: "50", label: "Conquistas para desbloquear" },
];

function StatsSection() {
  return (
    <section className="py-20 md:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
            Junte-se aos
            <br />
            <span className="text-success">que já escolheram</span>
            <br />
            reciclar.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-2">
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { StatsSection, StatsSection as statsSection };
