import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Annonce } from "./types";

// flAIr — étape 2 : jumelage perdu ↔ trouvé.
// On compare un animal aux signalements de l'autre côté et on ne retient que les
// pistes plausibles, classées par score. Le score combine les attributs (espèce,
// couleur, race, yeux), la proximité géographique et la cohérence des dates. Ce
// n'est PAS un oracle : c'est un filtre/classeur, l'humain confirme au bout.

export type Piste = {
  annonce: Annonce;
  score: number;
  niveau: "forte" | "moyenne";
  distanceKm: number | null;
  raisons: string[]; // codes traduits côté affichage (namespace pistesFlair.raisons)
};

// En deçà de ce score, la piste n'est pas assez crédible pour être montrée.
const SEUIL = 30;

// Distance à vol d'oiseau entre deux points (km), formule de haversine.
function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(s));
}

// Deux codes partagent-ils un morceau ? (ex. « noir_blanc » et « noir »).
function partageToken(a: string, b: string): boolean {
  const ta = new Set(a.split("_"));
  return b.split("_").some((x) => ta.has(x));
}

// Compare un « perdu » à un « trouvé » (l'appelant garantit ces rôles).
// Renvoie null si incompatible (espèce différente, ou trouvé AVANT la
// disparition = impossible).
export function scoreCorrespondance(
  perdu: Annonce,
  trouve: Annonce,
): Omit<Piste, "annonce"> | null {
  if (perdu.espece !== trouve.espece) return null;

  const dPerdu = Date.parse(perdu.date_evenement);
  const dTrouve = Date.parse(trouve.date_evenement);
  const jours =
    Number.isFinite(dPerdu) && Number.isFinite(dTrouve)
      ? Math.round((dTrouve - dPerdu) / 86_400_000)
      : null;
  // Trouvé plus de 2 jours avant la disparition : chronologiquement impossible.
  if (jours != null && jours < -2) return null;

  let score = 0;
  const raisons: string[] = [];

  // Couleur / motif du pelage (indice le plus fort).
  if (perdu.couleur && trouve.couleur) {
    if (perdu.couleur === trouve.couleur) {
      score += 35;
      raisons.push("meme_couleur");
    } else if (partageToken(perdu.couleur, trouve.couleur)) {
      score += 15;
      raisons.push("couleur_proche");
    }
  }

  // Race identique.
  if (perdu.race && trouve.race && perdu.race === trouve.race) {
    score += 25;
    raisons.push("meme_race");
  }

  // Couleur des yeux (seulement si connue des deux côtés).
  if (
    perdu.couleur_yeux &&
    trouve.couleur_yeux &&
    perdu.couleur_yeux === trouve.couleur_yeux
  ) {
    score += 12;
    raisons.push("meme_yeux");
  }

  // Proximité géographique.
  let dist: number | null = null;
  if (
    perdu.latitude != null &&
    perdu.longitude != null &&
    trouve.latitude != null &&
    trouve.longitude != null
  ) {
    dist =
      Math.round(
        distanceKm(
          perdu.latitude,
          perdu.longitude,
          trouve.latitude,
          trouve.longitude,
        ) * 10,
      ) / 10;
    if (dist <= 5) {
      score += 20;
      raisons.push("tres_proche");
    } else if (dist <= 25) {
      score += 12;
      raisons.push("proche");
    } else if (dist <= 75) {
      score += 6;
      raisons.push("secteur");
    }
  }

  // Cohérence des dates : trouvé peu après la disparition = plus plausible.
  if (jours != null && jours >= -2 && jours <= 14) {
    score += 8;
    raisons.push("peu_apres");
  } else if (jours != null && jours <= 45) {
    score += 4;
  }

  if (score < SEUIL) return null;
  const niveau: "forte" | "moyenne" = score >= 55 ? "forte" : "moyenne";
  return { score, niveau, distanceKm: dist, raisons };
}

// Pistes flAIr pour une annonce : on va chercher le côté opposé (même espèce,
// actif), on score chaque candidat, on garde les plausibles, classés.
export async function pistesFlair(
  annonce: Annonce,
  limite = 6,
): Promise<Piste[]> {
  try {
    const supabase = await createClient();
    const cibleType = annonce.type === "perdu" ? "trouve" : "perdu";
    const { data, error } = await supabase
      .from("annonces")
      .select("*")
      .eq("statut", "actif")
      .eq("type", cibleType)
      .eq("espece", annonce.espece)
      .limit(300);
    if (error) throw error;

    const pistes: Piste[] = [];
    for (const c of (data ?? []) as Annonce[]) {
      const perdu = annonce.type === "perdu" ? annonce : c;
      const trouve = annonce.type === "perdu" ? c : annonce;
      const r = scoreCorrespondance(perdu, trouve);
      if (r) pistes.push({ annonce: c, ...r });
    }
    pistes.sort((a, b) => b.score - a.score);
    return pistes.slice(0, limite);
  } catch {
    return [];
  }
}
