"use client";

import { useEffect, useRef } from "react";
import { chargerGoogle } from "./champ-adresse";

// Champ « ville » avec autocomplétion Google restreinte aux villes du Québec.
// La personne choisit dans la liste → orthographe officielle garantie, et on
// remonte les coordonnées (champs cachés) pour cibler le rayon des alertes.
export function ChampVille({
  name,
  latName,
  lngName,
  className,
  defaultValue,
  defaultLat,
  defaultLng,
  required,
}: {
  name: string;
  latName: string;
  lngName: string;
  className?: string;
  defaultValue?: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);
  const cle = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!cle || !ref.current) return;
    chargerGoogle(cle)
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        if (!g?.maps?.places || !ref.current) return;
        // Cadre approximatif du Québec pour restreindre les suggestions.
        const bounds = new g.maps.LatLngBounds(
          new g.maps.LatLng(44.99, -79.77),
          new g.maps.LatLng(62.59, -57.1),
        );
        const auto = new g.maps.places.Autocomplete(ref.current, {
          types: ["(cities)"],
          componentRestrictions: { country: "ca" },
          bounds,
          strictBounds: true,
          fields: ["name", "geometry"],
        });
        auto.addListener("place_changed", () => {
          const place = auto.getPlace();
          const loc = place.geometry?.location;
          const ville: string = place.name ?? "";
          if (ville && ref.current) ref.current.value = ville;
          if (loc) {
            if (latRef.current) latRef.current.value = String(loc.lat());
            if (lngRef.current) lngRef.current.value = String(loc.lng());
          }
        });
      })
      .catch(() => {
        /* clé absente ou erreur : le champ reste un simple texte */
      });
  }, [cle]);

  return (
    <>
      <input
        ref={ref}
        name={name}
        type="text"
        autoComplete="off"
        defaultValue={defaultValue}
        required={required}
        className={className}
      />
      <input
        ref={latRef}
        type="hidden"
        name={latName}
        defaultValue={defaultLat ?? ""}
      />
      <input
        ref={lngRef}
        type="hidden"
        name={lngName}
        defaultValue={defaultLng ?? ""}
      />
    </>
  );
}
