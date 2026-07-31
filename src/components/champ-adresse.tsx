"use client";

import { useEffect, useRef } from "react";

// Chargement paresseux et unique du script Google Maps + Places.
let chargement: Promise<void> | null = null;
function chargerGoogle(cle: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (chargement) return chargement;
  chargement = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${cle}&libraries=places&language=fr`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("échec du chargement de Google Maps"));
    document.head.appendChild(s);
  });
  return chargement;
}

// Champ d'adresse avec autocomplétion Google (Canada). Quand une adresse est
// choisie, remplit le champ et remonte les coordonnées via onSelect.
export function ChampAdresse({
  name,
  className,
  defaultValue,
  onSelect,
}: {
  name: string;
  className?: string;
  defaultValue?: string;
  onSelect?: (adresse: string, lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const cle = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!cle || !ref.current) return;
    chargerGoogle(cle)
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        if (!g?.maps?.places || !ref.current) return;
        const auto = new g.maps.places.Autocomplete(ref.current, {
          componentRestrictions: { country: "ca" },
          fields: ["formatted_address", "geometry"],
        });
        auto.addListener("place_changed", () => {
          const place = auto.getPlace();
          const loc = place.geometry?.location;
          const adresse: string = place.formatted_address ?? "";
          if (adresse && ref.current) ref.current.value = adresse;
          if (loc) onSelectRef.current?.(adresse, loc.lat(), loc.lng());
        });
      })
      .catch(() => {
        /* clé absente ou erreur réseau : le champ reste un simple texte */
      });
  }, [cle]);

  return (
    <input
      ref={ref}
      name={name}
      type="text"
      autoComplete="off"
      defaultValue={defaultValue}
      className={className}
    />
  );
}
