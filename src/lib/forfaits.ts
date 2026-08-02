// Configuration partagée des forfaits (client + serveur).
// Ne rien importer de « server-only » ici : ce fichier est aussi lu côté client.

export const FORFAITS = ["gratuit", "locale", "regional", "provincial"] as const;
export type Forfait = (typeof FORFAITS)[number];

// Prix en cents CAD (paiement unique par annonce).
export const PRIX_CENTS: Record<Forfait, number> = {
  gratuit: 0,
  locale: 4999,
  regional: 14999,
  provincial: 24999,
};

// Nom du forfait pour le libellé Stripe.
export const NOMS: Record<Forfait, { fr: string; en: string }> = {
  gratuit: { fr: "Gratuit", en: "Free" },
  locale: { fr: "Alerte locale", en: "Local alert" },
  regional: { fr: "Alerte régionale", en: "Regional alert" },
  provincial: { fr: "Alerte provinciale", en: "Province-wide alert" },
};

// Ordre de puissance des forfaits (pour le déblocage des fonctions).
const RANG: Record<Forfait, number> = {
  gratuit: 0,
  locale: 1,
  regional: 2,
  provincial: 3,
};

export function estForfait(v: string | null | undefined): v is Forfait {
  return !!v && (FORFAITS as readonly string[]).includes(v);
}

export function forfaitAuMoins(
  forfait: string | null | undefined,
  minimum: Forfait,
): boolean {
  const f = estForfait(forfait) ? forfait : "gratuit";
  return RANG[f] >= RANG[minimum];
}

// Fonction payante → forfait minimum requis.
export const REQUIS = {
  affiche: "locale",
  reseaux: "regional",
  ligne: "locale",
  messagerie: "locale",
  flair: "regional",
  prioritaire: "regional",
  diffusionSAR: "provincial",
} as const satisfies Record<string, Forfait>;

export type FonctionPayante = keyof typeof REQUIS;

// L'annonce (via son forfait) donne-t-elle accès à cette fonction ?
export function peut(
  forfait: string | null | undefined,
  fonction: FonctionPayante,
): boolean {
  return forfaitAuMoins(forfait, REQUIS[fonction]);
}
