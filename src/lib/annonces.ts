import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Annonce } from "./types";

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
      .limit(limite);
    if (error) throw error;
    return (data ?? []) as Annonce[];
  } catch {
    // Sans backend configuré, on renvoie une liste vide plutôt que planter.
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
    return (data ?? []) as Annonce[];
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
