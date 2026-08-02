import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { remplirCarre } from "@/lib/affiche/reseaux";

// Génère l'image carrée (Facebook/Instagram). Réservé au propriétaire.
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/carre/[id]">,
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

  const origin = new URL(request.url).origin;
  const jpeg = await remplirCarre(annonce, origin);
  const dossier = annonce.numero_dossier ?? id;

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `inline; filename="animalerte-carre-${dossier}.jpg"`,
      "Cache-Control": "no-store",
    },
  });
}
