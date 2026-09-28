import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Select nativo com a mesma casca do Input.
 *
 * Existia um `<select>` solto no registro com `rounded-xl` enquanto os inputs
 * da mesma volta usavam `rounded-md` (8px contra 16px). Centralizar a casca em
 * um componente elimina a divergencia na origem. O `squircle` fica de fora pelo
 * mesmo motivo do Input: o filtro borra o texto renderizado dentro do elemento.
 */
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        // Sem appearance-none: a seta nativa da plataforma continua visivel e
        // o pr-9 abre espaco para ela. Um appearance-none sem seta propria
        // entregaria um campo sem nenhuma indicacao de que e um select.
        "flex h-11 w-full rounded-lg border border-field-border bg-background py-0 pl-3.5 pr-9",
        "text-base tracking-normal text-foreground",
        "transition-[border-color,background-color] duration-100 ease-out",
        "hover:border-field-border-hover",
        "focus-visible:border-field-border-focus focus-visible:outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export { Select, Select as select };
