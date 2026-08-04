import "server-only";

// Courriel de conseils — envoyé automatiquement à la famille dès qu'un animal
// est signalé « perdu ». Deux contenus distincts, chat et chien, parce que leur
// comportement diffère du tout au tout : un chat effrayé se fige et se cache
// tout près en silence, un chien apeuré fuit et peut s'éloigner beaucoup. Les
// conseils s'appuient sur les pratiques reconnues de recherche d'animaux perdus
// (Missing Animal Response, SPCA et sociétés protectrices). Inclus dans tous les
// forfaits, même le Gratuit. L'envoi passe par Resend, comme les autres avis.

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://animalerte.ca";

type Espece = "chien" | "chat";
type Locale = "fr" | "en";

type Section = { titre: string; points: string[] };
type Conseils = {
  sujet: string;
  salutation: string;
  intro: string;
  encadre: string;
  sections: Section[];
  cloture: string;
  boutonFiche: string;
  signature: string;
  piedLigne: string;
};

// ————————————————————————————————————————————————————————————————
// Contenus. {nom} est remplacé par le nom de l'animal (ou un mot neutre).
// On évite volontairement les tirets cadratins dans la copie.
// ————————————————————————————————————————————————————————————————

const CHAT_FR: Conseils = {
  sujet: "{nom} a disparu : les gestes qui augmentent vos chances",
  salutation: "Bonjour,",
  intro:
    "On sait à quel point ce moment est difficile pour la famille de {nom}. Respirez un bon coup : la grande majorité des chats perdus sont retrouvés tout près de chez eux. Voici, dans l'ordre, ce qui fonctionne vraiment.",
  encadre:
    "À retenir avant tout : un chat effrayé se fige et se cache en silence, souvent à quelques mètres de la maison. Il ne miaulera pas et ne viendra pas forcément quand vous l'appelez, parfois avant sept à dix jours. Cherchez près, cherchez bas, et cherchez au calme.",
  sections: [
    {
      titre: "Dès les premières minutes",
      points: [
        "Commencez la recherche tout de suite, sans attendre au lendemain. Les premières heures sont les plus précieuses.",
        "Fouillez d'abord votre terrain, puis celui des voisins immédiats. Une étude a montré que la plupart des chats sont retrouvés à moins de 500 mètres de l'endroit où ils ont disparu.",
        "Laissez un accès ouvert vers la maison (porte, garage, remise) et déposez un peu de sa nourriture habituelle près de l'entrée.",
      ],
    },
    {
      titre: "Où et comment chercher",
      points: [
        "Cherchez bas et dans les recoins : sous les galeries, les patios, les cabanons, les voitures, dans les buissons, les tas de bois, les fissures de fondation.",
        "Un chat apeuré sort surtout la nuit, quand tout est calme. Ressortez à l'aube, au crépuscule et tard le soir, avec une lampe de poche : le reflet de ses yeux le trahit dans le noir.",
        "Avancez lentement, en silence. Arrêtez-vous souvent pour écouter, appelez doucement, puis attendez sans bouger.",
        "Demandez à chaque voisin de vérifier garage, cabanon et sous-sol. Un chat curieux se retrouve souvent enfermé quelque part sans faire de bruit.",
      ],
    },
    {
      titre: "Attirer votre chat en confiance",
      points: [
        "Installez une station près de la maison : nourriture, eau et un objet qui porte votre odeur ou la sienne.",
        "Une caméra de surveillance ou une caméra de chasse vous dira s'il vient manger, et à quelle heure.",
        "S'il vient sans se laisser approcher, empruntez une cage-trappe (les services animaliers et les refuges en prêtent souvent) plutôt que de l'attraper à la main : vous n'aurez souvent qu'une seule chance.",
        "Ne le poursuivez jamais. Laissez-le venir à vous.",
      ],
    },
    {
      titre: "Qui contacter",
      points: [
        "Prévenez les refuges, la SPCA, le service animalier et les cliniques vétérinaires de votre secteur, avec une photo claire.",
        "Passez sur place au refuge quand c'est possible : une description au téléphone ne vaut pas vos propres yeux.",
        "Si votre chat est micropucé, confirmez que vos coordonnées sont à jour au registre.",
        "Partagez votre fiche animALERTE et publiez dans les groupes Facebook d'animaux perdus de votre région.",
      ],
    },
    {
      titre: "Les erreurs à éviter",
      points: [
        "Crier son nom partout ou fouiller en groupe bruyant : cela le pousse à se terrer encore plus.",
        "Attendre au lendemain en espérant qu'il revienne seul.",
        "Chercher seulement le jour : c'est la nuit qu'il bouge.",
        "Baisser les bras trop vite. Bien des chats réapparaissent après plusieurs jours, voire plusieurs semaines.",
      ],
    },
  ],
  cloture:
    "Gardez espoir et gardez votre fiche à jour. Plus de la moitié des chats perdus retrouvent leur famille, souvent après plusieurs jours de patience. On est avec vous.",
  boutonFiche: "Voir ma fiche",
  signature: "L'équipe animALERTE",
  piedLigne:
    "animALERTE, alertes pour animaux perdus au Québec. Ligne sans frais : 1 833 999 AIDE.",
};

