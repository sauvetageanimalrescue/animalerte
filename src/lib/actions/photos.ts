"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/authz";
import { nbPhotosMax } from "@/lib/forfaits";

export type EtatPhotos = { erreur?: "connexion" | "acces" | "limite" | "aucune" };

// Ajoute une ou plusieurs photos supplémentaires à une annonce, dans la limite
// du forfait (photo principale comprise). Réservé au propriétaire.
export async function ajouterPhotos(
  _prev: EtatPhotos,
  formData: FormData,
): Promise<EtatPhotos> {
  const user = await getCurrentUser();
  if (!user) return { erreur: "connexion" };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, user_id, forfait, photos")
    .eq("id", id)
    .single();
  if (!annonce || annonce.user_id !== user.id) return { erreur: "acces" };

  const existantes: string[] = annonce.photos ?? [];
  // Extras autorisés = total du forfait moins la photo principale.
  const extrasMax = Math.max(0, nbPhotosMax(annonce.forfait) - 1);
  const placesRestantes = extrasMax - existantes.length;
  if (placesRestantes <= 0) return { erreur: "limite" };

  const fichiers = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, placesRestantes);
  if (fichiers.length === 0) return { erreur: "aucune" };

  const nouvelles: string[] = [];
  for (const photo of fichiers) {
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase();
    const chemin = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(chemin, photo, { contentType: photo.type || undefined });
    if (!error) {
      nouvelles.push(
        supabase.storage.from("photos").getPublicUrl(chemin).data.publicUrl,
      );
    }
  }

  if (nouvelles.length > 0) {
    await supabase
      .from("annonces")
      .update({ photos: [...existantes, ...nouvelles] })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  revalidatePath(`/annonces/${id}/photos`);
  revalidatePath(`/annonces/${id}`);
  return {};
}

// Retire une photo supplémentaire (par son URL). Réservé au propriétaire.
export async function supprimerPhoto(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "");
  const supabase = await createClient();
  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, user_id, photos")
    .eq("id", id)
    .single();
  if (!annonce || annonce.user_id !== user.id) return;

  const restantes = (annonce.photos ?? []).filter((u: string) => u !== url);
  await supabase
    .from("annonces")
    .update({ photos: restantes })
    .eq("id", id)
    .eq("user_id", user.id);

  // Nettoyage du fichier dans le stockage (chemin = tout après « /photos/ »).
  const marqueur = "/photos/";
  const i = url.indexOf(marqueur);
  if (i !== -1) {
    const chemin = url.slice(i + marqueur.length);
    await supabase.storage.from("photos").remove([chemin]);
  }

  revalidatePath(`/annonces/${id}/photos`);
  revalidatePath(`/annonces/${id}`);
}
