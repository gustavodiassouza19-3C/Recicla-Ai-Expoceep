"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Cadastre-se com email e senha. Sem burocracia, sem tarifa.",
    image: "/images/hero-recycling.jpg",
  },
  {
    number: "02",
    title: "Vincule sua tag NFC",
    description: "Receba uma tag no ecoponto e vincule pelo app em segundos.",
    image: "/images/nfc-tag.jpg",
  },
  {
    number: "03",
    title: "Recicle e ganhe pontos",
    description: "Leve seus reciclaveis ao ecoponto, valide com a tag e acumule pontos.",
    image: "/images/community-recycle.jpg",
  },
];

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
            Tres passos.
            <br />
            <span className="text-success">Simples assim.</span>
          </h2>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
            >
              {/* Text */}
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <span className="text-success text-base font-semibold mb-3 block">
                  {step.number}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground max-w-md">
                  {step.description}
                </p>
              </div>

              {/* Photo */}
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorksSection, HowItWorksSection as howItWorksSection };
