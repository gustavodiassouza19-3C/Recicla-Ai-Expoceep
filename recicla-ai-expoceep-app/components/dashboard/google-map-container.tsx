"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type EcoPoint } from "@/lib/api";

const CASCAVEL_CENTER: [number, number] = [-24.9527, -53.4581];

function createMarkerIcon(status: string) {
  const color = status === "aberto" ? "#22c55e" : "#ef4444";
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
  });
}

function FlyToPoint({ point }: { point: EcoPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (point) {
      map.flyTo([point.lat, point.lng], 15, { duration: 0.8 });
    }
  }, [point, map]);
  return null;
}

interface EcoPointMapProps {
  points: EcoPoint[];
  selectedPoint: EcoPoint | null;
  onSelectPoint: (point: EcoPoint | null) => void;
}

export function EcoPointMap({ points, selectedPoint, onSelectPoint }: EcoPointMapProps) {
  return (
    <MapContainer
      center={CASCAVEL_CENTER}
      zoom={12}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToPoint point={selectedPoint} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createMarkerIcon(point.status)}
          eventHandlers={{
            click: () => onSelectPoint(point),
          }}
        >
          <Popup>
            <div style={{ fontFamily: "system-ui, sans-serif", padding: 4 }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>
                {point.nome}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.endereco + ", Cascavel/PR")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#2563eb", margin: "4px 0 0", textDecoration: "underline", cursor: "pointer" }}
              >
                {point.endereco}
              </a>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  color: point.status === "aberto" ? "#166534" : "#991b1b",
                  background: point.status === "aberto" ? "#dcfce7" : "#fee2e2",
                }}
              >
                {point.status}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default EcoPointMap;