const CHIEN_FR: Conseils = {
  sujet: "{nom} a disparu : les gestes qui augmentent vos chances",
  salutation: "Bonjour,",
  intro:
    "On sait à quel point ce moment est difficile pour la famille de {nom}. Respirez un bon coup : en agissant vite et calmement, vous mettez toutes les chances de votre côté. Voici, dans l'ordre, ce qui fonctionne vraiment.",
  encadre:
    "Le réflexe le plus important : ne courez jamais après un chien perdu et ne criez pas son nom. Un chien apeuré fuit ce qui le poursuit, et se fait souvent frapper par une voiture en fuyant. Pour le ramener, on l'attire, on ne le pourchasse pas.",
  sections: [
    {
      titre: "Dès les premières minutes",
      points: [
        "Agissez tout de suite. Un chien peut parcourir une grande distance en peu de temps.",
        "Ratissez le voisinage rapidement et largement, à pied et en voiture, en demandant aux gens s'ils l'ont vu.",
        "Laissez à la maison, ou au dernier endroit où il a été vu, de l'eau, une gamelle de nourriture odorante et un objet à votre odeur, comme un vêtement porté. Beaucoup de chiens reviennent sur leurs pas.",
      ],
    },
    {
      titre: "Si vous l'apercevez",
      points: [
        "Ne courez pas vers lui et ne criez pas. Accroupissez-vous, tournez-vous de côté, évitez de le fixer dans les yeux.",
        "Restez calme et parlez d'une voix douce. Vous pouvez bâiller ou détourner le regard : ce sont des signaux d'apaisement qu'il comprend.",
        "Lancez de petits morceaux de nourriture odorante sur le côté, jamais directement sur lui, et laissez-le s'approcher à son rythme.",
        "Mieux encore : assoyez-vous par terre et attendez. La curiosité et la faim travaillent pour vous.",
      ],
    },
    {
      titre: "Attirer votre chien",
      points: [
        "Installez une station de nourriture au dernier endroit où il a été vu, avec une caméra si possible.",
        "Un chien en mode survie se concentre sur la nourriture, l'eau et un abri : ces points d'ancrage le ramènent.",
        "Si quelqu'un le voit, demandez-lui surtout de NE PAS le poursuivre ni l'appeler : qu'il note plutôt l'heure et la direction, et vous prévienne.",
      ],
    },
    {
      titre: "Qui contacter, vite",
      points: [
        "Prévenez sans tarder le service animalier ou la fourrière, les refuges, la SPCA et les cliniques vétérinaires de votre secteur, avec une photo claire.",
        "Un chien récupéré par un passant aboutit souvent au refuge ou à la fourrière : passez-y en personne.",
        "Si votre chien est micropucé, confirmez que vos coordonnées sont à jour au registre.",
        "Partagez votre fiche animALERTE et publiez dans les groupes Facebook d'animaux perdus de votre région. Ajoutez bien « NE PAS POURSUIVRE » sur vos affiches.",
      ],
    },
    {
      titre: "Les erreurs à éviter",
      points: [
        "Le poursuivre ou l'appeler en criant : c'est la première cause d'accident chez les chiens perdus.",
        "Envoyer une foule à sa recherche : trop de monde l'effraie et le fait fuir plus loin.",
        "Attendre avant de prévenir les refuges et le service animalier.",
        "Baisser les bras. Bien des chiens sont retrouvés après plusieurs jours, parfois loin de la maison.",
      ],
    },
  ],
  cloture:
    "Gardez espoir et gardez votre fiche à jour. En agissant calmement et en avertissant les bonnes personnes, vous maximisez vos chances de ramener {nom} à la maison. On est avec vous.",
  boutonFiche: "Voir ma fiche",
  signature: "L'équipe animALERTE",
  piedLigne:
    "animALERTE, alertes pour animaux perdus au Québec. Ligne sans frais : 1 833 999 AIDE.",
};

