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
const SEUIL = 35;

// Races « génériques » (non identifiantes) : la quasi-totalité des chats sont
// « domestique poil court/long » et la quasi-totalité des chiens sans pedigree
// sont « croisés ». Un accord sur ces catégories ne prouve à peu près rien ;
// seules les races PRÉCISES constituent un vrai indice de correspondance.
const RACES_GENERIQUES = new Set([
  "domestique_court",
  "domestique_long",
  "croise",
  "autre",
]);

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

// Similarité cosinus entre deux empreintes visuelles (0 à 1).
function cosinus(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
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

  // Empreinte visuelle calculée d'abord : elle sert aussi de garde-fou pour la
  // couleur (flAIr a pu mal nommer une couleur sur une photo difficile).
  let sim: number | null = null;
  if (perdu.photo_embedding?.length && trouve.photo_embedding?.length) {
    sim = cosinus(perdu.photo_embedding, trouve.photo_embedding);
  }

  // Couleur / motif du pelage : l'indice d'identité le plus fiable.
  //  - accord exact : fort bonus ;
  //  - token commun (« noir_blanc » vs « noir ») : bonus modéré ;
  //  - désaccord franc (aucun token commun) : très mauvais signe. On ÉLIMINE la
  //    piste (ex. chat noir vs chat gris), sauf si l'empreinte visuelle est
  //    nettement ressemblante, auquel cas on garde mais on pénalise.
  if (perdu.couleur && trouve.couleur) {
    if (perdu.couleur === trouve.couleur) {
      score += 35;
      raisons.push("meme_couleur");
    } else if (partageToken(perdu.couleur, trouve.couleur)) {
      score += 15;
      raisons.push("couleur_proche");
    } else {
      if (sim == null || sim < 0.5) return null;
      score -= 12;
    }
  }

  // Race : seulement si c'est une race PRÉCISE. Les catégories génériques
  // (« domestique poil court », « croisé ») sont trop communes pour compter.
  if (perdu.race && trouve.race && perdu.race === trouve.race) {
    if (RACES_GENERIQUES.has(perdu.race)) {
      score += 5;
    } else {
      score += 25;
      raisons.push("meme_race");
    }
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

  // Ressemblance visuelle (empreintes, calculée plus haut). Seuils calibrés sur
  // la distribution réelle de voyage-multimodal-3 : deux animaux différents de
  // même espèce se situent autour de 0,34, deux espèces différentes autour de
  // 0,20. On ne récompense donc que nettement au-dessus de ce plancher. À
  // affiner encore avec de vraies paires « même animal, deux photos ».
  if (sim != null) {
    if (sim >= 0.58) {
      score += 28;
      raisons.push("ressemblance");
    } else if (sim >= 0.48) {
      score += 16;
      raisons.push("ressemblance");
    } else if (sim >= 0.4) {
      score += 6;
    }
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
