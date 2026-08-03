"use client";

import { useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Menu principal (hamburger) pour ordinateur ET mobile : panneau flottant
// divisé en sections, comme le pied de page. Ferme au clic extérieur / lien.
export function MainMenu({
  connecte,
  deconnexion,
}: {
  connecte: boolean;
  deconnexion: () => void;
}) {
  const nav = useTranslations("nav");
  const p = useTranslations("pied");
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

  const sections = [
    {
      titre: p("navTitre"),
      liens: [
        { href: "/", label: nav("accueil") },
        { href: "/recherche", label: nav("recherche") },
        { href: "/signaler", label: nav("signaler") },
        ...(connecte
          ? [{ href: "/mes-annonces", label: nav("mesAnnonces") }]
          : []),
      ],
    },
    {
      titre: "animALERTE",
      liens: [
        { href: "/forfaits", label: nav("forfaits") },
        { href: "/faq", label: p("faq") },
      ],
    },
    {
      titre: p("legalTitre"),
      liens: [
        { href: "/conditions", label: p("conditions") },
        { href: "/contact", label: p("contact") },
      ],
    },
  ] as const;

  const lienCls =
    "block rounded-md px-2 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-brand-soft hover:text-brand-dark";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-label="Menu"
        aria-expanded={ouvert}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-soft"
      >
        {ouvert ? <IconX size={18} /> : <IconMenu2 size={18} />}
        <span>Menu</span>
      </button>

      {ouvert && (
        <>
          {/* Voile : clic à l'extérieur ferme le menu. */}
          <div className="fixed inset-0 z-30" aria-hidden onClick={fermer} />
          <div className="absolute left-0 z-40 mt-3 w-[min(92vw,620px)] rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="grid gap-6 sm:grid-cols-3">
              {sections.map((sec) => (
                <div key={sec.titre}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                    {sec.titre}
                  </h3>
                  <ul className="flex flex-col gap-0.5">
                    {sec.liens.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={fermer} className={lienCls}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Link
                href="/signaler"
                onClick={fermer}
                className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              >
                {nav("signaler")}
              </Link>
              {connecte ? (
                <form action={deconnexion}>
                  <button
                    type="submit"
                    className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                  >
                    {nav("deconnexion")}
                  </button>
                </form>
              ) : (
                <Link
                  href="/connexion"
                  onClick={fermer}
                  className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-soft"
                >
                  {nav("connexion")}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
