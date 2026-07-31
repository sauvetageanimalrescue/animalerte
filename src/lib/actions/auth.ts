"use server";

import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EtatAuth = { erreur?: string; message?: string };

export async function connexion(
  _prev: EtatAuth,
  formData: FormData,
): Promise<EtatAuth> {
  const t = await getTranslations("auth");
  const courriel = String(formData.get("courriel") ?? "").trim();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: courriel,
    password: motDePasse,
  });

  if (error) return { erreur: t("erreurIdentifiants") };

  const locale = await getLocale();
  redirect(`/${locale}/mes-annonces`);
}

export async function inscription(
  _prev: EtatAuth,
  formData: FormData,
): Promise<EtatAuth> {
  const t = await getTranslations("auth");
  const nom = String(formData.get("nom") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim();
  const courriel = String(formData.get("courriel") ?? "").trim();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: courriel,
    password: motDePasse,
    options: { data: { nom, telephone: telephone || null } },
  });

  if (error) return { erreur: t("erreurInscription") };

  // Si la confirmation par courriel est désactivée, une session existe déjà.
  if (data.session) {
    const locale = await getLocale();
    redirect(`/${locale}/mes-annonces`);
  }

  return { message: t("verifierCourriel") };
}

// Envoie le courriel de réinitialisation avec un lien vers /reinitialiser.
export async function resetMotDePasse(
  _prev: EtatAuth,
  formData: FormData,
): Promise<EtatAuth> {
  const t = await getTranslations("auth");
  const courriel = String(formData.get("courriel") ?? "").trim();
  const locale = await getLocale();

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto =
    host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(courriel, {
    redirectTo: `${origin}/auth/callback?next=/${locale}/reinitialiser`,
  });
  if (error) return { erreur: t("erreurReinit") };
  return { message: t("reinitEnvoye") };
}

// Définit le nouveau mot de passe (dans la session de récupération).
export async function definirMotDePasse(
  _prev: EtatAuth,
  formData: FormData,
): Promise<EtatAuth> {
  const t = await getTranslations("auth");
  const motDePasse = String(formData.get("motDePasse") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: motDePasse });
  if (error) return { erreur: t("erreurReinit") };
  return { message: t("definiSucces") };
}
