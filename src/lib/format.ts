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
