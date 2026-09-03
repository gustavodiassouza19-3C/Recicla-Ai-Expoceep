"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { label: "Cidadão", value: "citizen", description: "Registro de lacres e resgate de recompensas" },
    { label: "Cooperativa", value: "cooperative", description: "Validação de lacres e atribuição de pontos" },
    { label: "Administrador", value: "admin", description: "Gestão de usuários e relatórios" },
  ];

  if (!selectedRole) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 py-24"
      >
        <div className="flex flex-col items-center max-w-md w-full space-y-4">
          <Image
            src="/next.svg"
            alt="Recicla Aí"
            width={80}
            height={80}
            className="dark:invert"
          />
          <h1 className="text-2xl font-semibold text-zinc-900">Recicla Aí</h1>
          <p className="text-zinc-600 text-sm">Selecione seu papel para acessar a plataforma</p>

          <div className="w-full space-y-2">
            {roles.map((role) => (
              <motion.button
                key={role.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full py-3 px-4 rounded-xl text-left font-medium transition-colors",
                  selectedRole === role.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/40 text-muted-foreground hover:bg-muted/50"
                )}>
                <div className="flex items-start gap-3">
                  <Badge variant="default" className="mt-1 h-5 w-5 text-xs">
                    {role.label === "Cidadão" ? "♻️" : role.label === "Cooperativa" ? "🏭" : "🔧"}
                  </Badge>
                  <span>{role.label}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {selectedRole && (
            <motion.div
              className="mt-6 p-4 rounded-lg bg-primary/5 text-primary/20"
            >
              <p className="text-sm">
                Você selecionou: <strong className="font-medium">{selectedRole}</strong>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Redirect based on role
  const redirectPaths = {
    citizen: "/citizen",
    cooperative: "/cooperative", 
    admin: "/admin",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 py-24"
    >
      <div className="flex flex-col items-center max-w-md w-full space-y-4">
        <Image
          src="/next.svg"
          alt="Recicla Aí"
          width={80}
          height={80}
          className="dark:invert"
        />
        <h1 className="text-2xl font-semibold text-zinc-900">Recicla Aí</h1>
        <p className="text-zinc-600 text-sm">Selecione seu papel para acessar a plataforma</p>

        <div className="w-full space-y-2">
          {roles.map((role) => (
            <motion.button
              key={role.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full py-3 px-4 rounded-xl text-left font-medium transition-colors",
                selectedRole === role.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/40 text-muted-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-start gap-3">
                <Badge variant="default" className="mt-1 h-5 w-5 text-xs">
                  {role.label === "Cidadão" ? "♻️" : role.label === "Cooperativa" ? "🏭" : "🔧"}
                </Badge>
                <span>{role.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {selectedRole && (
          <motion.div
            className="mt-6 p-4 rounded-lg bg-primary/5 text-primary/20"
          >
            <p className="text-sm">
              Você selecionou: <strong className="font-medium">{selectedRole}</strong>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}