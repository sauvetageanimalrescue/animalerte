import type { StatutAnnonce, TypeAnnonce } from "@/lib/constants";

// Pastille du forfait, avec le code de couleur d'escalade du comparatif :
// gratuit = gris, locale = bleu clair, régionale = marine, provinciale = rouge.
export function ForfaitBadge({
  forfait,
  label,
}: {
  forfait: string;
  label: string;
}) {
  const styles: Record<string, string> = {
    gratuit: "bg-slate-500 text-white",
    locale: "bg-brand-light text-white",
    regional: "bg-brand text-white",
    provincial: "bg-accent text-white",
  };
  const cls = styles[forfait];
  if (!cls) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

export function TypeBadge({
  type,
  label,
}: {
  type: TypeAnnonce;
  label: string;
}) {
  const styles =
    type === "perdu"
      ? "bg-perdu-soft text-perdu"
      : "bg-trouve-soft text-trouve";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${styles}`}
    >
      {label}
    </span>
  );
}

export function StatutBadge({
  statut,
  label,
}: {
  statut: StatutAnnonce;
  label: string;
}) {
  if (statut === "actif") return null;
  return (
    <span className="inline-flex items-center rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-medium text-muted">
      {label}
    </span>
  );
}
