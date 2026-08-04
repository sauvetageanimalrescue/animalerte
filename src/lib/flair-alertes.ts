import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreCorrespondance } from "@/lib/flair-jumelage";
import { forfaitAuMoins } from "@/lib/forfaits";
import type { Annonce } from "@/lib/types";

// flAIr — étape 2b : alertes proactives par courriel.
// Quand un nouveau « trouvé » est publié, on prévient les propriétaires des
// « perdus » Régionale+ qui correspondent. Quand un « perdu » passe en
// Régionale+, on lui envoie les « trouvés » déjà correspondants. Le jumelage
// réutilise le moteur de score ; l'envoi passe par Resend (comme le contact).

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://animalerte.ca";

async function envoyerCourriel(
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
    // On n'échoue jamais l'action appelante à cause d'un courriel.
  }
}

// Marque la paire (perdu, trouvé) comme alertée. Renvoie true SEULEMENT si
// l'insertion est nouvelle (dédoublonnage atomique via la contrainte d'unicité).
async function marquerSiNouveau(
  admin: ReturnType<typeof createAdminClient>,
  perduId: string,
  trouveId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("flair_alertes")
    .upsert(
      { perdu_id: perduId, trouve_id: trouveId },
      { onConflict: "perdu_id,trouve_id", ignoreDuplicates: true },
    )
    .select("id");
  return !!data && data.length > 0;
}

function corpsCourriel(nomAnimal: string, trouves: Annonce[]): string {
  const lignes = trouves
    .map(
      (tr) =>
        `- ${tr.ville} (${tr.date_evenement}) : ${BASE}/fr/annonces/${tr.id}`,
    )
    .join("\n");
  const intro =
    trouves.length > 1
      ? "des animaux trouvés qui pourraient correspondre"
      : "un animal trouvé qui pourrait correspondre";
  return `Bonjour,

flAIr a repéré ${intro} à ${nomAnimal}, votre signalement sur animALERTE.

${lignes}

Vérifiez vous-même s'il s'agit bien de votre animal. Pour joindre la personne en toute confidentialité, utilisez la ligne 1 833 999 AIDE indiquée sur la fiche.

Ce n'est pas votre animal ? Aucune action requise, flAIr continue de surveiller les nouveaux signalements.

— L'équipe animALERTE`;
}

// Un nouveau « trouvé » vient d'être publié : prévenir les « perdus » Régionale+
// qui correspondent.
export async function alerterPourNouveauTrouve(
  trouveId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data: trouve } = await admin
    .from("annonces")
    .select("*")
    .eq("id", trouveId)
    .single();
  if (!trouve || trouve.type !== "trouve" || trouve.statut !== "actif") return;

  const { data: perdus } = await admin
    .from("annonces")
    .select("*")
    .eq("type", "perdu")
    .eq("statut", "actif")
    .eq("espece", trouve.espece)
    .in("forfait", ["regional", "provincial"])
    .eq("paye", true)
    .limit(500);

  for (const perdu of (perdus ?? []) as Annonce[]) {
    if (!perdu.contact_courriel) continue;
    if (!scoreCorrespondance(perdu, trouve as Annonce)) continue;
    if (!(await marquerSiNouveau(admin, perdu.id, trouve.id))) continue;
    const nom = perdu.nom_animal || "votre animal";
    await envoyerCourriel(
      perdu.contact_courriel,
      `flAIr a repéré une piste pour ${nom}`,
      corpsCourriel(nom, [trouve as Annonce]),
    );
  }
}

// Un « perdu » vient de passer en Régionale+ : lui envoyer les « trouvés » déjà
// correspondants (regroupés en un seul courriel).
export async function alerterPourPerdu(perduId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: perdu } = await admin
    .from("annonces")
    .select("*")
    .eq("id", perduId)
    .single();
  if (!perdu || perdu.type !== "perdu" || perdu.statut !== "actif") return;
  if (!forfaitAuMoins(perdu.forfait, "regional")) return;
  if (!perdu.contact_courriel) return;

  const { data: trouves } = await admin
    .from("annonces")
    .select("*")
    .eq("type", "trouve")
    .eq("statut", "actif")
    .eq("espece", perdu.espece)
    .limit(500);

  const nouveaux: Annonce[] = [];
  for (const trouve of (trouves ?? []) as Annonce[]) {
    if (!scoreCorrespondance(perdu as Annonce, trouve)) continue;
    if (await marquerSiNouveau(admin, perdu.id, trouve.id)) nouveaux.push(trouve);
  }
  if (nouveaux.length === 0) return;

  const nom = perdu.nom_animal || "votre animal";
  await envoyerCourriel(
    perdu.contact_courriel,
    `flAIr a repéré ${nouveaux.length > 1 ? "des pistes" : "une piste"} pour ${nom}`,
    corpsCourriel(nom, nouveaux),
  );
}
