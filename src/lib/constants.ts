// Valeurs du domaine partagées entre le formulaire, les filtres et la BD.
// Les libellés affichés sont traduits via next-intl (clés `especes.*`, etc.).

export const TYPES_ANNONCE = ["perdu", "trouve"] as const;
export type TypeAnnonce = (typeof TYPES_ANNONCE)[number];

export const STATUTS_ANNONCE = ["actif", "resolu"] as const;
export type StatutAnnonce = (typeof STATUTS_ANNONCE)[number];

export const ESPECES = [
  "chien",
  "chat",
  "oiseau",
  "lapin",
  "rongeur",
  "reptile",
  "autre",
] as const;
export type Espece = (typeof ESPECES)[number];

export const SEXES = ["male", "femelle", "inconnu"] as const;
export type Sexe = (typeof SEXES)[number];

// Provinces et territoires du Canada (code ISO officiel).
export const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
] as const;
export type Province = (typeof PROVINCES)[number];
