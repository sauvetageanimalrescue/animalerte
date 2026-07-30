"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { IconList, IconMap2 } from "@tabler/icons-react";
import type { PointCarte } from "./carte-annonces";

// La carte Leaflet touche `window` : chargement client uniquement.
const CarteAnnonces = dynamic(() => import("./carte-annonces"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] w-full animate-pulse rounded-2xl bg-brand-soft" />
  ),
});

export function VueResultats({
  liste,
  points,
  labels,
}: {
  liste: ReactNode;
  points: PointCarte[];
  labels: {
    vueListe: string;
    vueCarte: string;
    carteSansPosition: string;
  };
}) {
  const [vue, setVue] = useState<"liste" | "carte">("liste");
  const bouton = (actif: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
      actif ? "bg-brand text-white" : "text-brand-dark hover:bg-brand-soft"
    }`;

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-border bg-surface p-1">
        <button className={bouton(vue === "liste")} onClick={() => setVue("liste")}>
          <IconList size={16} />
          {labels.vueListe}
        </button>
        <button className={bouton(vue === "carte")} onClick={() => setVue("carte")}>
          <IconMap2 size={16} />
          {labels.vueCarte}
        </button>
      </div>

      {vue === "liste" ? (
        liste
      ) : (
        <div>
          <CarteAnnonces points={points} />
          {labels.carteSansPosition && (
            <p className="mt-2 text-xs text-muted">{labels.carteSansPosition}</p>
          )}
        </div>
      )}
    </div>
  );
}
