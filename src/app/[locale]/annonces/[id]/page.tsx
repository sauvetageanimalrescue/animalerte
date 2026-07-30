import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconMail,
  IconMapPin,
  IconPaw,
  IconPhone,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { obtenirAnnonce } from "@/lib/annonces";
import { formaterDate } from "@/lib/format";
import { TypeBadge, StatutBadge } from "@/components/badges";
import { CarteDetail } from "@/components/carte-detail";

export default async function AnnoncePage({
  params,
}: PageProps<"/[locale]/annonces/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const annonce = await obtenirAnnonce(id);

  const [t, tE, tT, tS, tSexe, tP, tC] = await Promise.all([
    getTranslations("annonce"),
    getTranslations("especes"),
    getTranslations("types"),
    getTranslations("statuts"),
    getTranslations("sexes"),
    getTranslations("provinces"),
    getTranslations("commun"),
  ]);

  if (!annonce) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">
        {t("introuvable")}
      </div>
    );
  }

  const titre = annonce.nom_animal || tE(annonce.espece);
  const dateLabel =
    annonce.type === "perdu"
      ? t("disparuLe", { date: formaterDate(annonce.date_evenement, locale) })
      : t("trouveLe", { date: formaterDate(annonce.date_evenement, locale) });

  const lignes: { label: string; valeur: string }[] = [
    { label: t("espece"), valeur: tE(annonce.espece) },
    ...(annonce.race ? [{ label: t("race"), valeur: annonce.race }] : []),
    { label: t("sexe"), valeur: tSexe(annonce.sexe) },
    ...(annonce.couleur ? [{ label: t("couleur"), valeur: annonce.couleur }] : []),
  ];

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
          <p className="mt-1 text-sm text-muted">{dateLabel}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
            {lignes.map((l) => (
              <div key={l.label}>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  {l.label}
                </dt>
                <dd className="font-medium text-foreground">{l.valeur}</dd>
              </div>
            ))}
          </dl>

          {annonce.description && (
            <div className="mt-6">
              <dt className="text-xs uppercase tracking-wide text-muted">
                {t("description")}
              </dt>
              <p className="mt-1 whitespace-pre-line text-foreground">
                {annonce.description}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <h2 className="font-semibold text-brand-dark">{t("contact")}</h2>
            <p className="mt-2 text-sm text-muted">{t("contactNom")}</p>
            <p className="font-medium text-foreground">{annonce.contact_nom}</p>
            <div className="mt-3 flex flex-col gap-2">
              {annonce.contact_courriel && (
                <a
                  href={`mailto:${annonce.contact_courriel}`}
                  className="inline-flex items-center gap-2 font-medium text-brand hover:text-brand-dark"
                >
                  <IconMail size={16} />
                  {annonce.contact_courriel}
                </a>
              )}
              {annonce.contact_telephone && (
                <a
                  href={`tel:${annonce.contact_telephone}`}
                  className="inline-flex items-center gap-2 font-medium text-brand hover:text-brand-dark"
                >
                  <IconPhone size={16} />
                  {annonce.contact_telephone}
                </a>
              )}
            </div>
          </div>
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
