"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

// Messagerie anonyme : le propriétaire (compte) et un trouveur (lien privé, sans
// compte) échangent dans un fil, sans jamais voir le courriel de l'autre.
// animALERTE relaie seulement des avis « vous avez un message » par courriel.

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://animalerte.ca";
const MAX = 4000;

async function envoyerAvis(
  destinataire: string,
  sujet: string,
  texte: string,
): Promise<void> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "animALERTE <noreply@animalerte.ca>",
        to: [destinataire],
        subject: sujet,
        text: texte,
      }),
    });
  } catch {
    // Un avis raté ne doit pas faire échouer l'envoi du message.
  }
}

const courrielValide = (c: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c);

export type EtatContact = {
  erreur?: "champs" | "introuvable" | "soi";
  envoye?: boolean;
};

// Le trouveur écrit à la famille depuis la fiche. Réutilise son fil s'il existe.
export async function demarrerConversation(
  _prev: EtatContact,
  formData: FormData,
): Promise<EtatContact> {
  const annonceId = String(formData.get("annonce") ?? "");
  const courriel = String(formData.get("courriel") ?? "")
    .trim()
    .toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  if (!courrielValide(courriel) || !message || message.length > MAX) {
    return { erreur: "champs" };
  }

  const admin = createAdminClient();
  const { data: annonce } = await admin
    .from("annonces")
    .select("id, user_id, nom_animal, contact_courriel")
    .eq("id", annonceId)
    .single();
  if (!annonce) return { erreur: "introuvable" };

  // Le propriétaire ne se contacte pas lui-même.
  const user = await getCurrentUser();
  if (user && user.id === annonce.user_id) return { erreur: "soi" };

  // Fil existant pour ce trouveur, sinon on en crée un.
  const { data: existant } = await admin
    .from("conversations")
    .select("id, trouveur_jeton")
    .eq("annonce_id", annonceId)
    .eq("trouveur_courriel", courriel)
    .maybeSingle();

  let convId: string;
  let jeton: string;
  if (existant) {
    convId = existant.id;
    jeton = existant.trouveur_jeton;
    await admin
      .from("conversations")
      .update({
        dernier_message_par: "trouveur",
        dernier_message_at: new Date().toISOString(),
      })
      .eq("id", convId);
  } else {
    jeton = crypto.randomBytes(24).toString("hex");
    const { data: nouv } = await admin
      .from("conversations")
      .insert({
        annonce_id: annonceId,
        proprietaire_id: annonce.user_id,
        trouveur_courriel: courriel,
        trouveur_jeton: jeton,
        dernier_message_par: "trouveur",
      })
      .select("id")
      .single();
    if (!nouv) return { erreur: "introuvable" };
    convId = nouv.id;
  }

  await admin.from("messages").insert({
    conversation_id: convId,
    expediteur: "trouveur",
    corps: message,
  });

  const nom = annonce.nom_animal || "un animal";
  if (annonce.contact_courriel) {
    await envoyerAvis(
      annonce.contact_courriel,
      `Nouveau message au sujet de ${nom}`,
      `Bonjour,\n\nQuelqu'un vous a écrit au sujet de ${nom} sur animALERTE. Le contenu du message reste confidentiel dans votre boîte.\n\nPour le lire et répondre : ${BASE}/fr/mes-messages\n\n— L'équipe animALERTE`,
    );
  }
  await envoyerAvis(
    courriel,
    `Votre message au sujet de ${nom}`,
    `Bonjour,\n\nVotre message a bien été transmis à la famille de ${nom}. Vous recevrez un avis ici si elle répond.\n\nPour suivre la conversation (lien privé, à ne pas partager) : ${BASE}/fr/messages/${jeton}\n\n— L'équipe animALERTE`,
  );

  return { envoye: true };
}

// Réponse du propriétaire (depuis son compte).
export async function repondreProprietaire(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const convId = String(formData.get("conversation") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!message || message.length > MAX) return;

  const admin = createAdminClient();
  const { data: conv } = await admin
    .from("conversations")
    .select("id, proprietaire_id, annonce_id, trouveur_courriel, trouveur_jeton")
    .eq("id", convId)
    .single();
  if (!conv || conv.proprietaire_id !== user.id) return;

  await admin.from("messages").insert({
    conversation_id: convId,
    expediteur: "proprietaire",
    corps: message,
  });
  await admin
    .from("conversations")
    .update({
      dernier_message_par: "proprietaire",
      dernier_message_at: new Date().toISOString(),
    })
    .eq("id", convId);

  const { data: annonce } = await admin
    .from("annonces")
    .select("nom_animal")
    .eq("id", conv.annonce_id)
    .single();
  const nom = annonce?.nom_animal || "un animal";
  await envoyerAvis(
    conv.trouveur_courriel,
    `Réponse au sujet de ${nom}`,
    `Bonjour,\n\nLa famille de ${nom} vous a répondu sur animALERTE.\n\nPour lire et répondre (lien privé) : ${BASE}/fr/messages/${conv.trouveur_jeton}\n\n— L'équipe animALERTE`,
  );

  revalidatePath(`/mes-messages/${convId}`);
}

// Réponse du trouveur (via son lien privé, sans compte).
export async function repondreTrouveur(formData: FormData): Promise<void> {
  const jeton = String(formData.get("jeton") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!jeton || !message || message.length > MAX) return;

  const admin = createAdminClient();
  const { data: conv } = await admin
    .from("conversations")
    .select("id, annonce_id")
    .eq("trouveur_jeton", jeton)
    .single();
  if (!conv) return;

  await admin.from("messages").insert({
    conversation_id: conv.id,
    expediteur: "trouveur",
    corps: message,
  });
  await admin
    .from("conversations")
    .update({
      dernier_message_par: "trouveur",
      dernier_message_at: new Date().toISOString(),
    })
    .eq("id", conv.id);

  const { data: annonce } = await admin
    .from("annonces")
    .select("nom_animal, contact_courriel")
    .eq("id", conv.annonce_id)
    .single();
  const nom = annonce?.nom_animal || "un animal";
  if (annonce?.contact_courriel) {
    await envoyerAvis(
      annonce.contact_courriel,
      `Nouveau message au sujet de ${nom}`,
      `Bonjour,\n\nVous avez reçu une réponse au sujet de ${nom} sur animALERTE.\n\nPour la lire et répondre : ${BASE}/fr/mes-messages\n\n— L'équipe animALERTE`,
    );
  }

  revalidatePath(`/messages/${jeton}`);
}
