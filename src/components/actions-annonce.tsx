"use client";

import { IconCheck, IconRefresh, IconTrash } from "@tabler/icons-react";
import { basculerStatut, supprimerAnnonce } from "@/lib/actions/annonces";
import type { StatutAnnonce } from "@/lib/constants";

export function ActionsAnnonce({
  id,
  statut,
  labels,
}: {
  id: string;
  statut: StatutAnnonce;
  labels: {
    marquerResolu: string;
    marquerActif: string;
    supprimer: string;
    confirmerSuppression: string;
  };
}) {
  const prochainStatut = statut === "actif" ? "resolu" : "actif";

  return (
    <div className="flex flex-wrap gap-2">
      <form action={basculerStatut}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="statut" value={prochainStatut} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-brand-dark transition hover:bg-brand-soft"
        >
          {statut === "actif" ? (
            <>
              <IconCheck size={15} />
              {labels.marquerResolu}
            </>
          ) : (
            <>
              <IconRefresh size={15} />
              {labels.marquerActif}
            </>
          )}
        </button>
      </form>

      <form
        action={supprimerAnnonce}
        onSubmit={(e) => {
          if (!confirm(labels.confirmerSuppression)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full border border-perdu/30 px-3 py-1.5 text-sm font-medium text-perdu transition hover:bg-perdu-soft"
        >
          <IconTrash size={15} />
          {labels.supprimer}
        </button>
      </form>
    </div>
  );
}
