"use server";

// flAIr — lecture d'une photo pour pré-remplir les attributs de l'animal.
// Prototype de l'étape 1 : la vision de Claude « lit » le visage et remplit un
// formulaire dont le vocabulaire est limité aux CODES exacts de nos menus
// (sortie structurée). Le modèle ne peut donc renvoyer que des valeurs valides.
// Le jumelage (comparer perdu ↔ trouvé) viendra dans une étape ultérieure.

import Anthropic from "@anthropic-ai/sdk";
import { COULEURS, YEUX } from "@/lib/champs";
import { RACES_CHAT, RACES_CHIEN, racesPour } from "@/lib/races";
import { getCurrentUser } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

// Nombre maximal d'analyses flAIr par compte et par jour. Plafonne le coût API
// et bloque l'abus automatisé, sans gêner un usage normal (une famille publie
// rarement plus de quelques animaux).
const LIMITE_JOUR = 10;

export type AttributsFlair = {
  espece: string;
  race: string;
  couleur: string;
  couleur_yeux: string;
  signes_distinctifs: string;
  note: string;
};

// Rectangle du visage/tête de l'animal, en pourcentages de l'image (0 à 100).
// Sert au recadrage automatique. null si flAIr ne localise pas la tête.
export type CadreFlair = {
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
};

export type ResultatFlair =
  | { ok: true; attributs: AttributsFlair; cadre: CadreFlair | null }
  | { ok: false; erreur: "cle_absente" | "connexion" | "limite" | "analyse" };

type BrutFlair = AttributsFlair & {
  cadre?: {
    present: boolean;
    x: number;
    y: number;
    largeur: number;
    hauteur: number;
  };
};

// Vocabulaire autorisé : tous les codes de race (chat + chien), dédupliqués.
const RACE_CODES = Array.from(
  new Set([...RACES_CHAT, ...RACES_CHIEN].map((r) => r.code)),
);

// Schéma de sortie structurée : chaque champ n'accepte que nos codes, plus la
// valeur vide "" qui signifie « pas certain » (elle correspond à l'option « — »
// des menus). additionalProperties:false + required : exigés par la sortie JSON.
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    espece: { type: "string", enum: ["chien", "chat", ""] },
    race: { type: "string", enum: [...RACE_CODES, ""] },
    couleur: { type: "string", enum: [...COULEURS, ""] },
    couleur_yeux: { type: "string", enum: [...YEUX, ""] },
    signes_distinctifs: { type: "string" },
    note: { type: "string" },
    cadre: {
      type: "object",
      additionalProperties: false,
      properties: {
        present: { type: "boolean" },
        x: { type: "integer" },
        y: { type: "integer" },
        largeur: { type: "integer" },
        hauteur: { type: "integer" },
      },
      required: ["present", "x", "y", "largeur", "hauteur"],
    },
  },
  required: [
    "espece",
    "race",
    "couleur",
    "couleur_yeux",
    "signes_distinctifs",
    "note",
    "cadre",
  ],
} as const;

const CONSIGNE = `Tu es flAIr, l'assistant de reconnaissance d'animaux d'animALERTE. On te montre la photo d'un chien ou d'un chat perdu ou trouvé. Remplis le formulaire d'attributs à partir de ce que tu VOIS sur la photo, sans rien inventer.

Règles :
- Utilise uniquement les codes proposés. Si tu n'es pas raisonnablement certain d'un champ, mets la valeur vide "".
- "race" doit correspondre à l'espèce choisie. Pour un chien de type croisé, utilise "croise" ; pour un chat sans race pure évidente, utilise "domestique_court" ou "domestique_long" selon la longueur du poil.
- "couleur" : la couleur ou le motif dominant du pelage sur le visage et le corps visible.
- "couleur_yeux" : seulement si les yeux sont bien visibles, sinon "".
- "signes_distinctifs" : une courte phrase en français décrivant les marques distinctives visibles (tache, collier de couleur, oreille pliée, etc.), ou "" s'il n'y en a pas de notable.
- "note" : une seule phrase en français résumant ce que tu as reconnu.
- "cadre" : le rectangle qui entoure la TÊTE et le visage de l'animal, exprimé en pourcentages de l'image — x = distance du bord gauche, y = distance du bord haut, largeur et hauteur du rectangle, chacun entre 0 et 100. Encadre bien la tête au complet (oreilles comprises). Mets "present" à true seulement si tu localises clairement la tête sur la photo ; sinon "present" à false et des zéros.`;

export async function analyserPhotoFlair(
  base64: string,
  mediaType: string,
): Promise<ResultatFlair> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, erreur: "cle_absente" };
  }

  // Connexion obligatoire : flAIr n'est pas ouvert au public anonyme.
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, erreur: "connexion" };
  }

  // Limite par compte et par jour (anti-abus + protection du coût). On vérifie
  // AVANT l'appel API, et on journalise la tentative pour qu'un retry en boucle
  // compte lui aussi dans le quota.
  const admin = createAdminClient();
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("flair_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", debutJour.toISOString());
  if ((count ?? 0) >= LIMITE_JOUR) {
    return { ok: false, erreur: "limite" };
  }
  await admin.from("flair_analyses").insert({ user_id: user.id });

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg",
                data: base64,
              },
            },
            { type: "text", text: CONSIGNE },
          ],
        },
      ],
    });

    const bloc = message.content.find((b) => b.type === "text");
    if (!bloc || bloc.type !== "text") {
      return { ok: false, erreur: "analyse" };
    }
    const brut = JSON.parse(bloc.text) as BrutFlair;

    // Filet de sécurité : la race doit appartenir à l'espèce reconnue.
    const racesValides = racesPour(brut.espece).map((r) => r.code);
    const race = racesValides.includes(brut.race) ? brut.race : "";

    // Cadre du visage : uniquement si localisé et de taille plausible. Le
    // recadrage lui-même (avec ses garde-fous anti-agrandissement) se fait
    // côté client, qui connaît la résolution réelle de la photo.
    const c = brut.cadre;
    const cadre =
      c && c.present && c.largeur > 3 && c.hauteur > 3
        ? { x: c.x, y: c.y, largeur: c.largeur, hauteur: c.hauteur }
        : null;

    return {
      ok: true,
      attributs: {
        espece: brut.espece ?? "",
        race,
        couleur: brut.couleur ?? "",
        couleur_yeux: brut.couleur_yeux ?? "",
        signes_distinctifs: brut.signes_distinctifs ?? "",
        note: brut.note ?? "",
      },
      cadre,
    };
  } catch {
    return { ok: false, erreur: "analyse" };
  }
}
