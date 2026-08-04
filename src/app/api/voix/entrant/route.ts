import { lireEtValiderTwilio, reponseTwiml } from "@/lib/twilio";

// Point d'entrée de la ligne sans frais : Twilio appelle cette route quand
// quelqu'un compose le numéro. On accueille l'appelant et on recueille les
// 4 chiffres du dossier, puis Twilio POST vers /api/voix/router.
export async function POST(request: Request) {
  const { valide } = await lireEtValiderTwilio(request);
  if (!valide) return new Response("Non autorisé", { status: 403 });

  return reponseTwiml(
    `<Response>` +
      `<Gather input="dtmf" numDigits="4" timeout="8" action="/api/voix/router" method="POST">` +
      `<Say language="fr-CA">Bonjour, vous avez joint la ligne animALERTE. ` +
      `Composez les quatre chiffres du dossier indiqués sur l'affiche.</Say>` +
      `</Gather>` +
      `<Say language="fr-CA">Nous n'avons pas reçu votre saisie. Au revoir.</Say>` +
      `<Hangup/>` +
      `</Response>`,
  );
}
