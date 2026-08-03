import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconMail, IconCheck } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

export default async function PageCourriel({
  params,
}: PageProps<"/[locale]/fonctions/courriel-conseils">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pageCourriel");
  const contient = t.raw("contient") as string[];

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

      {/* Les premières heures comptent */}
      <div className="mt-8 flex gap-4 rounded-2xl border border-brand/30 bg-brand-soft p-5">
        <IconMail size={28} className="mt-0.5 shrink-0 text-brand" />
        <div>
          <h2 className="font-bold text-brand-dark">{t("centralTitre")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {t("centralTexte")}
          </p>
        </div>
      </div>

      {/* C'est quoi + pourquoi */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">{t("quoiTitre")}</h2>
        <p className="mt-2 leading-relaxed text-muted">{t("quoiTexte")}</p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-bold text-foreground">
          {t("pourquoiTitre")}
        </h2>
        <p className="mt-2 leading-relaxed text-muted">{t("pourquoiTexte")}</p>
      </section>

      {/* Ce qu'il contient */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">
          {t("contientTitre")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {contient.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <IconCheck size={18} className="mt-0.5 shrink-0 text-brand" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Fondé sur les statistiques */}
      <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-bold text-brand-dark">{t("statsTitre")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {t("statsTexte")}
        </p>
      </section>

      {/* Dans quel forfait */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
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
