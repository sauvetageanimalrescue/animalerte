import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { payerForfait } from "@/lib/actions/paiement";

const PLANS = [
  { id: "gratuit", populaire: false },
  { id: "locale", populaire: false },
  { id: "regional", populaire: true },
  { id: "provincial", populaire: false },
] as const;

export default async function ChoixForfaitPage({
  params,
  searchParams,
}: PageProps<"/[locale]/annonces/[id]/forfait">) {
  const { locale, id } = await params;
  const { annule } = await searchParams;
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

      <div className="mt-10 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const points = t.raw(`${p.id}.points`) as string[];
          const gratuit = p.id === "gratuit";
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
                  {t(`${p.id}.prix`)}
                </span>
                {!gratuit && (
                  <span className="whitespace-nowrap text-xs text-muted">
                    / {t("parAnnonce")}
                  </span>
                )}
              </div>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {points.map((pt, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <IconCheck size={18} className="mt-0.5 shrink-0 text-brand" />
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
                      : gratuit
                        ? "border border-border bg-surface text-brand-dark hover:border-brand"
                        : "bg-brand text-white hover:bg-brand-dark"
                  }`}
                >
                  {gratuit
                    ? t("continuerGratuit")
                    : t("payer", { prix: t(`${p.id}.prix`) })}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
