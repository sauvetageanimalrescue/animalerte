"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function texte(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function modifierProfil(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = await getLocale();
  if (!user) redirect(`/${locale}/connexion`);

  await supabase
    .from("profiles")
    .update({
      nom: texte(formData.get("nom")),
      prenom: texte(formData.get("prenom")) || null,
      adresse: texte(formData.get("adresse")) || null,
      telephone: texte(formData.get("telephone")) || null,
    })
    .eq("id", user.id);

  redirect(`/${locale}/profil?ok=1`);
}
