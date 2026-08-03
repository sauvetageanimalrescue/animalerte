import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconFileTypePdf } from "@tabler/icons-react";
import { ForfaitsCards } from "@/components/forfaits-cards";

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

      <div className="mt-12">
        <ForfaitsCards />
      </div>
    </div>
  );
}
