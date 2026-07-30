"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/i18n/navigation";
import type { TypeAnnonce } from "@/lib/constants";

export type PointCarte = {
  id: string;
  lat: number;
  lng: number;
  type: TypeAnnonce;
  titre: string;
  ville: string;
};

// Épingle colorée (rouge = perdu, vert = trouvé) sans dépendre des images
// par défaut de Leaflet, qui se chargent mal via le bundler.
function icone(type: TypeAnnonce) {
  const couleur = type === "perdu" ? "#ce1f2b" : "#16a34a";
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:${couleur};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -18],
  });
}

// Centre par défaut : Canada.
const CENTRE_CANADA: [number, number] = [56.13, -96.35];

export default function CarteAnnonces({
  points,
  hauteurClasse = "h-[70vh]",
  zoomInitial,
}: {
  points: PointCarte[];
  hauteurClasse?: string;
  zoomInitial?: number;
}) {
  const centre =
    points.length > 0 ? ([points[0].lat, points[0].lng] as [number, number]) : CENTRE_CANADA;
  const zoom = zoomInitial ?? (points.length > 0 ? 6 : 4);

  return (
    <MapContainer
      center={centre}
      zoom={zoom}
      scrollWheelZoom
      className={`${hauteurClasse} w-full rounded-2xl border border-border`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icone(p.type)}>
          <Popup>
            <Link
              href={`/annonces/${p.id}`}
              className="font-semibold text-brand-dark underline"
            >
              {p.titre}
            </Link>
            <div className="text-xs text-muted">{p.ville}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
