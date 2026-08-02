// Listes de valeurs à choix (menus déroulants). Chaque valeur est un CODE
// stocké en base ; l'affichage se traduit via next-intl (namespaces couleurs,
// yeux, temperaments) ou via les fonctions de formatage ci-dessous (âge, poids).
// But : uniformité + traduction FR/EN garanties.

export const COULEURS = [
  "noir",
  "blanc",
  "gris",
  "gris_pale",
  "gris_fonce",
  "brun",
  "fauve",
  "roux",
  "rouge",
  "creme",
  "dore",
  "sable",
  "tigre",
  "ecaille",
  "calico",
  "bringe",
  "tuxedo",
  "noir_blanc",
  "brun_blanc",
  "gris_blanc",
  "roux_blanc",
  "multicolore",
  "autre",
] as const;

export const YEUX = [
  "bruns",
  "ambre",
  "verts",
  "vert_jaune",
  "bleus",
  "gris",
  "cuivres",
  "mauve",
  "vairons",
  "marbre",
  "autre",
] as const;

// État d'un animal trouvé.
export const ETATS = ["sain", "blesse", "decede"] as const;

export const TEMPERAMENTS = [
  "sociable",
  "affectueux",
  "craintif",
  "famille_mefiant",
  "calme",
  "joueur",
  "agressif_peur",
] as const;

// Âge : moins de 3 mois, 3/6/9 mois, puis 1 à 30 ans, ou inconnu.
export const AGES = [
  "lt3m",
  "3m",
  "6m",
  "9m",
  ...Array.from({ length: 30 }, (_, i) => `${i + 1}a`),
  "inconnu",
] as const;

// Poids en livres : 1, puis 2 à 100 par tranches de 2.
export const POIDS_LB = [1, ...Array.from({ length: 50 }, (_, i) => (i + 1) * 2)];

function ageStr(code: string, lang: "fr" | "en"): string {
  if (code === "inconnu") return lang === "fr" ? "Inconnu" : "Unknown";
  if (code === "lt3m")
    return lang === "fr" ? "Moins de 3 mois" : "Under 3 months";
  const n = parseInt(code, 10);
  if (Number.isFinite(n) && code.endsWith("m"))
    return lang === "fr" ? `${n} mois` : `${n} month${n > 1 ? "s" : ""}`;
  if (Number.isFinite(n) && code.endsWith("a"))
    return lang === "fr"
      ? n === 1
        ? "1 an"
        : `${n} ans`
      : `${n} year${n > 1 ? "s" : ""}`;
  return code; // valeur inconnue (anciennes données) : on montre tel quel
}

// mode : "fr" | "en" | "bi" (bilingue « fr / en » pour l'affiche).
export function formaterAge(
  code: string | null | undefined,
  mode: "fr" | "en" | "bi",
): string {
  if (!code) return "";
  const fr = ageStr(code, "fr");
  const en = ageStr(code, "en");
  return mode === "bi" ? `${fr} / ${en}` : mode === "en" ? en : fr;
}

// Affiche « N lb (K kg) » (identique dans les deux langues).
export function formaterPoids(v: string | null | undefined): string {
  if (!v) return "";
  const lb = Number(v);
  if (!Number.isFinite(lb)) return v; // anciennes données texte : tel quel
  const kg = Math.round(lb * 0.453592 * 10) / 10;
  return `${lb} lb (${kg} kg)`;
}