const CHAT_EN: Conseils = {
  sujet: "{nom} is missing: the steps that improve your odds",
  salutation: "Hello,",
  intro:
    "We know how hard this moment is for {nom}'s family. Take a deep breath: the vast majority of lost cats are found very close to home. Here, in order, is what actually works.",
  encadre:
    "First and foremost: a frightened cat freezes and hides silently, often just a few metres from home. It may not meow or come when called, sometimes for seven to ten days. Search close, search low, and search quietly.",
  sections: [
    {
      titre: "In the first few minutes",
      points: [
        "Start searching right away, not tomorrow. The first hours matter the most.",
        "Search your own property first, then your immediate neighbours'. A study found that most cats are recovered within 500 metres of where they went missing.",
        "Leave a way back into the home open (door, garage, shed) and set a little of their usual food near the entrance.",
      ],
    },
    {
      titre: "Where and how to search",
      points: [
        "Search low and in tight spots: under porches, decks, sheds, cars, in bushes, woodpiles and foundation gaps.",
        "A scared cat mostly comes out at night, when everything is quiet. Go back out at dawn, dusk and late evening with a flashlight: the shine of their eyes gives them away in the dark.",
        "Move slowly and quietly. Stop often to listen, call softly, then wait without moving.",
        "Ask every neighbour to check their garage, shed and basement. A curious cat often ends up shut in somewhere without making a sound.",
      ],
    },
    {
      titre: "Coaxing your cat back",
      points: [
        "Set up a station near the house: food, water and something that carries your scent or theirs.",
        "A security or trail camera will tell you if they come to eat, and at what time.",
        "If they come but won't let you near, borrow a humane trap (animal services and shelters often lend them) rather than grabbing by hand: you often get only one chance.",
        "Never chase. Let them come to you.",
      ],
    },
    {
      titre: "Who to contact",
      points: [
        "Alert shelters, the SPCA, animal services and veterinary clinics in your area, with a clear photo.",
        "Visit the shelter in person when you can: a phone description is no match for your own eyes.",
        "If your cat is microchipped, confirm your contact details are current in the registry.",
        "Share your animALERTE listing and post in your region's lost pet Facebook groups.",
      ],
    },
    {
      titre: "Mistakes to avoid",
      points: [
        "Shouting their name everywhere or searching in a loud group: it drives them to hide even deeper.",
        "Waiting until tomorrow hoping they come back on their own.",
        "Searching only in daytime: they move at night.",
        "Giving up too soon. Many cats reappear after several days, even weeks.",
      ],
    },
  ],
  cloture:
    "Keep hope, and keep your listing up to date. More than half of lost cats find their family again, often after several days of patience. We are with you.",
  boutonFiche: "View my listing",
  signature: "The animALERTE team",
  piedLigne:
    "animALERTE, lost pet alerts across Quebec. Toll-free line: 1 833 999 AIDE.",
};

