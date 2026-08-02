import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Annonce } from "./types";
import { forfaitAuMoins } from "./forfaits";

// Un forfait Régionale+ donne la priorité (tête de liste + carrousel) pendant
// 7 jours à partir du paiement. Ensuite l'annonce reste active mais redevient
// chronologique, laissant la place aux nouveaux payeurs.
const DUREE_PRIORITE_MS = 7 * 24 * 60 * 60 * 1000;

function estPrioritaire(a: Annonce): boolean {
  return (
    forfaitAuMoins(a.forfait, "regional") &&
    Date.now() - new Date(a.paye_at ?? a.created_at).getTime() <
      DUREE_PRIORITE_MS
  );
}

// Annonces prioritaires placées en tête. Tri stable : l'ordre par date, déjà
// appliqué par la requête, est conservé dans chaque groupe.
function trierParPriorite(liste: Annonce[]): Annonce[] {
  return [...liste].sort(
    (a, b) => (estPrioritaire(b) ? 1 : 0) - (estPrioritaire(a) ? 1 : 0),
  );
}

export type FiltresRecherche = {
  motCle?: string;
  type?: string;
  espece?: string;
  province?: string;
  ville?: string;
  statut?: string;
};

const CHAMPS = "*";

// Annonces les plus récentes pour la page d'accueil.
export async function obtenirAnnoncesRecentes(limite = 6): Promise<Annonce[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("annonces")
      .select(CHAMPS)
      .eq("statut", "actif")
      .order("created_at", { ascending: false })
      // On récupère un bassin plus large pour que les annonces prioritaires
      // (plus anciennes) puissent remonter au-dessus des récentes gratuites.
      .limit(limite * 4);
    if (error) throw error;
    return trierParPriorite((data ?? []) as Annonce[]).slice(0, limite);
  } catch {
    // Sans backend configuré, on renvoie une liste vide plutôt que planter.
    return [];
  }
}

// Nombre plancher d'annonces au carrousel : tant qu'on est sous ce seuil, on
// garde des annonces prioritaires plus anciennes (> 7 j) pour ne pas le vider.
const PLANCHER_CARROUSEL = 6;

// Annonces prioritaires (forfait Régionale+) pour le carrousel de l'accueil.
// Règle : les annonces payées depuis moins de 7 jours passent en priorité, sans
// limite de nombre. On ne retire les plus anciennes que lorsqu'au moins
// PLANCHER_CARROUSEL annonces récentes se disputent la place ; sinon on complète
// avec les plus anciennes pour éviter un carrousel vide.
export async function obtenirAnnoncesPrioritaires(): Promise<Annonce[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("annonces")
      .select(CHAMPS)
      .eq("statut", "actif")
      .in("forfait", ["regional", "provincial"])
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const liste = (data ?? []) as Annonce[];
    const ref = (a: Annonce) => new Date(a.paye_at ?? a.created_at).getTime();
    liste.sort((a, b) => ref(b) - ref(a)); // du plus récent au plus ancien
    const maintenant = Date.now();
    const recentes = liste.filter((a) => maintenant - ref(a) < DUREE_PRIORITE_MS);
    const anciennes = liste.filter(
      (a) => maintenant - ref(a) >= DUREE_PRIORITE_MS,
    );

    return recentes.length >= PLANCHER_CARROUSEL
      ? recentes
      : [...recentes, ...anciennes].slice(0, PLANCHER_CARROUSEL);
  } catch {
    return [];
  }
}

// Recherche filtrée pour la page /recherche.
export async function rechercherAnnonces(
  filtres: FiltresRecherche,
): Promise<Annonce[]> {
  try {
    const supabase = await createClient();
    let requete = supabase
      .from("annonces")
      .select(CHAMPS)
      .order("created_at", { ascending: false })
      .limit(200);

    if (filtres.type) requete = requete.eq("type", filtres.type);
    if (filtres.espece) requete = requete.eq("espece", filtres.espece);
    if (filtres.province) requete = requete.eq("province", filtres.province);
    if (filtres.statut) requete = requete.eq("statut", filtres.statut);
    if (filtres.ville) requete = requete.ilike("ville", `%${filtres.ville}%`);
    if (filtres.motCle) {
      const m = filtres.motCle.replace(/[%,]/g, " ");
      requete = requete.or(
        [
          `nom_animal.ilike.%${m}%`,
          `race.ilike.%${m}%`,
          `couleur.ilike.%${m}%`,
          `description.ilike.%${m}%`,
        ].join(","),
      );
    }

    const { data, error } = await requete;
    if (error) throw error;
    return trierParPriorite((data ?? []) as Annonce[]);
  } catch {
    return [];
  }
}

// Détail d'une annonce (null si absente).
export async function obtenirAnnonce(id: string): Promise<Annonce | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("annonces")
      .select(CHAMPS)
      .eq("id", id)
      .single();
    if (error) throw error;
    return (data ?? null) as Annonce | null;
  } catch {
    return null;
  }
}

// Annonces appartenant à un utilisateur donné.
export async function obtenirMesAnnonces(userId: string): Promise<Annonce[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("annonces")
      .select(CHAMPS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Annonce[];
  } catch {
    return [];
  }
}
