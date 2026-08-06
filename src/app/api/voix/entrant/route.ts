import { lireEtValiderTwilio, reponseTwiml } from "@/lib/twilio";

// Point d'entrée de la ligne sans frais : Twilio appelle cette route quand
// quelqu'un compose le numéro. On accueille l'appelant et on recueille les
// 4 chiffres du dossier, puis Twilio POST vers /api/voix/router.
export async function POST(request: Request) {
  const { valide } = await lireEtValiderTwilio(request);
  if (!valide) return new Response("Non autorisé", { status: 403 });

  return reponseTwiml(
    `<Response>` +
      `<Gather input="dtmf" numDigits="4" timeout="10" action="/api/voix/router" method="POST">` +
      `<Say voice="Polly.Chantal">Bonjour, vous avez joint la ligne animALERTE, ` +
      `le service d'aide pour les animaux perdus. Pour joindre la famille de ` +
      `l'animal, veuillez composer le numéro à quatre chiffres qui se trouve sur ` +
      `la fiche. Ce sont les quatre derniers chiffres du numéro de dossier ` +
      `indiqué sur l'affiche ou sur la fiche de l'animal. Composez-les maintenant.</Say>` +
      `<Say voice="Polly.Joanna">Hello, you have reached the animALERTE line, ` +
      `the help service for lost pets. To reach the animal's family, please enter ` +
      `the four digit number shown on the listing. These are the last four digits ` +
      `of the file number shown on the poster or on the animal's listing. Enter them now.</Say>` +
      `</Gather>` +
      `<Say voice="Polly.Chantal">Nous n'avons pas reçu votre saisie. Au revoir.</Say>` +
      `<Say voice="Polly.Joanna">We did not receive your entry. Goodbye.</Say>` +
      `<Hangup/>` +
      `</Response>`,
  );
}