const CHIEN_EN: Conseils = {
  sujet: "{nom} is missing: the steps that improve your odds",
  salutation: "Hello,",
  intro:
    "We know how hard this moment is for {nom}'s family. Take a deep breath: by acting fast and calmly, you give yourself the best possible chance. Here, in order, is what actually works.",
  encadre:
    "The single most important instinct to fight: never chase a lost dog and never shout their name. A frightened dog runs from whatever chases it, and is often hit by a car while fleeing. To bring them back, you lure them, you do not pursue them.",
  sections: [
    {
      titre: "In the first few minutes",
      points: [
        "Act right away. A dog can cover a lot of ground in very little time.",
        "Comb the neighbourhood quickly and widely, on foot and by car, asking people if they have seen them.",
        "At home, or at the spot they were last seen, leave water, a bowl of strong-smelling food and something with your scent, such as a worn piece of clothing. Many dogs retrace their steps.",
      ],
    },
    {
      titre: "If you spot them",
      points: [
        "Do not run toward them and do not shout. Crouch down, turn sideways, avoid staring into their eyes.",
        "Stay calm and speak in a soft voice. You can yawn or look away: these are calming signals they understand.",
        "Toss small pieces of smelly food to the side, never straight at them, and let them approach at their own pace.",
        "Better still: sit on the ground and wait. Curiosity and hunger work in your favour.",
      ],
    },
    {
      titre: "Drawing your dog back",
      points: [
        "Set up a feeding station where they were last seen, with a camera if possible.",
        "A dog in survival mode focuses on food, water and shelter: these anchor points bring them back.",
        "If someone sees them, above all ask them NOT to chase or call out: have them note the time and direction, and let you know.",
      ],
    },
    {
      titre: "Who to contact, fast",
      points: [
        "Without delay, alert animal services or the pound, shelters, the SPCA and veterinary clinics in your area, with a clear photo.",
        "A dog picked up by a passerby often ends up at the shelter or pound: go there in person.",
        "If your dog is microchipped, confirm your contact details are current in the registry.",
        "Share your animALERTE listing and post in your region's lost pet Facebook groups. Be sure to add \"DO NOT CHASE\" on your posters.",
      ],
    },
    {
      titre: "Mistakes to avoid",
      points: [
        "Chasing or calling out to them: it is the leading cause of accidents among lost dogs.",
        "Sending a crowd out to search: too many people scares them and pushes them farther away.",
        "Waiting before alerting shelters and animal services.",
        "Giving up. Many dogs are found after several days, sometimes far from home.",
      ],
    },
  ],
  cloture:
    "Keep hope, and keep your listing up to date. By staying calm and alerting the right people, you give yourself the best chance of bringing {nom} home. We are with you.",
  boutonFiche: "View my listing",
  signature: "The animALERTE team",
  piedLigne:
    "animALERTE, lost pet alerts across Quebec. Toll-free line: 1 833 999 AIDE.",
};

const CONSEILS: Record<Locale, Record<Espece, Conseils>> = {
  fr: { chat: CHAT_FR, chien: CHIEN_FR },
  en: { chat: CHAT_EN, chien: CHIEN_EN },
};

function remplacer(s: string, nom: string): string {
  return s.replaceAll("{nom}", nom);
}

