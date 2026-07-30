import type {
  Espece,
  Province,
  Sexe,
  StatutAnnonce,
  TypeAnnonce,
} from "./constants";

// Reflète la table public.annonces (voir supabase/migrations).
export type Annonce = {
  id: string;
  user_id: string;
  type: TypeAnnonce;
  statut: StatutAnnonce;
  espece: Espece;
  race: string | null;
  nom_animal: string | null;
  sexe: Sexe;
  couleur: string | null;
  description: string | null;
  ville: string;
  province: Province;
  latitude: number | null;
  longitude: number | null;
  date_evenement: string; // date ISO (YYYY-MM-DD)
  contact_nom: string;
  contact_courriel: string | null;
  contact_telephone: string | null;
  photo_url: string | null;
  created_at: string;
};
