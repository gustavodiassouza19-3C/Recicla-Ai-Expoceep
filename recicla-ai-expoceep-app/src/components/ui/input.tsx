import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Campo de texto.
 *
 * A casca segue o Supabase Auth UI (foco led pela cor da borda, transicao
 * curta em border/background, tracking zerado no campo) adaptada aos tokens do
 * site. Tres divergencias deliberadas em relacao ao Supabase:
 *
 * - `h-11` em vez dos ~40px de padding dele, porque o alvo minimo de toque do
 *   projeto e 44pt.
 * - `text-base` (16px) em vez de 14px: abaixo de 16px o Safari do iOS da zoom
 *   no foco e a pagina fica deslocada.
 * - Sem a classe `squircle`: o filtro url(#SquiCircleFilter) borra o SourceGraphic
 *   inteiro e o feColorMatrix depois vira os glifos do texto em manchas escuras,
 *   deixando placeholder e rotulo com halo. Em elemento que contem texto o
 *   filtro e destrutivo, entao o campo usa so o raio da escala. Card, badge e
 *   skeleton continuam com o squircle.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-field-border bg-background px-3.5",
        "text-base tracking-normal text-foreground",
        "transition-[border-color,background-color] duration-100 ease-out",
        "placeholder:text-field-placeholder",
        "hover:border-field-border-hover",
        "focus-visible:border-field-border-focus focus-visible:outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input, Input as input };
