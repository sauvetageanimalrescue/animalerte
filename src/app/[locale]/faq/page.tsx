import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function FaqPage({
  params,
}: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const items = t.raw("items") as { q: string; r: string }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-center text-3xl font-extrabold text-brand-dark md:text-4xl">
        {t("titre")}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
        {t("sousTitre")}
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-border bg-surface p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-brand-dark [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="shrink-0 text-xl leading-none text-brand transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {item.r}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
