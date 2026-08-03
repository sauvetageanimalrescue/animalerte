"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function texte(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
function nombreOuNull(v: FormDataEntryValue | null): number | null {
  const n = Number.parseFloat(texte(v));
  return Number.isFinite(n) ? n : null;
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
      telephone: texte(formData.get("telephone")) || null,
      ville: texte(formData.get("ville")) || null,
      ville_lat: nombreOuNull(formData.get("ville_lat")),
      ville_lng: nombreOuNull(formData.get("ville_lng")),
    })
    .eq("id", user.id);

  redirect(`/${locale}/profil?ok=1`);
}
