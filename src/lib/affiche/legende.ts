import "server-only";
import { getTranslations } from "next-intl/server";
import type { Annonce } from "@/lib/types";
import { formaterDate, nomDeRue } from "@/lib/format";
import { nomRace } from "@/lib/races";
import { COULEURS, YEUX, TEMPERAMENTS } from "@/lib/champs";
import { traduireBilingue } from "@/lib/traduction";

type Lang = "fr" | "en";
type T = (k: string) => string;

const LIGNE: Record<Lang, string> = {
  fr: "animALERTE est le seul service d'animaux perdus doté d'une ligne directe et confidentielle vers le propriétaire. Composez le numéro; quand le système le demande, entrez les 4 chiffres du dossier (le poste). L'appel est redirigé directement vers le propriétaire, sans jamais dévoiler ses coordonnées : l'anonymat est garanti, et le joindre reste tout simple.",
  en: "animALERTE is the only lost-pet service with a direct, confidential line to the owner. Dial the number; when prompted, enter the 4-digit file number (the extension). The call is forwarded straight to the owner without ever revealing their contact details: anonymity is guaranteed, and reaching them stays simple.",
};
const FLAIR: Record<Lang, string> = {
  fr: "🔎 flAIr renifle !\nUne exclusivité animALERTE. Notre intelligence artificielle reconnaît le visage d'un animal (pelage, marques, couleur des yeux), surveille le secteur sans relâche et vous prévient dès qu'un animal trouvé lui ressemble.",
  en: "🔎 flAIr sniffs!\nAn animALERTE exclusive. Our artificial intelligence recognizes a pet's face (coat, markings, eye colour), watches the area around the clock and alerts you the moment a found pet looks like yours.",
};

// Génère la légende bilingue (FR puis EN) prête à copier-coller.
export async function genererLegende(a: Annonce, origin: string): Promise<string> {
  const [eFr, eEn, cFr, cEn, yFr, yEn, tFr, tEn, sFr, sEn] = await Promise.all([
    getTranslations({ locale: "fr", namespace: "especes" }),
    getTranslations({ locale: "en", namespace: "especes" }),
    getTranslations({ locale: "fr", namespace: "couleurs" }),
    getTranslations({ locale: "en", namespace: "couleurs" }),
    getTranslations({ locale: "fr", namespace: "yeux" }),
    getTranslations({ locale: "en", namespace: "yeux" }),
    getTranslations({ locale: "fr", namespace: "temperaments" }),
    getTranslations({ locale: "en", namespace: "temperaments" }),
    getTranslations({ locale: "fr", namespace: "sexes" }),
    getTranslations({ locale: "en", namespace: "sexes" }),
  ]);

  const tr = (arr: readonly string[], t: T, v: string | null) =>
    v && arr.includes(v) ? t(v) : v;
  const dossier = a.numero_dossier ?? "";
  const poste = dossier ? dossier.replace(/^\d+-/, "") : "";
  const secteur = [a.ville, nomDeRue(a.adresse)].filter(Boolean).join(", ");
  const url = `${origin}/annonces/${a.id}`;

  // Champs libres (saisis par l'utilisateur) : on les traduit dans les deux
  // langues pour que le bloc anglais ne contienne pas de texte français. Ordre
  // conservé : accessoires d'abord, puis signes distinctifs.
  const libres: string[] = [];
  if (a.accessoires) libres.push(a.accessoires);
  if (a.signes_distinctifs) libres.push(a.signes_distinctifs);
  const trad = (await traduireBilingue(libres)) ?? [];
  let iTrad = 0;
  const accBil = a.accessoires ? trad[iTrad++] ?? null : null;
  const sigBil = a.signes_distinctifs ? trad[iTrad++] ?? null : null;

  const bloc = (L: Lang): string => {
    const tE = L === "fr" ? eFr : eEn;
    const tC = L === "fr" ? cFr : cEn;
    const tY = L === "fr" ? yFr : yEn;
    const tT = L === "fr" ? tFr : tEn;
    const tSex = L === "fr" ? sFr : sEn;
    const perdu = a.type === "perdu";
    const espece = tE(a.espece);
    const typeMot = perdu
      ? L === "fr"
        ? "perdu"
        : "lost"
      : L === "fr"
        ? "trouvé"
        : "found";

    const li: string[] = [];
    li.push(L === "fr" ? "🆘 AVIS DE RECHERCHE" : "🆘 MISSING PET ALERT");
    li.push(`${a.nom_animal || espece} · ${espece} ${typeMot}`);
    const dateLbl = perdu
      ? L === "fr"
        ? "Disparu le"
        : "Missing since"
      : L === "fr"
        ? "Trouvé le"
        : "Found on";
    const heure = a.heure_approx
      ? (L === "fr" ? ", vers " : ", ~") + a.heure_approx
      : "";
    li.push(`📅 ${dateLbl} ${formaterDate(a.date_evenement, L)}${heure}`);
    if (secteur) li.push(`🗺️ ${secteur}`);
    if (dossier) li.push(`#️⃣ ${L === "fr" ? "Dossier" : "File"} ${dossier}`);

    const puces: string[] = [];
    // Sexe (mâle / femelle) en tête du signalement, sauf si inconnu.
    const sexe = a.sexe && a.sexe !== "inconnu" ? tSex(a.sexe) : null;
    const race = nomRace(a.race, a.espece, L);
    const couleur = tr(COULEURS, tC, a.couleur);
    const desc = [sexe, race, couleur].filter(Boolean);
    if (desc.length) puces.push(desc.join(", "));
    if (a.couleur_yeux) {
      const y = tr(YEUX, tY, a.couleur_yeux);
      puces.push(L === "fr" ? `Yeux ${String(y).toLowerCase()}` : `${y} eyes`);
    }
    if (a.accessoires) {
      puces.push(accBil ? (L === "fr" ? accBil.fr : accBil.en) : a.accessoires);
    }
    if (a.signes_distinctifs) {
      puces.push(
        sigBil ? (L === "fr" ? sigBil.fr : sigBil.en) : a.signes_distinctifs,
      );
    }
    const flags: string[] = [];
    if (a.micropuce === true) flags.push(L === "fr" ? "micropucé" : "microchipped");
    if (a.sterilise === true) flags.push(L === "fr" ? "stérilisé" : "neutered");
    if (flags.length)
      puces.push(flags.join(", ").replace(/^./, (c) => c.toUpperCase()));
    if (a.temperament) {
      const val = tr(TEMPERAMENTS, tT, a.temperament);
      if (val) puces.push(val);
    }
    if (puces.length) {
      li.push("");
      li.push(`📋 ${L === "fr" ? "Signalement" : "Details"}`);
      for (const p of puces) li.push(`☑️ ${p}`);
    }

    li.push("");
    li.push(
      `☎️ ${L === "fr" ? "Vous l'avez vu ou recueilli ?" : "Have you seen or found this pet?"}`,
    );
    li.push(
      `${L === "fr" ? "Composez" : "Call"} : 1 833 999 2433${poste ? `, ${L === "fr" ? "poste" : "ext."} ${poste}` : ""}`,
    );
    li.push("");
    li.push(LIGNE[L]);
    li.push("");
    li.push(`🔗 ${L === "fr" ? "Fiche complète" : "Full listing"} :`);
    li.push(url);
    li.push("");
    li.push(FLAIR[L]);
    return li.join("\n");
  };

  return `${bloc("fr")}\n\n━━━━━━━━━━━━━━━\n\n${bloc("en")}`;
}
