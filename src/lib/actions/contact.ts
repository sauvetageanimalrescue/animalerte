"use server";

import { getTranslations } from "next-intl/server";

export type EtatContact = { erreur?: string; message?: string };

// Envoie le message du formulaire de contact par courriel (via l'API Resend).
// L'adresse du visiteur est mise en « répondre à » pour une réponse directe.
export async function envoyerContact(
  _prev: EtatContact,
  formData: FormData,
): Promise<EtatContact> {
  const t = await getTranslations("contact");
  const nom = String(formData.get("nom") ?? "").trim();
  const courriel = String(formData.get("courriel") ?? "").trim();
  const sujet = String(formData.get("sujet") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!nom || !courriel || !message) return { erreur: t("erreurChamps") };

  const cle = process.env.RESEND_API_KEY;
  const destinataire = process.env.CONTACT_EMAIL || "e.dussault@sar.quebec";
  if (!cle) return { erreur: t("erreurEnvoi") };

  const sujetComplet = sujet
    ? `Contact animALERTE : ${sujet}`
    : "Contact animALERTE";
  const corps =
    `Nom : ${nom}\n` +
    `Courriel : ${courriel}\n` +
    `Sujet : ${sujet || "(aucun)"}\n\n` +
    message;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "animALERTE <noreply@animalerte.ca>",
        to: [destinataire],
        reply_to: courriel,
        subject: sujetComplet,
        text: corps,
      }),
    });
    if (!res.ok) return { erreur: t("erreurEnvoi") };
  } catch {
    return { erreur: t("erreurEnvoi") };
  }

  return { message: t("succes") };
}
