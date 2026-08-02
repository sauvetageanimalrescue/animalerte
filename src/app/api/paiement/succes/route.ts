import { NextResponse } from "next/server";
import { finaliserPaiement } from "@/lib/paiement";

export const runtime = "nodejs";

// Retour depuis Stripe Checkout : confirme le paiement puis redirige vers la
// fiche. Le webhook fait le même travail (idempotent) comme filet de sécurité.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  let annonceId = "";
  let locale = "fr";
  if (sessionId) {
    const resultat = await finaliserPaiement(sessionId);
    if (resultat) {
      annonceId = resultat.annonceId;
      locale = resultat.locale;
    }
  }

  const destination = annonceId
    ? `/${locale}/annonces/${annonceId}?paiement=succes`
    : `/${locale}/mes-annonces`;
  return NextResponse.redirect(new URL(destination, url.origin));
}
