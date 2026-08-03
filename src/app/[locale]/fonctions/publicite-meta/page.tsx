import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconBrandMeta,
  IconRocket,
  IconMapPin,
  IconTrendingUp,
  IconCheck,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

export default async function PagePubliciteMeta({
  params,
}: PageProps<"/[locale]/fonctions/publicite-meta">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pagePubMeta");
  const apports = t.raw("apports") as string[];

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

      {/* La puissance de Meta */}
      <div className="mt-8 flex gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-5">
        <IconBrandMeta size={28} className="mt-0.5 shrink-0 text-brand" />
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

      {/* Une publication boostée, c'est quoi */}
      <div className="mt-10 flex gap-4 rounded-2xl border border-border bg-surface p-5">
        <IconRocket size={26} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <h2 className="font-bold text-brand-dark">{t("boostTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("boostTexte")}
          </p>
        </div>
      </div>

      {/* Un ciblage selon votre forfait */}
      <div className="mt-4 flex gap-4 rounded-2xl border border-border bg-surface p-5">
        <IconMapPin size={26} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <h2 className="font-bold text-brand-dark">{t("rayonTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("rayonTexte")}
          </p>
        </div>
      </div>

      {/* Plus vous montez, plus vous rejoignez de gens */}
      <div className="mt-4 flex gap-4 rounded-2xl border border-border bg-surface p-5">
        <IconTrendingUp size={26} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <h2 className="font-bold text-brand-dark">{t("porteeTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("porteeTexte")}
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
