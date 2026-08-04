import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { IconSparkles, IconMapPin, IconPaw } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { Annonce } from "@/lib/types";
import { pistesFlair } from "@/lib/flair-jumelage";
import { peut } from "@/lib/forfaits";
import { formaterDate } from "@/lib/format";

// Section « Correspondances trouvées par flAIr » sur la fiche (vue propriétaire).
// Réservée aux forfaits Régionale+ (fonction payante). Sous ce forfait, on
// affiche plutôt une invitation à débloquer flAIr.
export async function PistesFlair({ annonce }: { annonce: Annonce }) {
  const t = await getTranslations("pistesFlair");
  const tE = await getTranslations("especes");
  const locale = await getLocale();

  // Verrou : flAIr est inclus dès l'Alerte régionale.
  if (!peut(annonce.forfait, "flair")) {
    return (
      <section className="mt-10 rounded-2xl border border-brand/30 bg-brand-soft p-5">
        <h2 className="flex items-center gap-2 font-bold text-brand-dark">
          <IconSparkles size={20} className="text-brand" />
          {t("titre")}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          {t("verrou")}
        </p>
        <Link
          href={`/annonces/${annonce.id}/forfait`}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <IconSparkles size={16} />
          {t("debloquer")}
        </Link>
      </section>
    );
  }

  const pistes = await pistesFlair(annonce);

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-bold text-brand-dark">
        <IconSparkles size={20} className="text-brand" />
        {t("titre")}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t("sousTitre")}</p>

      {pistes.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          {t("aucune")}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pistes.map((p) => {
            const titre = p.annonce.nom_animal || tE(p.annonce.espece);
            return (
              <Link
                key={p.annonce.id}
                href={`/annonces/${p.annonce.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-brand hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-brand-soft">
                  {p.annonce.photo_url ? (
                    <Image
                      src={p.annonce.photo_url}
                      alt={titre}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand/40">
                      <IconPaw size={40} />
                    </div>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold text-white ${
                      p.niveau === "forte" ? "bg-accent" : "bg-brand"
                    }`}
                  >
                    {t(`niveau.${p.niveau}`)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h3 className="font-bold text-brand-dark group-hover:text-brand">
                    {titre}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <IconMapPin size={13} />
                    {p.annonce.ville}
                    {" · "}
                    {formaterDate(p.annonce.date_evenement, locale)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.distanceKm != null && (
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-dark">
                        {t("aKm", { km: p.distanceKm })}
                      </span>
                    )}
                    {p.raisons
                      .filter(
                        (r) =>
                          !["tres_proche", "proche", "secteur"].includes(r),
                      )
                      .map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-dark"
                        >
                          {t(`raisons.${r}`)}
                        </span>
                      ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
