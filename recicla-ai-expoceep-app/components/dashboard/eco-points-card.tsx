"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchEcoPoints, type EcoPoint } from "@/lib/api";
import { EcoPointMap } from "./google-map-container";
import { animate, stagger } from "animejs";

function EcoPointsCard() {
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<EcoPoint | null>(null);
  const [points, setPoints] = useState<EcoPoint[]>([]);
  const listRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    fetchEcoPoints()
      .then((data) => {
        setPoints(data);
        if (data.length > 0) setSelectedPoint(data[0]);
      })
      .catch(() => {});
  }, []);

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
  }, [points]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-success" />
          <h2 className="text-sm font-semibold text-foreground">
            EcoPoints em Cascavel
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMapOpen(!isMapOpen)}
          className="gap-2"
        >
          <Navigation className="h-4 w-4" />
          {isMapOpen ? "Esconder Mapa" : "Ver Mapa"}
        </Button>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {points.map((point, index) => (
          <div
            key={point.id}
            ref={(el) => { if (el) listRefs.current[index] = el; }}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors opacity-0 ${
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

      <motion.div
        initial={false}
        animate={{ height: isMapOpen ? "auto" : 0, opacity: isMapOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border">
          <EcoPointMap
            points={points}
            selectedPoint={selectedPoint}
            onSelectPoint={setSelectedPoint}
          />
        </div>
      </motion.div>
    </div>
  );
}

export { EcoPointsCard, EcoPointsCard as ecoPointsCard };
