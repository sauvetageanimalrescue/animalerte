"use server";

import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { estForfait, NOMS, PRIX_CENTS } from "@/lib/forfaits";

// Choix d'un forfait pour une annonce « perdu ».
// Gratuit → on va directement à la fiche.
// Payant → on crée une session Stripe Checkout et on y redirige.
export async function payerForfait(formData: FormData): Promise<void> {
  const annonceId = String(formData.get("annonce") ?? "");
  const forfait = String(formData.get("forfait") ?? "");
  const locale = await getLocale();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/connexion`);

  // Rien à payer pour le forfait gratuit.
  if (forfait === "gratuit") {
    redirect(`/${locale}/annonces/${annonceId}`);
  }
  if (!estForfait(forfait)) {
    redirect(`/${locale}/annonces/${annonceId}/forfait`);
  }

  // Vérifie la propriété de l'annonce.
  const { data: annonce } = await supabase
    .from("annonces")
    .select("id, user_id, nom_animal")
    .eq("id", annonceId)
    .single();
  if (!annonce || annonce.user_id !== user.id) {
    redirect(`/${locale}/annonces/${annonceId}`);
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  const nom = NOMS[forfait][locale === "en" ? "en" : "fr"];
  const animal = annonce.nom_animal ? ` — ${annonce.nom_animal}` : "";

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    locale: locale === "en" ? "en" : "fr-CA",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: PRIX_CENTS[forfait],
          product_data: { name: `animALERTE${animal}`, description: nom },
        },
      },
    ],
    metadata: { annonce_id: annonceId, forfait, locale },
    success_url: `${origin}/api/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/annonces/${annonceId}/forfait?annule=1`,
  });

  // Mémorise la session (traçabilité).
  await supabase
    .from("annonces")
    .update({ stripe_session_id: session.id })
    .eq("id", annonceId)
    .eq("user_id", user.id);

  if (!session.url) {
    redirect(`/${locale}/annonces/${annonceId}/forfait?erreur=1`);
  }
  redirect(session.url);
}
