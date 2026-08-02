// Ne garde que le nom de la rue d'une adresse Google (retire le numéro civique
// et les segments après la première virgule) pour l'affichage public :
// « 731 Boulevard Cadieux, Beauharnois, QC » → « Boulevard Cadieux ».
export function nomDeRue(adresse: string | null | undefined): string | null {
  if (!adresse) return null;
  const premier = adresse.split(",")[0].trim();
  const sansNumero = premier.replace(/^\d+\s*/, "").trim();
  return sansNumero || premier;
}

// Formatage de date : « jj/mm/aaaa » en français (fr-FR), « aaaa-mm-jj » en
// anglais canadien (en-CA). Accepte une date ISO (YYYY-MM-DD) ou un timestamp.
export function formaterDate(iso: string, locale: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
