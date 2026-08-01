import { obtenirAnnonce } from "@/lib/annonces";
import { remplirAffiche } from "@/lib/affiche/remplir";

// Génère l'affiche PDF d'une annonce (gabarit d'Eric rempli automatiquement).
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/affiche/[id]">,
) {
  const { id } = await ctx.params;
  const annonce = await obtenirAnnonce(id);
  if (!annonce) return new Response("Introuvable", { status: 404 });

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
