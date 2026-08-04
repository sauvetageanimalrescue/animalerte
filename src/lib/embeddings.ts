import "server-only";
import sharp from "sharp";

// flAIr étape 3 — empreinte visuelle d'une photo (embedding multimodal Voyage).
// On réduit l'image (assez pour l'empreinte, moins cher), on l'envoie à Voyage,
// et on récupère un vecteur qu'on rangera dans annonces.photo_embedding.
// Gardé par VOYAGE_API_KEY : renvoie null si la clé est absente ou en cas
// d'erreur, sans jamais faire échouer l'action appelante.
//
// NOTE : la forme exacte de la requête/réponse Voyage et les seuils de
// ressemblance sont à confirmer/ajuster une fois la clé en place.
export async function genererEmbedding(
  image: Buffer,
): Promise<number[] | null> {
  const cle = process.env.VOYAGE_API_KEY;
  if (!cle) return null;

  try {
    const jpeg = await sharp(image)
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const dataUrl = `data:image/jpeg;base64,${jpeg.toString("base64")}`;

    const res = await fetch("https://api.voyageai.com/v1/multimodalembeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "voyage-multimodal-3",
        inputs: [{ content: [{ type: "image_base64", image_base64: dataUrl }] }],
      }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: { embedding?: number[] }[];
    };
    const emb = json?.data?.[0]?.embedding;
    return Array.isArray(emb) && emb.length > 0 ? emb : null;
  } catch {
    return null;
  }
}
