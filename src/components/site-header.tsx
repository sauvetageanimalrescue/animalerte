import { getTranslations } from "next-intl/server";
import { IconMenu2, IconPlus } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/authz";
import { seDeconnecter } from "@/app/actions";
import { LogoMarkImg, Wordmark } from "./logo";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  const liens = [
    { href: "/" as const, label: t("accueil") },
    { href: "/recherche" as const, label: t("recherche") },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMarkImg className="h-10 w-auto" priority />
          <Wordmark className="text-xl font-extrabold tracking-tight" />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-brand-soft hover:text-brand-dark"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Link
            href="/signaler"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            <IconPlus size={16} />
            {t("signaler")}
          </Link>
          {user ? (
            <>
              <Link
                href="/mes-annonces"
                className="rounded-full px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand-soft"
              >
                {t("mesAnnonces")}
              </Link>
              <form action={seDeconnecter}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
                >
                  {t("deconnexion")}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/connexion"
              className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-soft"
            >
              {t("connexion")}
            </Link>
          )}
        </div>

        {/* Menu mobile : disclosure natif, sans JavaScript. */}
        <details className="relative ml-auto md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-border p-2 text-brand-dark">
            <IconMenu2 size={20} />
          </summary>
          <div className="absolute right-0 mt-2 flex w-56 flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg">
            {liens.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/signaler"
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
            >
              {t("signaler")}
            </Link>
            {user ? (
              <>
                <Link
                  href="/mes-annonces"
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft"
                >
                  {t("mesAnnonces")}
                </Link>
                <form action={seDeconnecter}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-brand-soft"
                  >
                    {t("deconnexion")}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/connexion"
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft"
              >
                {t("connexion")}
              </Link>
            )}
            <div className="border-t border-border pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
