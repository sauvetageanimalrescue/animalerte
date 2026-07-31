"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Centre par défaut : sud du Québec (là où se trouve la population).
const CENTRE_QUEBEC: [number, number] = [46.5, -72.0];

const icone = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:#0c5679;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

function GestionClic({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Recentre la carte quand la position change (ex. adresse choisie).
function Recentrer({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function CarteSelecteur({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const centre: [number, number] =
    lat != null && lng != null ? [lat, lng] : CENTRE_QUEBEC;

  return (
    <MapContainer
      center={centre}
      zoom={lat != null ? 13 : 6}
      scrollWheelZoom
      className="h-72 w-full rounded-2xl border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GestionClic onPick={onPick} />
      <Recentrer lat={lat} lng={lng} />
      {lat != null && lng != null && (
        <Marker position={[lat, lng]} icon={icone} />
      )}
    </MapContainer>
  );
}
