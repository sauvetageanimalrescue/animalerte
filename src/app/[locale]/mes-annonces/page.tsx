import Image from "next/image";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { IconPaw, IconPlus } from "@tabler/icons-react";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/authz";
import { obtenirMesAnnonces } from "@/lib/annonces";
import { formaterDate } from "@/lib/format";
import { TypeBadge, StatutBadge } from "@/components/badges";
import { ActionsAnnonce } from "@/components/actions-annonce";

export default async function MesAnnoncesPage({
  params,
}: PageProps<"/[locale]/mes-annonces">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect({ href: "/connexion", locale });

  const [t, tE, tT, tS, tP, tCommun] = await Promise.all([
    getTranslations("mesAnnonces"),
    getTranslations("especes"),
    getTranslations("types"),
    getTranslations("statuts"),
    getTranslations("provinces"),
    getTranslations("commun"),
  ]);

  const annonces = await obtenirMesAnnonces(user!.id);
  const loc = await getLocale();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">{t("titre")}</h1>
        <Link
          href="/signaler"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <IconPlus size={16} />
          {t("creerCta")}
        </Link>
      </div>

      {annonces.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted">
          {t("aucune")}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {annonces.map((a) => {
            const titre = a.nom_animal || tE(a.espece);
            return (
              <li
                key={a.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/annonces/${a.id}`}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-soft"
                >
                  {a.photo_url ? (
                    <Image
                      src={a.photo_url}
                      alt={titre}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-brand/40">
                      <IconPaw size={28} />
                    </span>
                  )}
                </Link>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <TypeBadge type={a.type} label={tT(a.type)} />
                    <StatutBadge statut={a.statut} label={tS(a.statut)} />
                  </div>
                  <Link
                    href={`/annonces/${a.id}`}
                    className="font-semibold text-foreground hover:text-brand-dark"
                  >
                    {titre}
                  </Link>
                  <p className="text-sm text-muted">
                    {a.ville}, {tP(a.province)} ·{" "}
                    {formaterDate(a.date_evenement, loc)}
                  </p>
                </div>

                <ActionsAnnonce
                  id={a.id}
                  statut={a.statut}
                  labels={{
                    marquerResolu: t("marquerResolu"),
                    marquerActif: t("marquerActif"),
                    supprimer: tCommun("supprimer"),
                    confirmerSuppression: t("confirmerSuppression"),
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
