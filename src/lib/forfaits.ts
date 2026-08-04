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

// Nombre TOTAL de photos autorisées selon le forfait (photo principale
// comprise). Les extras = ce nombre moins 1.
export const MAX_PHOTOS: Record<Forfait, number> = {
  gratuit: 1,
  locale: 2,
  regional: 3,
  provincial: 4,
};

export function estForfait(v: string | null | undefined): v is Forfait {
  return !!v && (FORFAITS as readonly string[]).includes(v);
}

export function nbPhotosMax(forfait: string | null | undefined): number {
  return MAX_PHOTOS[estForfait(forfait) ? forfait : "gratuit"];
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
  // La messagerie anonyme est offerte dès le forfait Gratuit : c'est le canal
  // de contact de base, indispensable pour réunir un animal avec sa famille.
  // Seule la ligne téléphonique sans frais reste réservée aux forfaits payants.
  messagerie: "gratuit",
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

// ── Mise à niveau de forfait ────────────────────────────────────────────────
// Règle : le premier passage Gratuit → payant est possible à tout moment (plein
// prix). La montée d'un forfait payant vers un supérieur (paiement de la
// différence) n'est possible que dans les 24 h suivant le paiement du forfait
// en cours ; elle redémarre les 7 jours de priorité.
export const FENETRE_MAJ_MS = 24 * 60 * 60 * 1000;

export type OptionForfait = {
  forfait: Forfait;
  prixCents: number; // plein prix (1er paiement) OU différence (mise à niveau)
  estMaj: boolean;
};

export function optionsPaiement(a: {
  forfait: string | null | undefined;
  paye: boolean | null | undefined;
  paye_at: string | null | undefined;
}): { fenetreMajExpiree: boolean; options: OptionForfait[] } {
  const actuel: Forfait = estForfait(a.forfait) ? a.forfait : "gratuit";
  const aPayant = a.paye === true && actuel !== "gratuit";

  // Pas encore payé : tous les paliers payants, plein prix, sans limite de temps.
  if (!aPayant) {
    const options = FORFAITS.filter((f) => f !== "gratuit").map((f) => ({
      forfait: f,
      prixCents: PRIX_CENTS[f],
      estMaj: false,
    }));
    return { fenetreMajExpiree: false, options };
  }

  // Déjà payant : mise à niveau vers un palier supérieur, dans les 24 h.
  const superieurs = FORFAITS.filter((f) => RANG[f] > RANG[actuel]);
  const t = a.paye_at ? Date.parse(a.paye_at) : NaN;
  const ouverte = Number.isFinite(t) && Date.now() - t < FENETRE_MAJ_MS;
  if (!ouverte || superieurs.length === 0) {
    return { fenetreMajExpiree: superieurs.length > 0, options: [] };
  }
  const options = superieurs.map((f) => ({
    forfait: f,
    prixCents: PRIX_CENTS[f] - PRIX_CENTS[actuel],
    estMaj: true,
  }));
  return { fenetreMajExpiree: false, options };
}

// Formate un montant en cents CAD selon la locale (« 100,00 $ » / « $100.00 »).
export function formatPrixCents(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-CA" : "fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}
