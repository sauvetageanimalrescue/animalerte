import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconCheck, IconFileTypePdf } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

const PLANS = [
  { id: "gratuit", herite: null, populaire: false },
  { id: "locale", herite: "gratuit", populaire: false },
  { id: "regional", herite: "locale", populaire: true },
  { id: "provincial", herite: "regional", populaire: false },
] as const;

export default async function ForfaitsPage({
  params,
}: PageProps<"/[locale]/forfaits">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("forfaits");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center text-3xl font-extrabold text-brand-dark md:text-4xl">
        {t("titre")}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
        {t("sousTitre")}
      </p>

      <div className="mt-6 flex justify-center">
        <a
          href="/comparatif-forfaits.pdf"
          download
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-brand-dark transition hover:border-brand hover:text-brand"
        >
          <IconFileTypePdf size={18} className="shrink-0 text-accent" />
          {t("telechargerComparatif")}
        </a>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

              {p.herite && (
                <p className="mt-5 text-xs font-semibold text-muted">
                  {t("herite", { plan: t(`${p.herite}.nom`) })}
                </p>
              )}

              <ul
                className={`flex flex-1 flex-col gap-2.5 ${
                  p.herite ? "mt-2.5" : "mt-5"
                }`}
              >
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

              <Link
                href="/signaler"
                className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
                  p.populaire
                    ? "bg-accent text-white hover:brightness-95"
                    : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {gratuit ? t("commencerGratuit") : t("choisir")}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
