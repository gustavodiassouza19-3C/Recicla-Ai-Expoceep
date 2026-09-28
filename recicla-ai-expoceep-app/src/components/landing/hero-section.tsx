"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function HeroSection() {
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -40],
  );

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100dvh] items-end overflow-hidden bg-black md:items-center"
    >
      <Image
        src="/images/tags-studio.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/60" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/80"
      />
      <div
        aria-hidden
        className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-success/10 blur-2xl md:h-[480px] md:w-[480px]"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-success/[0.07] blur-2xl"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-24 md:px-8 md:py-24">
        <div className="grid grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
          <motion.div
            style={{ y: contentY }}
            className="w-full max-w-md will-change-transform md:mx-0 md:max-w-xl"
          >
            <motion.div
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
              variants={heroContainer}
            >
              <motion.div
                variants={heroItem}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/75"
              >
                <motion.span
                  aria-hidden
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.3, 1], opacity: [0.9, 0.45, 0.9] }
                  }
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-2 w-2 rounded-full bg-success shadow-[0_0_12px_var(--success)]"
                />
                Reciclagem que vira recompensa
              </motion.div>
              <motion.h1
                variants={heroItem}
                className="mb-6 max-w-2xl text-4xl font-bold leading-[0.95] tracking-tight text-white text-balance max-[360px]:text-[2rem] sm:text-5xl md:text-6xl"
              >
                Somos incansáveis
                <br />
                para você{" "}
                <span className="bg-gradient-to-r from-white to-success bg-clip-text text-transparent">
                  reciclar.
                </span>
              </motion.h1>
              <motion.p
                variants={heroItem}
                className="mb-8 max-w-[54ch] text-base leading-relaxed text-white/70 md:text-lg"
              >
                Recicle, acumule pontos e transforme o planeta em recompensas
                reais.
              </motion.p>
              <motion.button
                variants={heroItem}
                type="button"
                onClick={() => router.push("/register")}
                className="group inline-flex h-12 min-h-12 touch-manipulation select-none items-center justify-center gap-2 rounded-xl bg-success px-6 text-sm font-semibold text-success-foreground shadow-[0_0_28px_-10px_var(--success)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-success/90 hover:shadow-[0_0_28px_-6px_var(--success)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.97]"
              >
                Começar Agora
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { HeroSection, HeroSection as heroSection };
