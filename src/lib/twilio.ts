import "server-only";
import crypto from "crypto";
import { headers } from "next/headers";

// Ligne sans frais animALERTE — utilitaires Twilio (voix programmable).
// Ces routes reçoivent les appels de Twilio et renvoient des instructions
// (TwiML). Comme elles peuvent révéler le numéro d'un propriétaire, on VALIDE
// la signature Twilio à chaque requête (fail-closed si le jeton est absent).

// Reconstruit l'URL publique exacte que Twilio a signée (derrière le proxy).
async function urlPublique(request: Request): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const u = new URL(request.url);
  return `${proto}://${host}${u.pathname}${u.search}`;
}

// Lit le corps du formulaire ET valide la signature Twilio (HMAC-SHA1 sur
// l'URL + les paramètres triés, comparé à l'en-tête X-Twilio-Signature).
export async function lireEtValiderTwilio(
  request: Request,
): Promise<{ valide: boolean; params: Record<string, string> }> {
  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    params[k] = typeof v === "string" ? v : "";
  }

  const token = process.env.TWILIO_AUTH_TOKEN;
  const signature = (await headers()).get("x-twilio-signature");
  if (!token || !signature) return { valide: false, params };

  const url = await urlPublique(request);
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join("");
  const attendu = crypto
    .createHmac("sha1", token)
    .update(Buffer.from(data, "utf-8"))
    .digest("base64");

  const a = Buffer.from(attendu);
  const b = Buffer.from(signature);
  const valide = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { valide, params };
}

// « 514-555-1234 » → « +15145551234 ». null si non exploitable.
export function versE164(tel: string | null | undefined): string | null {
  if (!tel) return null;
  const d = tel.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

// Réponse TwiML (XML) pour Twilio.
export function reponseTwiml(xml: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${xml}`, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
