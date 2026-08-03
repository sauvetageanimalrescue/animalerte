import { getTranslations } from "next-intl/server";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

const PLANS = [
  { id: "gratuit", populaire: false },
  { id: "locale", populaire: false },
  { id: "regional", populaire: true },
  { id: "provincial", populaire: false },
] as const;

// Rend certains points cliquables vers leur page « fonction ». On n'ajoute un
// lien que lorsque la page existe (sinon 404). À enrichir au fil des pages.
function lienFonction(
  point: string,
):
  | "/fonctions/la-fiche"
  | "/fonctions/photos"
  | "/fonctions/courriel-conseils"
  | "/fonctions/affiche-intelligente"
  | "/fonctions/images-reseaux"
  | "/fonctions/ligne-sans-frais"
  | "/fonctions/messagerie-anonyme"
  | "/fonctions/alerte-sentinelle"
  | "/fonctions/flair"
  | "/fonctions/annonce-prioritaire"
  | null {
  if (/alerte sentinelle|sentinel alert/i.test(point)) {
    return "/fonctions/alerte-sentinelle";
  }
  if (/flair/i.test(point)) {
    return "/fonctions/flair";
  }
  if (/annonce prioritaire|priority listing/i.test(point)) {
    return "/fonctions/annonce-prioritaire";
  }
  if (/fiche sur animalerte|listing on animalerte/i.test(point)) {
    return "/fonctions/la-fiche";
  }
  if (/photo/i.test(point)) {
    return "/fonctions/photos";
  }
  if (/conseils|advice email/i.test(point)) {
    return "/fonctions/courriel-conseils";
  }
  if (/affiche intelligente|smart poster/i.test(point)) {
    return "/fonctions/affiche-intelligente";
  }
  if (/réseaux sociaux|social media/i.test(point)) {
    return "/fonctions/images-reseaux";
  }
  if (/1 833 999 AIDE/i.test(point)) {
    return "/fonctions/ligne-sans-frais";
  }
  if (/messagerie anonyme|anonymous messaging/i.test(point)) {
    return "/fonctions/messagerie-anonyme";
  }
  return null;
}

// Grille des 4 forfaits, réutilisée sur la page /forfaits et la page d'accueil.
export async function ForfaitsCards() {
  const t = await getTranslations("forfaits");

  return (
    <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((p) => {
        const points = t.raw(`${p.id}.points`) as string[];
        const gratuit = p.id === "gratuit";
        return (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-2xl border bg-surface p-6 ${
              p.populaire ? "border-accent shadow-md" : "border-border"
            }`}
          >
            {p.populaire && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {t("populaire")}
              </span>
            )}
            <h2 className="text-lg font-bold text-brand-dark">
              {t(`${p.id}.nom`)}
            </h2>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-foreground">
                {t(`${p.id}.prix`)}
              </span>
              {!gratuit && (
                <span className="whitespace-nowrap text-xs text-muted">
                  / {t("parAnnonce")}
                </span>
              )}
            </div>

            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {points.map((pt, i) => {
                const lien = lienFonction(pt);
                return (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <IconCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-brand"
                    />
                    {lien ? (
                      <Link
                        href={lien}
                        className="underline decoration-dotted underline-offset-2 transition hover:text-brand"
                      >
                        {pt}
                      </Link>
                    ) : (
                      <span>{pt}</span>
                    )}
                  </li>
                );
              })}
            </ul>

            <Link
              href="/signaler"
              className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
                p.populaire
                  ? "bg-accent text-white hover:brightness-95"
                  : "bg-brand text-white hover:bg-brand-dark"
              }`}
            >
              {gratuit ? t("commencerGratuit") : t("choisir")}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
