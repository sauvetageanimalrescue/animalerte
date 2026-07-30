"use server";

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
