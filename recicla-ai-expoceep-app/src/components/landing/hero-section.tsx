"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[100dvh] flex items-end md:items-center overflow-hidden">
      {/* Full-bleed background photo */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-people.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 pb-16 pt-32 md:pt-0 md:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-6">
              Somos
              <br />
              incansaveis
              <br />
              para voce
              <br />
              <span className="text-success">reciclar.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-md leading-relaxed">
              Recicle, acumule pontos e transforme o planeta.
              E aquele cartao? E so o comeco.
            </p>
          </motion.div>

          {/* Right: Frosted glass card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:justify-self-end"
          >
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
              <p className="text-white text-base font-medium mb-4">
                Crie sua conta gratuita
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Digite seu email"
                  className="w-full h-14 px-5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
                />
                <button
                  onClick={() => router.push("/register")}
                  className="w-full h-14 rounded-full bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                >
                  Quero Reciclar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-white/40 text-xs mt-4 text-center">
                Sem tarifas. Sem complicacao.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-white/50"
          />
        </div>
      </motion.div>
    </section>
  );
}

export { HeroSection, HeroSection as heroSection };
