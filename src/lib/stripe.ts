import "server-only";
import Stripe from "stripe";

// Initialisation paresseuse : évite de planter au build si la clé est absente
// (l'erreur ne survient qu'au moment d'un vrai appel Stripe).
let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (!_stripe) {
    const cle = process.env.STRIPE_SECRET_KEY;
    if (!cle) throw new Error("STRIPE_SECRET_KEY manquante");
    _stripe = new Stripe(cle);
  }
  return _stripe;
}
