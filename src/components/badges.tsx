import type { StatutAnnonce, TypeAnnonce } from "@/lib/constants";

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
