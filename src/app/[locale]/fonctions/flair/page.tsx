import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconSparkles,
  IconScan,
  IconFilterCheck,
  IconCheck,
  IconFileDownload,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

export default async function PageFlair({
  params,
}: PageProps<"/[locale]/fonctions/flair">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pageFlair");
  const apports = t.raw("apports") as string[];
  const criteres = t.raw("criteres") as { titre: string; texte: string }[];

  const etapes = [
    { titre: t("etape1Titre"), texte: t("etape1Texte") },
    { titre: t("etape2Titre"), texte: t("etape2Texte") },
    { titre: t("etape3Titre"), texte: t("etape3Texte") },
    { titre: t("etape4Titre"), texte: t("etape4Texte") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* En-tête */}
      <p className="text-xs font-bold uppercase tracking-widest text-accent">
        {t("surtitre")}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-dark md:text-4xl">
        {t("titre")}
      </h1>
      <p className="mt-3 text-lg text-muted">{t("accroche")}</p>

      {/* L'intelligence artificielle d'animALERTE */}
      <div className="mt-8 flex gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-5">
        <IconSparkles size={28} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <h2 className="font-bold text-brand-dark">{t("centralTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {t("centralTexte")}
          </p>
        </div>
      </div>

      {/* C'est quoi */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">{t("quoiTitre")}</h2>
        <p className="mt-2 leading-relaxed text-muted">{t("quoiTexte")}</p>
      </section>

      {/* Comment ça fonctionne */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">
          {t("commentTitre")}
        </h2>
        <ol className="mt-4 flex flex-col gap-4">
          {etapes.map((e, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-brand-dark">{e.titre}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {e.texte}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Ce que flAIr analyse */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <IconScan size={22} className="shrink-0 text-brand" />
          <h2 className="text-xl font-bold text-foreground">
            {t("criteresTitre")}
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {criteres.map((c, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <h3 className="font-bold text-brand-dark">{c.titre}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {c.texte}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Des pistes crédibles */}
      <div className="mt-10 flex gap-4 rounded-2xl border border-border bg-surface p-5">
        <IconFilterCheck size={26} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <h2 className="font-bold text-brand-dark">{t("plausibleTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("plausibleTexte")}
          </p>
        </div>
      </div>

      {/* Ce que ça vous apporte */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">
          {t("apportsTitre")}
        </h2>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {apports.map((a, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <IconCheck size={18} className="mt-0.5 shrink-0 text-brand" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Dans quel forfait */}
      <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-bold text-brand-dark">{t("forfaitTitre")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {t("forfaitTexte")}
        </p>
      </section>

      {/* Guide du barème (PDF public, selon la langue) */}
      <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-brand-dark">{t("baremeTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {t("baremeTexte")}
          </p>
        </div>
        <a
          href={`/flair-bareme-${locale === "en" ? "en" : "fr"}.pdf`}
          target="_blank"
          rel="noopener"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark sm:self-auto"
        >
          <IconFileDownload size={18} />
          {t("baremeCta")}
        </a>
      </section>

      {/* Appel à l'action */}
      <section className="mt-12 rounded-2xl bg-brand-dark p-8 text-center">
        <h2 className="text-xl font-bold text-white">{t("ctaTitre")}</h2>
        <p className="mt-1 text-white/80">{t("ctaTexte")}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/inscription"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {t("ctaProfil")}
          </Link>
          <Link
            href="/forfaits"
            className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t("ctaForfaits")}
          </Link>
        </div>
      </section>
    </div>
  );
}
