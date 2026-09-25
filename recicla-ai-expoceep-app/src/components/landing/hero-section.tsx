"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[100dvh] flex items-end md:items-center overflow-hidden bg-black">
      {/* Product photo background */}
      <Image
        src="/images/tags-studio.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Scrim */}
      <div aria-hidden className="absolute inset-0 bg-black/60" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/80"
      />
      <div
        aria-hidden
        className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-success/10 blur-3xl md:h-[480px] md:w-[480px]"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-success/[0.07] blur-3xl"
      />

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-10 md:gap-12 items-center">
          {/* Left: Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl max-[360px]:text-[2rem] sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[0.95] mb-6">
              Somos incansáveis
              <br />
              para você <span className="text-success">reciclar.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-md leading-relaxed">
              Recicle, acumule pontos e transforme o planeta em
              recompensas reais.
            </p>
          </motion.div>

          {/* Right: signup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm lg:self-end"
          >
            <div className="w-full bg-black/45 backdrop-blur-xl rounded-2xl border border-white/20 p-6 md:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
              <p className="text-white text-base font-medium mb-4">
                Crie sua conta gratuita
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Digite seu email"
                  aria-label="Digite seu email"
                  className="w-full h-14 px-5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/70 text-sm focus:outline-none focus:border-white/70 transition-colors"
                />
                <button
                  onClick={() => router.push("/register")}
                  className="w-full h-14 rounded-full bg-success text-success-foreground text-sm font-semibold hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                >
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { HeroSection, HeroSection as heroSection };
