"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "O que e o Recicla Ai?",
    answer:
      "O Recicla Ai e um sistema digital que transforma reciclagem em pontos e recompensas. Voce vincula uma tag NFC a sua conta, leva seus reciclaveis a um ecoponto e valida a entrega pelo app.",
  },
  {
    question: "Preciso comprar uma tag NFC?",
    answer:
      "Nao. As tags sao fornecidas gratuitamente nos ecopontos participantes. Basta criar uma conta e vincular a tag ao seu perfil pelo app.",
  },
  {
    question: "Como funcionam os pontos?",
    answer:
      "Cada reciclagem validada gera pontos que somam ao seu saldo total. Os pontos podem ser trocados por recompensas de parceiros da rede Recicla Ai.",
  },
  {
    question: "Quais materiais posso reciclar?",
    answer:
      "O sistema aceita papel, cartao, plastico, vidro e metal. Cada ecoponto pode ter tipos diferentes de materiais aceitos, verifique no app.",
  },
  {
    question: "Meus dados estao seguros?",
    answer:
      "Sim. Utilizamos Supabase com autenticacao segura e Row Level Security. Seus dados so sao acessiveis por voce. Nao compartilhamos informacoes com terceiros.",
  },
];

function FaqItem({ faq }: { faq: (typeof faqs)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 md:py-6 text-left"
      >
        <span className="text-lg md:text-xl font-medium text-foreground pr-4">
          {faq.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-base text-muted-foreground pb-5 md:pb-6 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
              Perguntas
              <br />
              <span className="text-success">frequentes.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {faqs.map((faq) => (
              <FaqItem key={faq.question} faq={faq} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { FaqSection, FaqSection as faqSection };
