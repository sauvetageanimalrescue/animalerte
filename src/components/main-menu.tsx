"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconMenu2,
  IconX,
  IconPlus,
  IconChevronDown,
} from "@tabler/icons-react";
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
  const ref = useRef<HTMLDivElement>(null);

  // Sections repliables sur mobile : la Navigation est ouverte par défaut,
  // les autres se déplient d'une touche. Sur ordinateur (sm+), tout est
  // toujours affiché en 3 colonnes, peu importe cet état.
  const [ouvertes, setOuvertes] = useState<Record<number, boolean>>({ 0: true });
  const basculer = (i: number) =>
    setOuvertes((s) => ({ ...s, [i]: !s[i] }));

  // Ferme le menu au clic à l'extérieur (le voile ne suffit pas : le
  // backdrop-blur de l'en-tête piège le positionnement fixe).
  useEffect(() => {
    if (!ouvert) return;
    const surClic = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener("pointerdown", surClic);
    return () => document.removeEventListener("pointerdown", surClic);
  }, [ouvert]);

  const sections = [
    {
      titre: p("navTitre"),
      liens: [
        { href: "/", label: nav("accueil") },
        { href: "/recherche", label: nav("recherche") },
        { href: "/signaler", label: nav("signaler") },
        { href: "/forfaits", label: nav("forfaits") },
        ...(connecte
          ? [
              { href: "/mes-annonces", label: nav("mesAnnonces") },
              { href: "/mes-messages", label: nav("mesMessages") },
              { href: "/profil", label: nav("profil") },
            ]
          : []),
      ],
    },
    {
      titre: nav("fonctionnalites"),
      liens: [
        { href: "/fonctions/la-fiche", label: nav("fiche") },
        { href: "/fonctions/photos", label: nav("photos") },
        { href: "/fonctions/courriel-conseils", label: nav("courriel") },
        { href: "/fonctions/affiche-intelligente", label: nav("affiche") },
        { href: "/fonctions/images-reseaux", label: nav("reseaux") },
        { href: "/fonctions/ligne-sans-frais", label: nav("ligne") },
        { href: "/fonctions/messagerie-anonyme", label: nav("messagerie") },
        { href: "/fonctions/alerte-sentinelle", label: nav("alerteSentinelle") },
        { href: "/fonctions/publicite-meta", label: nav("publiciteMeta") },
        { href: "/fonctions/flair", label: nav("flair") },
        {
          href: "/fonctions/annonce-prioritaire",
          label: nav("prioritaire"),
        },
        {
          href: "/fonctions/diffusion-partenaire",
          label: nav("partenaire"),
        },
      ],
    },
    {
      titre: p("legalTitre"),
      liens: [
        { href: "/conditions", label: p("conditions") },
        { href: "/confidentialite", label: p("confidentialite") },
        { href: "/faq", label: p("faq") },
        { href: "/contact", label: p("contact") },
      ],
    },
  ] as const;

  const lienCls =
    "block rounded-md px-2 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-brand-soft hover:text-brand-dark";

  return (
    <div className="relative" ref={ref}>
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
        <div className="absolute left-0 z-40 mt-3 max-h-[calc(100dvh-6rem)] w-[min(92vw,620px)] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {sections.map((sec, i) => {
                const estOuverte = !!ouvertes[i];
                return (
                <div
                  key={sec.titre}
                  className="border-b border-border pb-3 last:border-0 last:pb-0 sm:border-0 sm:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => basculer(i)}
                    aria-expanded={estOuverte}
                    className="flex w-full items-center justify-between sm:pointer-events-none"
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-muted">
                      {sec.titre}
                    </span>
                    <IconChevronDown
                      size={16}
                      className={`text-muted transition sm:hidden ${
                        estOuverte ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <ul
                    className={`mt-2 flex-col gap-0.5 ${
                      estOuverte ? "flex" : "hidden"
                    } sm:flex`}
                  >
                    {sec.liens.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} onClick={fermer} className={lienCls}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Link
                href="/signaler"
                onClick={fermer}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              >
                <IconPlus size={16} />
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
      )}
    </div>
  );
}