function echapper(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Rendu texte brut (repli pour les clients sans HTML).
function versTexte(c: Conseils, nom: string, ficheUrl: string | null): string {
  const blocs = c.sections.map(
    (sec) =>
      `${sec.titre.toUpperCase()}\n` +
      sec.points.map((p) => `  • ${remplacer(p, nom)}`).join("\n"),
  );
  return [
    c.salutation,
    "",
    remplacer(c.intro, nom),
    "",
    remplacer(c.encadre, nom),
    "",
    blocs.join("\n\n"),
    "",
    remplacer(c.cloture, nom),
    ...(ficheUrl ? ["", `${c.boutonFiche} : ${ficheUrl}`] : []),
    "",
    c.signature,
    "",
    c.piedLigne,
  ].join("\n");
}

// Rendu HTML : styles en ligne (les clients courriel ignorent le CSS externe).
function versHtml(c: Conseils, nom: string, ficheUrl: string | null): string {
  const sections = c.sections
    .map(
      (sec) => `
      <tr><td style="padding:22px 32px 0;">
        <h2 style="margin:0 0 8px;font-size:17px;line-height:1.35;color:#08405c;font-weight:700;">${echapper(sec.titre)}</h2>
        <ul style="margin:0;padding:0 0 0 20px;color:#333;font-size:15px;line-height:1.6;">
          ${sec.points
            .map(
              (p) =>
                `<li style="margin:0 0 6px;">${echapper(remplacer(p, nom))}</li>`,
            )
            .join("")}
        </ul>
      </td></tr>`,
    )
    .join("");

  const bouton = ficheUrl
    ? `
      <tr><td style="padding:26px 32px 4px;">
        <a href="${ficheUrl}" style="display:inline-block;background:#ce1f2b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 26px;border-radius:999px;">${echapper(c.boutonFiche)}</a>
      </td></tr>`
    : "";

  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f9;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:#08405c;padding:20px 32px;">
          <span style="font-size:22px;font-weight:800;letter-spacing:-0.3px;color:#ffffff;">anim<span style="color:#ff6b74;">ALERTE</span></span>
        </td></tr>

        <tr><td style="padding:28px 32px 0;">
          <p style="margin:0 0 14px;font-size:15px;color:#333;">${echapper(c.salutation)}</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#333;">${echapper(remplacer(c.intro, nom))}</p>
        </td></tr>

        <tr><td style="padding:20px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbe6e7;border-left:4px solid #ce1f2b;border-radius:8px;">
            <tr><td style="padding:14px 18px;font-size:15px;line-height:1.55;color:#7a1119;font-weight:600;">${echapper(remplacer(c.encadre, nom))}</td></tr>
          </table>
        </td></tr>

        ${sections}

        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#333;">${echapper(remplacer(c.cloture, nom))}</p>
        </td></tr>

        ${bouton}

        <tr><td style="padding:24px 32px 28px;">
          <p style="margin:0;font-size:15px;color:#333;">${echapper(c.signature)}</p>
        </td></tr>

        <tr><td style="background:#f4f7f9;padding:16px 32px;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#7a8a95;">${echapper(c.piedLigne)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Envoie le bon courriel de conseils selon l'espèce et la langue. Silencieux si
// la clé Resend est absente ou en cas d'erreur : un courriel raté ne doit jamais
// empêcher la publication de l'annonce.
export async function envoyerConseilsPerdu(opts: {
  destinataire: string;
  espece: string;
  nomAnimal?: string | null;
  locale?: string;
  ficheUrl?: string | null;
}): Promise<void> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) return;

  const espece: Espece = opts.espece === "chat" ? "chat" : "chien";
  const locale: Locale = opts.locale === "en" ? "en" : "fr";
  const c = CONSEILS[locale][espece];
  const nom =
    opts.nomAnimal?.trim() || (locale === "en" ? "your pet" : "votre animal");
  const ficheUrl = opts.ficheUrl ?? null;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "animALERTE <noreply@animalerte.ca>",
        to: [opts.destinataire],
        subject: remplacer(c.sujet, nom),
        html: versHtml(c, nom, ficheUrl),
        text: versTexte(c, nom, ficheUrl),
      }),
    });
  } catch {
    // On n'échoue jamais l'action appelante à cause d'un courriel.
  }
}
