"use client";

import { IconPrinter } from "@tabler/icons-react";

export function BoutonImprimer({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
    >
      <IconPrinter size={18} />
      {label}
    </button>
  );
}
