import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Traduction automatique de courts textes libres saisis par l'utilisateur
// (signes distinctifs, accessoires...). Sert à ce que la légende bilingue des
// réseaux sociaux ne laisse pas de texte d'une langue dans le bloc de l'autre :
// « grand chat museau rose » saisi en français doit apparaître en anglais dans
// le bloc anglais. On rend chaque texte dans les DEUX langues (le modèle détecte
// la langue source). Modèle bon marché (Haiku), silencieux si la clé est absente
// ou en cas d'erreur : on retombe alors sur le texte original.

export type Bilingue = { fr: string; en: string };

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          fr: { type: "string" },
          en: { type: "string" },
        },
        required: ["fr", "en"],
      },
    },
  },
  required: ["items"],
} as const;

// Renvoie, pour chaque texte, sa version française et anglaise (même ordre).
// null si la traduction n'est pas disponible (clé absente, erreur, ou réponse
// incohérente) : l'appelant retombe sur le texte original.
export async function traduireBilingue(
  textes: string[],
): Promise<Bilingue[] | null> {
  if (!process.env.ANTHROPIC_API_KEY || textes.length === 0) return null;

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: `Tu traduis de courts textes qui décrivent un animal de compagnie perdu ou trouvé (signes distinctifs, collier ou accessoires), saisis par une personne dans une langue quelconque. Pour CHAQUE texte, donne sa version française naturelle et sa version anglaise naturelle, dans le MÊME ordre que la liste. Traduis fidèlement, sans rien ajouter ni retirer et sans commentaire. Si un texte est déjà dans la langue voulue, reprends-le tel quel.

Textes :
${textes.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
        },
      ],
    });

    const bloc = message.content.find((b) => b.type === "text");
    if (!bloc || bloc.type !== "text") return null;
    const parsed = JSON.parse(bloc.text) as { items?: Bilingue[] };
    if (!parsed.items || parsed.items.length !== textes.length) return null;
    return parsed.items;
  } catch {
    return null;
  }
}
