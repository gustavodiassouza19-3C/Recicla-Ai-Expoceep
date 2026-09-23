"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function CtaSection() {
  const router = useRouter();

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-nature-wide.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[0.95] mb-6">
            Pronto para
            <br />
            <span className="text-success">reciclar?</span>
          </h2>
          <p className="text-lg text-white/60 max-w-md mx-auto mb-8">
            Crie sua conta em menos de 1 minuto e comecar a acumular pontos hoje.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-success rounded-full hover:bg-success/90 transition-colors"
          >
            Criar Conta Gratis
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export { CtaSection, CtaSection as ctaSection };
