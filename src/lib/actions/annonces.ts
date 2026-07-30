"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EtatAnnonce = { erreur?: string };

function texte(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
function texteOuNull(v: FormDataEntryValue | null): string | null {
  const s = texte(v);
  return s === "" ? null : s;
}
function nombreOuNull(v: FormDataEntryValue | null): number | null {
  const n = Number.parseFloat(texte(v));
  return Number.isFinite(n) ? n : null;
}

export async function publierAnnonce(
  _prev: EtatAnnonce,
  formData: FormData,
): Promise<EtatAnnonce> {
  const t = await getTranslations("formulaire");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erreur: t("erreurGenerale") };

  const contactCourriel = texteOuNull(formData.get("contact_courriel"));
  const contactTelephone = texteOuNull(formData.get("contact_telephone"));
  if (!contactCourriel && !contactTelephone) {
    return { erreur: t("erreurContact") };
  }

  // Téléversement de la photo (optionnel).
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase();
    const chemin = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: erreurUpload } = await supabase.storage
      .from("photos")
      .upload(chemin, photo, { contentType: photo.type || undefined });
    if (!erreurUpload) {
      photoUrl = supabase.storage.from("photos").getPublicUrl(chemin)
        .data.publicUrl;
    }
  }

  const ligne = {
    user_id: user.id,
    type: texte(formData.get("type")) || "perdu",
    espece: texte(formData.get("espece")) || "autre",
    nom_animal: texteOuNull(formData.get("nom_animal")),
    race: texteOuNull(formData.get("race")),
    sexe: texte(formData.get("sexe")) || "inconnu",
    couleur: texteOuNull(formData.get("couleur")),
    description: texteOuNull(formData.get("description")),
    ville: texte(formData.get("ville")),
    province: texte(formData.get("province")) || "QC",
    latitude: nombreOuNull(formData.get("latitude")),
    longitude: nombreOuNull(formData.get("longitude")),
    date_evenement: texte(formData.get("date_evenement")),
    contact_nom: texte(formData.get("contact_nom")),
    contact_courriel: contactCourriel,
    contact_telephone: contactTelephone,
    photo_url: photoUrl,
  };

  const { data, error } = await supabase
    .from("annonces")
    .insert(ligne)
    .select("id")
    .single();

  if (error || !data) return { erreur: t("erreurGenerale") };

  const locale = await getLocale();
  redirect(`/${locale}/annonces/${data.id}`);
}

export async function basculerStatut(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = texte(formData.get("id"));
  const statut = texte(formData.get("statut")) === "resolu" ? "resolu" : "actif";
  await supabase
    .from("annonces")
    .update({ statut })
    .eq("id", id)
    .eq("user_id", user.id);

  const locale = await getLocale();
  redirect(`/${locale}/mes-annonces`);
}

export async function supprimerAnnonce(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = texte(formData.get("id"));
  await supabase.from("annonces").delete().eq("id", id).eq("user_id", user.id);

  const locale = await getLocale();
  redirect(`/${locale}/mes-annonces`);
}
