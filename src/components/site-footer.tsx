import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo, FlairWord } from "./logo";

export async function SiteFooter() {
  const [t, nav] = await Promise.all([
    getTranslations("pied"),
    getTranslations("nav"),
  ]);
  const annee = new Date().getFullYear();

  const colonnes = [
    {
      titre: t("navTitre"),
      liens: [
        { href: "/", label: nav("accueil") },
        { href: "/recherche", label: nav("recherche") },
        { href: "/signaler", label: nav("signaler") },
        { href: "/mes-annonces", label: nav("mesAnnonces") },
      ],
    },
    {
      titre: "animALERTE",
      liens: [
        { href: "#", label: t("apropos") },
        { href: "#", label: t("forfaits") },
        { href: "#", label: "flAIr" },
        { href: "#", label: t("sentinelles") },
      ],
    },
    {
      titre: t("legalTitre"),
      liens: [
        { href: "#", label: t("conditions") },
        { href: "#", label: t("confidentialite") },
        { href: "#", label: t("contact") },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-auto" />
            <span className="h-9 w-px bg-border" aria-hidden />
            <FlairWord className="text-2xl font-extrabold tracking-tight" />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {colonnes.map((col) => (
              <div key={col.titre}>
                <h3 className="mb-3 text-sm font-semibold text-brand-dark">
                  {col.titre}
                </h3>
                <ul className="flex flex-col gap-2">
                  {col.liens.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="text-sm text-muted transition hover:text-brand-dark"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="text-sm text-muted transition hover:text-brand-dark"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted">
          © {annee} animALERTE. {t("droits")}
        </div>
      </div>
    </footer>
  );
}
