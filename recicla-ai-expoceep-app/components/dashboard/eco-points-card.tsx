"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEcoPoints, type EcoPoint } from "@/lib/api";

const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

function EcoPointsCard() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<EcoPoint | null>(null);
  const [points, setPoints] = useState<EcoPoint[]>([]);

  useEffect(() => {
    fetchEcoPoints()
      .then((data) => {
        setPoints(data);
        if (data.length > 0) setSelectedPoint(data[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-success" />
          <h2 className="text-sm font-semibold text-foreground">
            EcoPoints Proximos
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMapOpen(!isMapOpen)}
          className="gap-2"
        >
          <Navigation className="h-4 w-4" />
          {isMapOpen ? "Fechar Mapa" : "Ver no Mapa"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {points.map((point) => (
          <div
            key={point.id}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
              selectedPoint?.id === point.id
                ? "border-success bg-success/10"
                : "border-border/50 bg-muted/30 hover:bg-muted/50"
            }`}
            onClick={() => setSelectedPoint(point)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {point.nome}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {point.endereco}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Badge variant={point.status === "aberto" ? "success" : "destructive"}>
                {point.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isMapOpen && selectedPoint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springConfig}
            className="overflow-hidden mt-4"
          >
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border">
              <iframe
                title="EcoPoints Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedPoint.endereco)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="transition-opacity duration-500"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedPoint.lat},${selectedPoint.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground shadow-md hover:bg-background transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir no Google Maps
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { EcoPointsCard, EcoPointsCard as ecoPointsCard };
