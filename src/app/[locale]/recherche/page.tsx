import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconFilter, IconX } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { ESPECES, PROVINCES, STATUTS_ANNONCE, TYPES_ANNONCE } from "@/lib/constants";
import { rechercherAnnonces, type FiltresRecherche } from "@/lib/annonces";
import { AnnonceCard } from "@/components/annonce-card";
import { VueResultats } from "@/components/vue-resultats";
import type { PointCarte } from "@/components/carte-annonces";

function premier(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export default async function RecherchePage({
  params,
  searchParams,
}: PageProps<"/[locale]/recherche">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const filtres: FiltresRecherche = {
    motCle: premier(sp.motCle),
    type: premier(sp.type),
    espece: premier(sp.espece),
    province: premier(sp.province),
    ville: premier(sp.ville),
    statut: premier(sp.statut) || "actif",
  };

  const [t, tE, tT, tS, tP] = await Promise.all([
    getTranslations("recherche"),
    getTranslations("especes"),
    getTranslations("types"),
    getTranslations("statuts"),
    getTranslations("provinces"),
  ]);

  const annonces = await rechercherAnnonces(filtres);

  const points: PointCarte[] = annonces
    .filter((a) => a.latitude != null && a.longitude != null)
    .map((a) => ({
      id: a.id,
      lat: a.latitude as number,
      lng: a.longitude as number,
      type: a.type,
      titre: a.nom_animal || tE(a.espece),
      ville: a.ville,
    }));

  const champClasses =
    "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none";

  const liste =
    annonces.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted">
        {t("aucunResultat")}
      </p>
    ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {annonces.map((a) => (
          <AnnonceCard key={a.id} annonce={a} />
        ))}
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t("titre")}</h1>

      {/* Filtres : formulaire GET, aucun JavaScript requis. */}
      <form
        method="get"
        className="mb-8 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-muted lg:col-span-3">
          {t("motCle")}
          <input
            type="text"
            name="motCle"
            defaultValue={filtres.motCle}
            className={champClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("type")}
          <select name="type" defaultValue={filtres.type} className={champClasses}>
            <option value="">{t("tous")}</option>
            {TYPES_ANNONCE.map((v) => (
              <option key={v} value={v}>
                {tT(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("espece")}
          <select name="espece" defaultValue={filtres.espece} className={champClasses}>
            <option value="">{t("toutes")}</option>
            {ESPECES.map((v) => (
              <option key={v} value={v}>
                {tE(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("statut")}
          <select name="statut" defaultValue={filtres.statut} className={champClasses}>
            <option value="">{t("tous")}</option>
            {STATUTS_ANNONCE.map((v) => (
              <option key={v} value={v}>
                {tS(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("province")}
          <select name="province" defaultValue={filtres.province} className={champClasses}>
            <option value="">{t("toutes")}</option>
            {PROVINCES.map((v) => (
              <option key={v} value={v}>
                {tP(v)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("ville")}
          <input
            type="text"
            name="ville"
            defaultValue={filtres.ville}
            className={champClasses}
          />
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <IconFilter size={16} />
            {t("filtrer")}
          </button>
          <Link
            href="/recherche"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-brand-soft"
          >
            <IconX size={16} />
            {t("reinitialiser")}
          </Link>
        </div>
      </form>

      <p className="mb-4 text-sm font-medium text-muted">
        {t("resultats", { count: annonces.length })}
      </p>

      <VueResultats
        liste={liste}
        points={points}
        labels={{
          vueListe: t("vueListe"),
          vueCarte: t("vueCarte"),
          carteSansPosition:
            points.length < annonces.length ? t("carteSansPosition") : "",
        }}
      />
    </div>
  );
}
