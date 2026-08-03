"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

function texte(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
function nombreOuNull(v: FormDataEntryValue | null): number | null {
  const n = Number.parseFloat(texte(v));
  return Number.isFinite(n) ? n : null;
}

// Inscription d'une Sentinelle : aucun compte requis, juste des coordonnées et
// une ville pour recevoir les alertes géociblées. Insertion côté serveur.
export async function inscrireSentinelle(formData: FormData): Promise<void> {
  const locale = await getLocale();
  const nom = texte(formData.get("nom"));
  const courriel = texte(formData.get("courriel"));
  if (!nom || !courriel) {
    redirect(`/${locale}/sentinelle?erreur=1`);
  }

  const admin = createAdminClient();
  await admin.from("sentinelles").insert({
    nom,
    courriel,
    telephone: texte(formData.get("telephone")) || null,
    ville: texte(formData.get("ville")) || null,
    ville_lat: nombreOuNull(formData.get("ville_lat")),
    ville_lng: nombreOuNull(formData.get("ville_lng")),
  });

  redirect(`/${locale}/sentinelle?ok=1`);
}
