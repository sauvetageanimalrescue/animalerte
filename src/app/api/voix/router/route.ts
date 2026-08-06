import { createAdminClient } from "@/lib/supabase/admin";
import { lireEtValiderTwilio, reponseTwiml, versE164 } from "@/lib/twilio";

// Reçoit les 4 chiffres composés, retrouve l'annonce active correspondante et
// met l'appelant en relation avec le propriétaire — en masquant les numéros
// (Twilio compose depuis notre numéro, jamais depuis celui de l'appelant).
export async function POST(request: Request) {
  const { valide, params } = await lireEtValiderTwilio(request);
  if (!valide) return new Response("Non autorisé", { status: 403 });

  const introuvable = reponseTwiml(
    `<Response>` +
      `<Say voice="Polly.Chantal">Aucun dossier actif ne correspond à ce numéro. ` +
      `Vérifiez les quatre chiffres sur l'affiche et rappelez. Au revoir.</Say>` +
      `<Say voice="Polly.Joanna">No active file matches this number. ` +
      `Please check the four digits on the poster and call again. Goodbye.</Say>` +
      `<Hangup/>` +
      `</Response>`,
  );

  const digits = (params.Digits ?? "").replace(/\D/g, "");
  if (digits.length !== 4) return introuvable;

  // Dossier au format « AA-NNNN » : on retrouve l'annonce active dont le numéro
  // se termine par ces 4 chiffres (la plus récente en cas de collision d'année).
  const admin = createAdminClient();
  const { data } = await admin
    .from("annonces")
    .select("contact_telephone, numero_dossier")
    .eq("statut", "actif")
    .ilike("numero_dossier", `%-${digits}`)
    .order("created_at", { ascending: false })
    .limit(1);

  const numero = versE164(data?.[0]?.contact_telephone);
  const callerId = process.env.TWILIO_CALLER_ID;
  if (!numero || !callerId) return introuvable;

  return reponseTwiml(
    `<Response>` +
      `<Say voice="Polly.Chantal">Un instant, nous vous mettons en relation.</Say>` +
      `<Say voice="Polly.Joanna">One moment, we are connecting you.</Say>` +
      `<Dial callerId="${callerId}" timeout="25"><Number>${numero}</Number></Dial>` +
      `</Response>`,
  );
}
