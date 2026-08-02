import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { remplirAffiche } from "@/lib/affiche/remplir";
import { peut } from "@/lib/forfaits";

// Génère l'affiche PDF d'une annonce (gabarit d'Eric rempli automatiquement).
// Réservé au propriétaire de l'annonce (l'affiche est une fonction du forfait).
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/affiche/[id]">,
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
  // L'affiche est débloquée à partir du forfait Locale.
  if (!peut(annonce.forfait, "affiche")) {
    return new Response("Forfait insuffisant", { status: 402 });
  }

  const origin = new URL(request.url).origin;
  const bytes = await remplirAffiche(annonce, origin);
  const dossier = annonce.numero_dossier ?? id;

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="affiche-${dossier}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
