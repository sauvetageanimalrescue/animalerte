import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { remplirStory } from "@/lib/affiche/reseaux";
import { peut } from "@/lib/forfaits";

// Génère l'image story (vertical 9:16). Réservé au propriétaire.
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/story/[id]">,
) {
  const { id } = await ctx.params;
  const annonce = await obtenirAnnonce(id);
  if (!annonce) return new Response("Introuvable", { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== annonce.user_id) {
    return new Response("Non autorisé", { status: 403 });
  }
  // Les images sociales sont débloquées à partir du forfait Régionale.
  if (!peut(annonce.forfait, "reseaux")) {
    return new Response("Forfait insuffisant", { status: 402 });
  }

  const origin = new URL(request.url).origin;
  const jpeg = await remplirStory(annonce, origin);
  const dossier = annonce.numero_dossier ?? id;

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="animalerte-story-${dossier}.jpg"`,
      "Cache-Control": "no-store",
    },
  });
}
