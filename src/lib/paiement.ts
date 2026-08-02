import "server-only";
import { stripe } from "./stripe";
import { createAdminClient } from "./supabase/admin";
import { estForfait } from "./forfaits";

// Confirme un paiement Stripe et inscrit le forfait sur l'annonce.
// Idempotent : appelable par la page de succès ET par le webhook.
export async function finaliserPaiement(
  sessionId: string,
): Promise<{ annonceId: string; locale: string } | null> {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return null;

  const annonceId = session.metadata?.annonce_id;
  const forfait = session.metadata?.forfait;
  const locale = session.metadata?.locale === "en" ? "en" : "fr";
  if (!annonceId || !estForfait(forfait) || forfait === "gratuit") return null;

  // Client service_role : contourne la RLS (le paiement fait autorité).
  const admin = createAdminClient();
  await admin
    .from("annonces")
    .update({
      forfait,
      paye: true,
      paye_at: new Date().toISOString(),
      stripe_session_id: session.id,
    })
    .eq("id", annonceId);

  return { annonceId, locale };
}
