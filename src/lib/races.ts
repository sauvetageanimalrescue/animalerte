// Races par espèce (menu déroulant dépendant). Chaque race = un code stocké,
// avec ses libellés FR/EN pour la traduction et l'affiche bilingue.

export type Race = { code: string; fr: string; en: string };

export const RACES_CHAT: Race[] = [
  { code: "domestique_court", fr: "Domestique poil court", en: "Domestic shorthair" },
  { code: "domestique_long", fr: "Domestique poil long", en: "Domestic longhair" },
  { code: "abyssin", fr: "Abyssin", en: "Abyssinian" },
  { code: "american_shorthair", fr: "American shorthair", en: "American Shorthair" },
  { code: "angora_turc", fr: "Angora turc", en: "Turkish Angora" },
  { code: "bengal", fr: "Bengal", en: "Bengal" },
  { code: "birman", fr: "Sacré de Birmanie", en: "Birman" },
  { code: "bleu_russe", fr: "Bleu russe", en: "Russian Blue" },
  { code: "bombay", fr: "Bombay", en: "Bombay" },
  { code: "british_shorthair", fr: "British shorthair", en: "British Shorthair" },
  { code: "burmese", fr: "Burmese", en: "Burmese" },
  { code: "chartreux", fr: "Chartreux", en: "Chartreux" },
  { code: "cornish_rex", fr: "Cornish rex", en: "Cornish Rex" },
  { code: "devon_rex", fr: "Devon rex", en: "Devon Rex" },
  { code: "exotic_shorthair", fr: "Exotic shorthair", en: "Exotic Shorthair" },
  { code: "himalayen", fr: "Himalayen", en: "Himalayan" },
  { code: "maine_coon", fr: "Maine coon", en: "Maine Coon" },
  { code: "manx", fr: "Manx", en: "Manx" },
  { code: "munchkin", fr: "Munchkin", en: "Munchkin" },
  { code: "norvegien", fr: "Norvégien", en: "Norwegian Forest Cat" },
  { code: "oriental", fr: "Oriental", en: "Oriental" },
  { code: "persan", fr: "Persan", en: "Persian" },
  { code: "ragdoll", fr: "Ragdoll", en: "Ragdoll" },
  { code: "savannah", fr: "Savannah", en: "Savannah" },
  { code: "scottish_fold", fr: "Scottish fold", en: "Scottish Fold" },
  { code: "siamois", fr: "Siamois", en: "Siamese" },
  { code: "siberien", fr: "Sibérien", en: "Siberian" },
  { code: "somali", fr: "Somali", en: "Somali" },
  { code: "sphynx", fr: "Sphynx", en: "Sphynx" },
  { code: "tonkinois", fr: "Tonkinois", en: "Tonkinese" },
  { code: "turc_van", fr: "Turc de Van", en: "Turkish Van" },
  { code: "autre", fr: "Autre", en: "Other" },
];

