import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { payerForfait } from "@/lib/actions/paiement";
import { estForfait, optionsPaiement, formatPrixCents } from "@/lib/forfaits";

export default async function ChoixForfaitPage({
  params,
  searchParams,
}: PageProps<"/[locale]/annonces/[id]/forfait">) {
  const { locale, id } = await params;
  const { annule, erreur } = await searchParams;
  setRequestLocale(locale);

  // Réservé au propriétaire de l'annonce.
  const annonce = await obtenirAnnonce(id);
  if (!annonce) redirect(`/${locale}`);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== annonce.user_id) {
    redirect(`/${locale}/annonces/${id}`);
  }

  const t = await getTranslations("forfaits");

  const actuel = estForfait(annonce.forfait) ? annonce.forfait : "gratuit";
  const aPayant = annonce.paye === true && actuel !== "gratuit";
  const { options, fenetreMajExpiree } = optionsPaiement(annonce);
  const estPopulaire = (fid: string) => fid === "regional";

  // Cartes à présenter. Premier paiement : Gratuit + paliers payants (plein
  // prix). Déjà payant : uniquement les mises à niveau (différence).
  type Carte = {
    id: string;
    gratuit: boolean;
    estMaj: boolean;
    prixCents: number;
    populaire: boolean;
  };
  const cartes: Carte[] = aPayant
    ? options.map((o) => ({
        id: o.forfait,
        gratuit: false,
        estMaj: true,
        prixCents: o.prixCents,
        populaire: estPopulaire(o.forfait),
      }))
    : [
        {
          id: "gratuit",
          gratuit: true,
          estMaj: false,
          prixCents: 0,
          populaire: false,
        },
        ...options.map((o) => ({
          id: o.forfait,
          gratuit: false,
          estMaj: false,
          prixCents: o.prixCents,
          populaire: estPopulaire(o.forfait),
        })),
      ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center text-3xl font-extrabold text-brand-dark md:text-4xl">
        {t("choixTitre")}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
        {t("choixSousTitre")}
      </p>

      {annule && (
        <p className="mx-auto mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800">
          {t("paiementAnnule")}
        </p>
      )}
      {erreur === "maj" && (
        <p className="mx-auto mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800">
          {t("erreurMaj")}
        </p>
      )}

      {aPayant && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-brand/30 bg-brand-soft px-4 py-3 text-center text-sm text-brand-dark">
          {t("forfaitActuel", { nom: t(`${actuel}.nom`) })}
          {cartes.length > 0 ? ` ${t("majSousTitre")}` : ""}
        </p>
      )}

      {aPayant && cartes.length === 0 && fenetreMajExpiree && (
        <p className="mx-auto mt-4 max-w-2xl rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm text-muted">
          {t("majExpiree")}
        </p>
      )}

      {cartes.length > 0 && (
        <div className="mt-10 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cartes.map((p) => {
            const points = t.raw(`${p.id}.points`) as string[];
            const prixAffiche = p.gratuit
              ? t("gratuit.prix")
              : p.estMaj
                ? `+${formatPrixCents(p.prixCents, locale)}`
                : t(`${p.id}.prix`);
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border bg-surface p-6 ${
                  p.populaire ? "border-accent shadow-md" : "border-border"
                }`}
              >
                {p.populaire && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {t("populaire")}
                  </span>
                )}
                <h2 className="text-lg font-bold text-brand-dark">
                  {t(`${p.id}.nom`)}
                </h2>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-foreground">
                    {prixAffiche}
                  </span>
                  {!p.gratuit && (
                    <span className="whitespace-nowrap text-xs text-muted">
                      / {p.estMaj ? t("parMaj") : t("parAnnonce")}
                    </span>
                  )}
                </div>

                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {points.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <IconCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-brand"
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <form action={payerForfait} className="mt-6 flex">
                  <input type="hidden" name="annonce" value={id} />
                  <input type="hidden" name="forfait" value={p.id} />
                  <button
                    type="submit"
                    className={`w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
                      p.populaire
                        ? "bg-accent text-white hover:brightness-95"
                        : p.gratuit
                          ? "border border-border bg-surface text-brand-dark hover:border-brand"
                          : "bg-brand text-white hover:bg-brand-dark"
                    }`}
                  >
                    {p.gratuit
                      ? t("continuerGratuit")
                      : t("payer", { prix: prixAffiche })}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
