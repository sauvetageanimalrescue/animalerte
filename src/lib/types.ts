import type {
  Espece,
  Province,
  Sexe,
  StatutAnnonce,
  TypeAnnonce,
} from "./constants";
import type { Forfait } from "./forfaits";

// Reflète la table public.annonces (voir supabase/migrations).
export type Annonce = {
  id: string;
  user_id: string;
  numero_dossier: string | null;
  type: TypeAnnonce;
  statut: StatutAnnonce;
  espece: Espece;
  race: string | null;
  nom_animal: string | null;
  sexe: Sexe;
  age: string | null;
  poids: string | null;
  couleur: string | null;
  couleur_yeux: string | null;
  signes_distinctifs: string | null;
  sterilise: boolean | null;
  micropuce: boolean | null;
  micropuce_numero: string | null;
  accessoires: string | null;
  temperament: string | null;
  etat: string | null; // état d'un animal trouvé (sain / blessé / décédé)
  description: string | null;
  ville: string;
  province: Province;
  adresse: string | null;
  dernier_lieu_vu: string | null;
  latitude: number | null;
  longitude: number | null;
  date_evenement: string; // date ISO (YYYY-MM-DD)
  heure_approx: string | null;
  recompense: boolean;
  recompense_montant: string | null;
  contact_nom: string;
  contact_prenom: string | null;
  contact_adresse: string | null;
  contact_courriel: string | null;
  contact_telephone: string | null;
  photo_url: string | null;
  photos: string[] | null; // photos supplémentaires (vues générales)
  forfait: Forfait;
  paye: boolean;
  paye_at: string | null;
  stripe_session_id: string | null;
  created_at: string;
};
