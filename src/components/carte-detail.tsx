"use client";

import dynamic from "next/dynamic";
import type { PointCarte } from "./carte-annonces";

const CarteAnnonces = dynamic(() => import("./carte-annonces"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-2xl bg-brand-soft" />
  ),
});

export function CarteDetail({ point }: { point: PointCarte }) {
  return (
    <CarteAnnonces points={[point]} hauteurClasse="h-72" zoomInitial={13} />
  );
}
