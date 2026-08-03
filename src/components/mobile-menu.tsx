"use client";

import { useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Menu hamburger mobile : se ferme au clic sur un lien ET au clic à l'extérieur.
export function MobileMenu({
  connecte,
  deconnexion,
}: {
  connecte: boolean;
  deconnexion: () => void;
}) {
  const t = useTranslations("nav");
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

  const liens = [
    { href: "/", label: t("accueil") },
    { href: "/recherche", label: t("recherche") },
    { href: "/forfaits", label: t("forfaits") },
  ] as const;

  const lienCls = "rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-label="Menu"
        aria-expanded={ouvert}
        className="flex items-center rounded-full border border-border p-2 text-brand-dark"
      >
        {ouvert ? <IconX size={20} /> : <IconMenu2 size={20} />}
      </button>

      {ouvert && (
        <>
          {/* Voile invisible : un clic à l'extérieur ferme le menu. */}
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={fermer}
          />
          <div className="absolute right-0 z-40 mt-2 flex w-56 flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg">
            {liens.map((l) => (
              <Link key={l.href} href={l.href} onClick={fermer} className={lienCls}>
                {l.label}
              </Link>
            ))}
            <Link
              href="/signaler"
              onClick={fermer}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
            >
              {t("signaler")}
            </Link>
            {connecte ? (
              <>
                <Link href="/mes-annonces" onClick={fermer} className={lienCls}>
                  {t("mesAnnonces")}
                </Link>
                <form action={deconnexion}>
                  <button
                    type="submit"
                    onClick={fermer}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-brand-soft"
                  >
                    {t("deconnexion")}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/connexion" onClick={fermer} className={lienCls}>
                {t("connexion")}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
