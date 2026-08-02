import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { finaliserPaiement } from "@/lib/paiement";

export const runtime = "nodejs";

// Webhook Stripe : confirme les paiements de façon fiable, même si le client
// ferme l'onglet avant le retour sur la page de succès.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return new Response("Configuration du webhook manquante", { status: 400 });
  }

  const corps = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(corps, signature, secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await finaliserPaiement(session.id);
  }

  return new Response("ok");
}
