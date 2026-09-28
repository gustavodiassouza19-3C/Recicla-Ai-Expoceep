"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Minimo aceito pelo Supabase Auth. Abaixo disso o signUp rejeita. */
export const PASSWORD_MIN_LENGTH = 6;

const LEVELS = [
  { label: "Muito fraca", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fraca", bar: "bg-destructive", text: "text-destructive" },
  { label: "Razoavel", bar: "bg-warning", text: "text-warning" },
  { label: "Boa", bar: "bg-success", text: "text-success" },
  { label: "Forte", bar: "bg-success", text: "text-success" },
] as const;

const REQUIREMENTS = [
  { id: "length", label: `${PASSWORD_MIN_LENGTH} caracteres ou mais` },
  { id: "case", label: "Letra maiuscula e minuscula" },
  { id: "number", label: "Um numero" },
  { id: "symbol", label: "Um simbolo" },
] as const;

type RequirementId = (typeof REQUIREMENTS)[number]["id"];

export function scorePassword(password: string) {
  const met = new Set<RequirementId>();

  if (password.length >= PASSWORD_MIN_LENGTH) met.add("length");
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) met.add("case");
  if (/\d/.test(password)) met.add("number");
  if (/[^\w\s]/.test(password)) met.add("symbol");

  const score = met.size;
  const level = password.length === 0 ? 0 : Math.min(score + 1, 4);

  return { met, score, level, valid: password.length >= PASSWORD_MIN_LENGTH };
}

export type PasswordStrengthProps = {
  password: string;
  className?: string;
};

/**
 * Medidor de forca no modelo do Supabase Auth UI: quatro segmentos e o nome do
 * nivel, mais a lista de requisitos com o que ainda falta. Fica oculto enquanto
 * nao ha nada digitado para nao empurrar o formulario para baixo na abertura.
 */
export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  if (!password) return null;

  const { met, level } = scorePassword(password);
  const { label, bar, text } = LEVELS[level];

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="progressbar"
        aria-label="Forca da senha"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={level}
        aria-valuetext={label}
        className="flex gap-1"
      >
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full bg-border transition-colors",
              index < level && bar
            )}
          />
        ))}
      </div>

      <p className={cn("text-xs font-medium", text)} aria-live="polite">
        Senha {label.toLowerCase()}
      </p>

      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {REQUIREMENTS.map((requirement) => {
          const done = met.has(requirement.id);
          return (
            <li
              key={requirement.id}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                done ? "text-success" : "text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { PasswordStrength as passwordStrength };
