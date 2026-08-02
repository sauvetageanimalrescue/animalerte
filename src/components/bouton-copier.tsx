"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";

export function BoutonCopier({
  texte,
  labelCopier,
  labelCopie,
}: {
  texte: string;
  labelCopier: string;
  labelCopie: string;
}) {
  const [copie, setCopie] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setCopie(true);
          setTimeout(() => setCopie(false), 2000);
        } catch {
          /* presse-papier indisponible */
        }
      }}
      className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
    >
      {copie ? <IconCheck size={16} /> : <IconCopy size={16} />}
      {copie ? labelCopie : labelCopier}
    </button>
  );
}
