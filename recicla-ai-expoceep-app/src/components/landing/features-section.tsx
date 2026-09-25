"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, Nfc, BarChart3, Gift } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Gamificação",
    description:
      "50 conquistas para desbloquear. Cada reciclagem te aproxima do próximo nível.",
    image: "/images/hero-recycling.jpg",
  },
  {
    icon: Nfc,
    title: "Tags NFC",
    description:
      "Vincule tags físicas às suas reciclagens. Validação instantânea no ecoponto.",
    image: "/images/nfc-scan.webp",
  },
  {
    icon: BarChart3,
    title: "Impacto Ambiental",
    description:
      "Acompanhe CO2 economizado, água poupada e árvores salvas.",
    image: "/images/green-building.webp",
  },
  {
    icon: Gift,
    title: "Recompensas",
    description:
      "Troque seus pontos por recompensas reais de parceiros da comunidade.",
    image: "/images/community-recycling.webp",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
            Tudo que você precisa
            <br />
            <span className="text-success">para reciclar.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3]"
              >
                {/* Background photo */}
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1152px) 50vw, 540px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dark scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-success" />
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white/70 max-w-xs">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { FeaturesSection, FeaturesSection as featuresSection };
