"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Grainient } from "@/components/ui/grainient";
import { resolveCssColor, type ColorTriplet } from "@/lib/css-color";
import { cn } from "@/lib/utils";

const GRADIENT_TOKENS = [
  "--auth-gradient-1",
  "--auth-gradient-2",
  "--auth-gradient-3",
] as const;

const FALLBACK_COLOR: ColorTriplet = [0.1, 0.1, 0.1];

function readGradientTokens(): [ColorTriplet, ColorTriplet, ColorTriplet] {
  const [first, second, third] = GRADIENT_TOKENS.map((token) =>
    resolveCssColor(`var(${token})`)
  );
  return [first ?? FALLBACK_COLOR, second ?? FALLBACK_COLOR, third ?? FALLBACK_COLOR];
}

const emptySubscribe = () => () => {};

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export type AuthGradientBackgroundProps = {
  className?: string;
};

/**
 * Fundo animado do painel direito do login.
 *
 * Usa o shader Grainient apenas onde ele agrega: desktop e sem preferencia por
 * movimento reduzido. Em mobile, com `prefers-reduced-motion` ou quando o
 * WebGL nao esta disponivel, o gradiente estatico em CSS permanece visivel
 * como fallback.
 */
export function AuthGradientBackground({
  className,
}: AuthGradientBackgroundProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Os tokens so existem no navegador. O snapshot do servidor mantem o
  // fallback estatico na primeira renderizacao, evitando divergencia de
  // hidratacao, e a leitura acontece logo apos a hidratacao.
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const colors = useMemo(
    () => (isHydrated ? readGradientTokens() : null),
    [isHydrated]
  );

  const enableWebGL = isDesktop && !prefersReducedMotion && colors !== null;

  return (
    <div
      data-slot="auth-gradient-background"
      aria-hidden="true"
      className={cn(
        "auth-gradient-static pointer-events-none absolute inset-0",
        className
      )}
    >
      {enableWebGL ? (
        <Grainient
          className="absolute inset-0"
          color1={colors[0]}
          color2={colors[1]}
          color3={colors[2]}
          timeSpeed={0.22}
          warpStrength={1.1}
          warpFrequency={4.2}
          warpSpeed={1.6}
          warpAmplitude={52}
          rotationAmount={420}
          noiseScale={2.4}
          grainAmount={0.085}
          grainScale={2.4}
          contrast={1.1}
          saturation={1.0}
          zoom={0.95}
          blendSoftness={0.08}
        />
      ) : null}
    </div>
  );
}

export { AuthGradientBackground as authGradientBackground };
