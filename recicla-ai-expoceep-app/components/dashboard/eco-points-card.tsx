"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { animate, stagger } from "animejs";

const ECO_POINTS = [
  { id: 1, nome: "Ecoponto Manaus", endereco: "Rua Manaus, 1524 – Country" },
  { id: 2, nome: "Ecoponto Brasília - Unicacoop", endereco: "Rua Valmor Frasson, 79 – Brasília" },
  { id: 3, nome: "Ecoponto Melissa", endereco: "Rua Hibiscos, 153–181 – Brasmadeira" },
  { id: 4, nome: "Ecoponto Quebec", endereco: "Rua Aparecida dos Portos – Guarujá" },
  { id: 5, nome: "Ecoponto Cascavel Velho", endereco: "Cascavel Velho" },
  { id: 6, nome: "Ecoponto Santa Cruz", endereco: "Santa Cruz" },
];

function EcoPointsCard() {
  const listRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const items = listRefs.current.filter(Boolean);
    if (items.length === 0) return;
    animate(items, {
      opacity: [0, 1],
      translateX: [-15, 0],
      duration: 500,
      delay: stagger(80),
      ease: "outExpo",
    });
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 border-2 border-success bg-success/10" style={{ borderRadius: 2 }}>
          <MapPin className="h-4 w-4 text-success" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          EcoPoints em Cascavel
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {ECO_POINTS.map((point, index) => (
          <a
            key={point.id}
            ref={(el) => { if (el) listRefs.current[index] = el; }}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.endereco + ", Cascavel/PR")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border-2 border-success/30 bg-card px-4 py-3 cursor-pointer opacity-0 transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0_theme(colors.success/20)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{ borderRadius: 2 }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-foreground truncate">
                {point.nome}
              </p>
              <p className="text-xs text-success/60 font-medium truncate mt-0.5">
                {point.endereco}
              </p>
            </div>
            <span className="text-xs font-bold text-success/40 group-hover:text-success transition-colors ml-3">
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export { EcoPointsCard, EcoPointsCard as ecoPointsCard };
