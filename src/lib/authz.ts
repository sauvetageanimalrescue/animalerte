import { createClient } from "@/lib/supabase/server";

export type Profil = {
  id: string;
  nom: string;
  prenom: string | null;
  courriel: string;
  telephone: string | null;
  adresse: string | null;
};

// Utilisateur Supabase courant (ou null si non connecté).
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Profil applicatif courant, joint sur la table public.profiles.
export async function getCurrentProfile(): Promise<Profil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, nom, prenom, courriel, telephone, adresse")
    .eq("id", user.id)
    .single();

  return data ?? null;
}
