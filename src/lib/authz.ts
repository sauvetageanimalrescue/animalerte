import { createClient } from "@/lib/supabase/server";

export type Profil = {
  id: string;
  nom: string;
  prenom: string | null;
  courriel: string;
  telephone: string | null;
  adresse: string | null;
};

// Rôle administrateur : réservé aux courriels listés dans ADMIN_EMAILS
// (séparés par des virgules, définis côté serveur / Vercel). Un admin peut
// inspecter n'importe quelle annonce comme s'il en était le propriétaire.
export function estAdmin(
  user: { email?: string | null } | null | undefined,
): boolean {
  const email = user?.email?.toLowerCase();
  if (!email) return false;
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);
}

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
