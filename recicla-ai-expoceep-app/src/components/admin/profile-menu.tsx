"use client";

import { ChevronDown, Leaf, LogOut, Mail, Repeat2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { usePoints } from "@/contexts/points-context";
import { getInitials, getTipoLabel } from "@/lib/eco-level";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Perfil do admin dentro do painel. O Header do app esconde a rota
 * /admin-dashboard, entao sem este menu nao havia nenhuma forma de sair da
 * conta a partir do painel.
 */
export function ProfileMenu() {
  const { user, logout } = useAuth();
  const { points, refetchPoints } = usePoints();

  if (!user) return null;

  const linhas = [
    { icon: Mail, label: "E-mail", valor: user.email },
    { icon: ShieldCheck, label: "Perfil", valor: getTipoLabel(user.tipo) },
    { icon: Leaf, label: "Pontos", valor: `${points} pontos` },
  ];

  // O AuthGuard manda toda rota privada para /login no momento em que a
  // sessao cai, entao um ?trocar=1 na URL seria engolido pelo replace.
  // A flag vive no sessionStorage e a tela de login consome na montagem.
  const trocarConta = () => {
    window.sessionStorage.setItem("troca_de_conta", "1");
    logout();
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) void refetchPoints(); }}>
      <DropdownMenuTrigger
        aria-label={`Menu do perfil de ${user.nome}`}
        className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 text-left shadow-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring sm:w-auto"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-[11px] font-bold text-success"
          >
            {getInitials(user.nome)}
          </span>
          <span className="min-w-0 truncate text-sm font-semibold text-foreground">
            {user.nome}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <div className="border-b border-border px-3 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{user.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <Badge variant="success" className="mt-2">
            {getTipoLabel(user.tipo)}
          </Badge>
        </div>

        <ul className="py-1">
          {linhas.map((linha) => (
            <li key={linha.label} className="flex items-start gap-2 px-3 py-2">
              <linha.icon
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{linha.label}</span>
                <span className="block break-words text-sm font-medium text-foreground">
                  {linha.valor}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <DropdownMenuSeparator />

        <div className="py-1">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => logout()}
            className="min-h-11 gap-2 px-3 text-sm font-medium"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair da conta
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={trocarConta}
            className="min-h-11 gap-2 px-3 text-sm font-medium"
          >
            <Repeat2 className="size-4" aria-hidden="true" />
            Trocar de conta
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
