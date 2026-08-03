import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/authz";
import { seDeconnecter } from "@/app/actions";
import { Logo } from "./logo";

export async function SiteFooter() {
  const [t, nav, user] = await Promise.all([
    getTranslations("pied"),
    getTranslations("nav"),
    getCurrentUser(),
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
        { href: "/forfaits", label: t("forfaits") },
        { href: "#", label: "flAIr" },
        { href: "#", label: t("sentinelles") },
        { href: "/faq", label: t("faq") },
      ],
    },
    {
      titre: t("legalTitre"),
      liens: [
        { href: "/conditions", label: t("conditions") },
        { href: "#", label: t("confidentialite") },
        { href: "/contact", label: t("contact") },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Logo className="h-[72px] w-auto" />
              <span className="h-[54px] w-px bg-border" aria-hidden />
              <Image
                src="/flair-couleur.png"
                alt="flAIr"
                width={120}
                height={60}
                className="h-[42px] w-auto"
              />
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="text-muted transition hover:text-brand-dark"
              >
                <IconBrandFacebook size={22} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="text-muted transition hover:text-brand-dark"
              >
                <IconBrandInstagram size={22} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="TikTok"
                className="text-muted transition hover:text-brand-dark"
              >
                <IconBrandTiktok size={22} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {colonnes.map((col, ci) => (
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
                  {/* Déconnexion dans la colonne Navigation, si connecté. */}
                  {ci === 0 && user && (
                    <li>
                      <form action={seDeconnecter}>
                        <button
                          type="submit"
                          className="text-sm text-muted transition hover:text-brand-dark"
                        >
                          {nav("deconnexion")}
                        </button>
                      </form>
                    </li>
                  )}
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
