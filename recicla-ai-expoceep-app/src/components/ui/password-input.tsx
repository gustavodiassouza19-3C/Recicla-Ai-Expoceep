"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

/**
 * Campo de senha com alternancia de visibilidade, como no Supabase Auth UI.
 *
 * Os dois icones ficam empilhados no mesmo quadrante e o estado troca entre
 * visivel e recolhido: o icone que sai encolhe e gira, o que entra cresce
 * girando pelo caminho oposto. Como os dois ocupam o mesmo espaco, a troca
 * parece um unico icone se transformando em vez de um salto seco.
 *
 * O botao e posicionado com h-11/w-11 encostado na borda para ter 44px de
 * alvo, e o campo ganha pr-12 para o texto nao passar por baixo dele.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          className={cn(
            "absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-lg",
            "text-muted-foreground transition-colors duration-150",
            "hover:text-foreground active:scale-90",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
            "motion-reduce:transition-none motion-reduce:active:scale-100"
          )}
        >
          <span className="relative block h-4 w-4" aria-hidden>
            <Eye
              className={cn(
                "absolute inset-0 h-4 w-4 transition-all duration-200 ease-out",
                "motion-reduce:transition-none",
                visible
                  ? "scale-50 -rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100"
              )}
            />
            <EyeOff
              className={cn(
                "absolute inset-0 h-4 w-4 transition-all duration-200 ease-out",
                "motion-reduce:transition-none",
                visible
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-50 rotate-90 opacity-0"
              )}
            />
          </span>
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput, PasswordInput as passwordInput };
