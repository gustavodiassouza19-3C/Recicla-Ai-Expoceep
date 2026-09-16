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
        <MapPin className="h-5 w-5 text-success" />
        <h2 className="text-sm font-semibold text-foreground">
          EcoPoints em Cascavel
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {ECO_POINTS.map((point, index) => (
          <a
            key={point.id}
            ref={(el) => { if (el) listRefs.current[index] = el; }}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.endereco + ", Cascavel/PR")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 px-4 py-3 cursor-pointer transition-colors opacity-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {point.nome}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {point.endereco}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export { EcoPointsCard, EcoPointsCard as ecoPointsCard };
