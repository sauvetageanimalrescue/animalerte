import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ConditionsPage({
  params,
}: PageProps<"/[locale]/conditions">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("conditions");
  const sections = t.raw("sections") as { titre: string; texte: string }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-dark">{t("titre")}</h1>
      <p className="mt-2 text-muted">{t("sousTitre")}</p>
      <p className="mt-1 text-sm text-muted">{t("maj")}</p>

      <div className="mt-8 flex flex-col gap-6">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold text-foreground">{s.titre}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.texte}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
