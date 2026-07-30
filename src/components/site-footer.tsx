import { getTranslations } from "next-intl/server";
import { Logo } from "./logo";

export async function SiteFooter() {
  const t = await getTranslations("pied");
  const annee = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Logo className="h-14 w-auto" />
        <p className="mt-3 max-w-md text-sm text-muted">{t("description")}</p>
        <p className="mt-6 text-xs text-muted">
          © {annee} animALERTE. {t("droits")}
        </p>
      </div>
    </footer>
  );
}
