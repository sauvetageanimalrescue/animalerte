"use server";

import { getCurrentUser, estAdmin } from "@/lib/authz";
import { versE164 } from "@/lib/twilio";

// Outil d'administration : envoyer un SMS depuis le numéro animALERTE (Twilio)
// à une personne dont on a vu l'affiche d'animal perdu, pour l'inviter sur le
// site. Réservé aux administrateurs. Envoi via l'API REST Twilio (Basic Auth),
// depuis le numéro TWILIO_CALLER_ID. Aucune dépendance : simple fetch.

export type EtatSms = { ok?: boolean; message?: string };

// Longueur maximale prudente (quelques segments SMS).
const MAX = 600;

export async function envoyerSmsAdmin(
  _prev: EtatSms,
  formData: FormData,
): Promise<EtatSms> {
  const user = await getCurrentUser();
  if (!estAdmin(user)) return { ok: false, message: "Accès refusé." };

  const to = versE164(String(formData.get("telephone") ?? ""));
  const corps = String(formData.get("message") ?? "").trim();
  if (!to) return { ok: false, message: "Numéro de téléphone invalide." };
  if (!corps) return { ok: false, message: "Le message est vide." };
  if (corps.length > MAX) return { ok: false, message: "Message trop long." };

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_CALLER_ID;
  if (!sid || !token || !from) {
    return {
      ok: false,
      message:
        "SMS non configuré : il manque TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ou TWILIO_CALLER_ID.",
    };
  }

  try {
    const body = new URLSearchParams({ To: to, From: from, Body: corps });
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    if (!resp.ok) {
      const err = (await resp.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        ok: false,
        message: err?.message
          ? `Échec Twilio : ${err.message}`
          : `Échec de l'envoi (code ${resp.status}).`,
      };
    }
    return { ok: true, message: `Message envoyé à ${to}.` };
  } catch {
    return { ok: false, message: "Erreur de connexion à Twilio." };
  }
}