export const RACES_CHIEN: Race[] = [
  { code: "croise", fr: "Croisé / mixte", en: "Mixed breed" },
  { code: "berger_allemand", fr: "Berger allemand", en: "German Shepherd" },
  { code: "berger_australien", fr: "Berger australien", en: "Australian Shepherd" },
  { code: "berger_belge", fr: "Berger belge", en: "Belgian Shepherd" },
  { code: "berger_shetland", fr: "Berger des Shetland", en: "Shetland Sheepdog" },
  { code: "bichon_frise", fr: "Bichon frisé", en: "Bichon Frise" },
  { code: "bichon_maltais", fr: "Bichon maltais", en: "Maltese" },
  { code: "border_collie", fr: "Border collie", en: "Border Collie" },
  { code: "boston_terrier", fr: "Boston terrier", en: "Boston Terrier" },
  { code: "bouledogue_anglais", fr: "Bouledogue anglais", en: "English Bulldog" },
  { code: "bouledogue_francais", fr: "Bouledogue français", en: "French Bulldog" },
  { code: "bouvier_bernois", fr: "Bouvier bernois", en: "Bernese Mountain Dog" },
  { code: "boxer", fr: "Boxer", en: "Boxer" },
  { code: "bulldog_americain", fr: "Bulldog américain", en: "American Bulldog" },
  { code: "caniche", fr: "Caniche", en: "Poodle" },
  { code: "carlin", fr: "Carlin", en: "Pug" },
  { code: "cavalier_king_charles", fr: "Cavalier King Charles", en: "Cavalier King Charles Spaniel" },
  { code: "chihuahua", fr: "Chihuahua", en: "Chihuahua" },
  { code: "cocker", fr: "Cocker spaniel", en: "Cocker Spaniel" },
  { code: "colley", fr: "Colley", en: "Collie" },
  { code: "dalmatien", fr: "Dalmatien", en: "Dalmatian" },
  { code: "doberman", fr: "Doberman", en: "Doberman" },
  { code: "dogue_allemand", fr: "Dogue allemand", en: "Great Dane" },
  { code: "epagneul_breton", fr: "Épagneul breton", en: "Brittany Spaniel" },
  { code: "golden_retriever", fr: "Golden retriever", en: "Golden Retriever" },
  { code: "husky", fr: "Husky sibérien", en: "Siberian Husky" },
  { code: "jack_russell", fr: "Jack Russell terrier", en: "Jack Russell Terrier" },
  { code: "labrador", fr: "Labrador", en: "Labrador Retriever" },
  { code: "labradoodle", fr: "Labradoodle", en: "Labradoodle" },
  { code: "levrier", fr: "Lévrier", en: "Greyhound" },
  { code: "malamute", fr: "Malamute d'Alaska", en: "Alaskan Malamute" },
  { code: "mastiff", fr: "Mastiff", en: "Mastiff" },
  { code: "pekinois", fr: "Pékinois", en: "Pekingese" },
  { code: "pinscher_nain", fr: "Pinscher nain", en: "Miniature Pinscher" },
  { code: "pitbull", fr: "Pitbull", en: "Pit Bull" },
  { code: "pomeranien", fr: "Loulou de Poméranie", en: "Pomeranian" },
  { code: "rottweiler", fr: "Rottweiler", en: "Rottweiler" },
  { code: "saint_bernard", fr: "Saint-bernard", en: "Saint Bernard" },
  { code: "samoyede", fr: "Samoyède", en: "Samoyed" },
  { code: "schnauzer", fr: "Schnauzer", en: "Schnauzer" },
  { code: "setter_irlandais", fr: "Setter irlandais", en: "Irish Setter" },
  { code: "shar_pei", fr: "Shar-peï", en: "Shar Pei" },
  { code: "shiba_inu", fr: "Shiba inu", en: "Shiba Inu" },
  { code: "shih_tzu", fr: "Shih tzu", en: "Shih Tzu" },
  { code: "teckel", fr: "Teckel", en: "Dachshund" },
  { code: "terre_neuve", fr: "Terre-Neuve", en: "Newfoundland" },
  { code: "vizsla", fr: "Vizsla", en: "Vizsla" },
  { code: "westie", fr: "Westie", en: "West Highland White Terrier" },
  { code: "yorkshire", fr: "Yorkshire terrier", en: "Yorkshire Terrier" },
  { code: "autre", fr: "Autre", en: "Other" },
];

export function racesPour(espece: string | null | undefined): Race[] {
  if (espece === "chat") return RACES_CHAT;
  if (espece === "chien") return RACES_CHIEN;
  return [];
}

// Nom d'une race à partir de son code. mode : "fr" | "en" | "bi" (bilingue).
export function nomRace(
  code: string | null | undefined,
  espece: string | null | undefined,
  mode: "fr" | "en" | "bi",
): string | null {
  if (!code) return null;
  const r = racesPour(espece).find((x) => x.code === code);
  if (!r) return code; // ancienne donnée en texte libre : on montre tel quel
  if (mode === "bi") return r.fr === r.en ? r.fr : `${r.fr} / ${r.en}`;
  return mode === "en" ? r.en : r.fr;
}
