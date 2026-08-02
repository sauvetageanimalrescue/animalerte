import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconMapPin,
  IconPaw,
  IconPhone,
  IconArrowLeft,
  IconFileText,
  IconPencil,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { LIGNE_SANS_FRAIS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { formaterDate, nomDeRue } from "@/lib/format";
import {
  COULEURS,
  YEUX,
  TEMPERAMENTS,
  ETATS,
  formaterAge,
  formaterPoids,
} from "@/lib/champs";
import { nomRace } from "@/lib/races";
import { TypeBadge, StatutBadge } from "@/components/badges";
import { CarteDetail } from "@/components/carte-detail";

export default async function AnnoncePage({
  params,
}: PageProps<"/[locale]/annonces/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const annonce = await obtenirAnnonce(id);

  const [
    t,
    tE,
    tT,
    tS,
    tSexe,
    tP,
    tC,
    tChamp,
    tF,
    tA,
    tCoul,
    tYeux,
    tTemp,
    tEtat,
  ] = await Promise.all([
      getTranslations("annonce"),
      getTranslations("especes"),
      getTranslations("types"),
      getTranslations("statuts"),
      getTranslations("sexes"),
      getTranslations("provinces"),
      getTranslations("commun"),
      getTranslations("formulaire.champ"),
      getTranslations("formulaire"),
      getTranslations("affiche"),
      getTranslations("couleurs"),
      getTranslations("yeux"),
      getTranslations("temperaments"),
      getTranslations("etats"),
    ]);
  const langAge: "fr" | "en" = locale === "en" ? "en" : "fr";
  // Traduit un code de liste ; laisse tel quel si ce n'est pas un code connu
  // (compatibilité avec d'anciennes données en texte libre).
  const trad = (
    tr: (k: string) => string,
    arr: readonly string[],
    v: string | null,
  ) => (v && arr.includes(v) ? tr(v) : v);

  if (!annonce) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">
        {t("introuvable")}
      </div>
    );
  }

  const titre = annonce.nom_animal || tE(annonce.espece);

  const ouiNon = (b: boolean | null) =>
    b === null ? null : b ? tF("oui") : tF("non");
  const micropuceVal =
    annonce.micropuce === null
      ? null
      : annonce.micropuce_numero
        ? `${ouiNon(true)} (${annonce.micropuce_numero})`
        : ouiNon(annonce.micropuce);

  const opt = (label: string, valeur: string | null | undefined) =>
    valeur ? [{ label, valeur }] : [];

  const dateChamp =
    annonce.type === "perdu"
      ? tChamp("dateEvenement")
      : tChamp("dateDecouverte");

  // Champs regroupés logiquement pour la fiche publique.
  const groupeAnimal: { label: string; valeur: string }[] = [
    ...(annonce.type === "trouve"
      ? opt(tChamp("etat"), trad(tEtat, ETATS, annonce.etat))
      : []),
    { label: t("espece"), valeur: tE(annonce.espece) },
    ...opt(t("race"), nomRace(annonce.race, annonce.espece, langAge)),
    { label: t("sexe"), valeur: tSexe(annonce.sexe) },
    ...opt(
      tChamp("age"),
      annonce.age ? formaterAge(annonce.age, langAge) : null,
    ),
    ...opt(t("couleur"), trad(tCoul, COULEURS, annonce.couleur)),
    ...opt(tChamp("couleurYeux"), trad(tYeux, YEUX, annonce.couleur_yeux)),
    ...opt(
      tChamp("poids"),
      annonce.poids ? formaterPoids(annonce.poids) : null,
    ),
    ...opt(tChamp("sterilise"), ouiNon(annonce.sterilise)),
    ...opt(tChamp("signesDistinctifs"), annonce.signes_distinctifs),
    ...opt(tChamp("accessoires"), annonce.accessoires),
    ...opt(tChamp("micropuce"), micropuceVal),
    ...opt(tChamp("temperament"), trad(tTemp, TEMPERAMENTS, annonce.temperament)),
  ];
  const groupeLieu: { label: string; valeur: string }[] = [
    { label: dateChamp, valeur: formaterDate(annonce.date_evenement, locale) },
    ...opt(tChamp("heure"), annonce.heure_approx),
    ...opt(tChamp("secteur"), nomDeRue(annonce.adresse)),
    ...opt(tChamp("precisionLieu"), annonce.dernier_lieu_vu),
  ];
  const groupeRecompense: { label: string; valeur: string }[] = [
    ...opt(
      tChamp("recompense"),
      annonce.recompense ? annonce.recompense_montant || tF("oui") : null,
    ),
  ];

  // Les 4 chiffres du dossier = poste à composer sur la ligne animALERTE.
  const poste = annonce.numero_dossier
    ? annonce.numero_dossier.replace(/^\d+-/, "")
    : null;

  // Le propriétaire de l'annonce voit des outils supplémentaires (affiche,
  // modification). La génération d'affiche est une fonction du forfait payant.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const estProprietaire = !!user && user.id === annonce.user_id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/recherche"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
      >
        <IconArrowLeft size={16} />
        {tC("retour")}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-brand-soft">
          {annonce.photo_url ? (
            <Image
              src={annonce.photo_url}
              alt={titre}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand/40">
              <IconPaw size={64} />
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TypeBadge type={annonce.type} label={tT(annonce.type)} />
            <StatutBadge statut={annonce.statut} label={tS(annonce.statut)} />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark">{titre}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted">
            <IconMapPin size={16} />
            {annonce.ville}, {tP(annonce.province)}
          </p>
          {annonce.numero_dossier && (
            <p className="mt-1 text-xs text-muted">
              {t("dossier")} {annonce.numero_dossier}
            </p>
          )}

          {[groupeAnimal, groupeLieu, groupeRecompense].map((grp, i) =>
            grp.length === 0 ? null : (
              <dl
                key={i}
                className={`grid grid-cols-2 gap-x-4 gap-y-3 ${
                  i === 0 ? "mt-6" : "mt-5 border-t border-border pt-5"
                }`}
              >
                {grp.map((l) => (
                  <div key={l.label}>
                    <dt className="text-xs uppercase tracking-wide text-muted">
                      {l.label}
                    </dt>
                    <dd className="font-medium text-foreground">{l.valeur}</dd>
                  </div>
                ))}
              </dl>
            ),
          )}

          {annonce.description && (
            <div className="mt-5 border-t border-border pt-5">
              <dt className="text-xs uppercase tracking-wide text-muted">
                {t("description")}
              </dt>
              <p className="mt-1 whitespace-pre-line text-foreground">
                {annonce.description}
              </p>
            </div>
          )}

          {/* Ligne animALERTE (contact anonyme, coordonnées jamais exposées) */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">{t("infoTitre")}</p>
            <a
              href={`tel:${LIGNE_SANS_FRAIS.replace(/-/g, "")}`}
              className="mt-1 inline-flex items-center gap-2 text-2xl font-extrabold text-accent"
            >
              <IconPhone size={22} />
              1&nbsp;833&nbsp;999&nbsp;AIDE
            </a>
            <p className="mt-1 text-sm text-brand">
              {LIGNE_SANS_FRAIS.replace(/-/g, " ")}
              {poste ? ` · ${t("poste")} ${poste}` : ""}
            </p>
            <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted">
              {t("ligneExplication")}
            </p>
          </div>

          {estProprietaire && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/annonces/${annonce.id}/modifier`}
                className="inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2.5 font-semibold text-brand transition hover:bg-brand-soft"
              >
                <IconPencil size={18} />
                {tC("modifier")}
              </Link>
              <a
                href={`/api/affiche/${annonce.id}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition hover:brightness-95"
              >
                <IconFileText size={18} />
                {tA("genererCta")}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Carte */}
      {annonce.latitude != null && annonce.longitude != null && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-1.5 font-semibold text-brand-dark">
            <IconMapPin size={18} />
            {t("lieu")}
          </h2>
          <CarteDetail
            point={{
              id: annonce.id,
              lat: annonce.latitude,
              lng: annonce.longitude,
              type: annonce.type,
              titre,
              ville: annonce.ville,
            }}
          />
        </div>
      )}
    </div>
  );
}
