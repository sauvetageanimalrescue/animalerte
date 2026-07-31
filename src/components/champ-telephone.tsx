"use client";

import { useState } from "react";

// Formate en 000-000-0000 au fur et à mesure de la saisie.
function formater(valeur: string): string {
  const d = valeur.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function ChampTelephone({
  name,
  className,
  required,
  defaultValue,
}: {
  name: string;
  className?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const [valeur, setValeur] = useState(formater(defaultValue ?? ""));

  return (
    <input
      name={name}
      type="tel"
      inputMode="numeric"
      required={required}
      value={valeur}
      onChange={(e) => setValeur(formater(e.target.value))}
      placeholder="000-000-0000"
      className={className}
    />
  );
}
