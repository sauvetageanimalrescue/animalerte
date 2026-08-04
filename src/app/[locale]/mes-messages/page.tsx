import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconMessage } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { formaterDate } from "@/lib/format";

export default async function MesMessagesPage({
  params,
}: PageProps<"/[locale]/mes-messages">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/connexion`);

  const [t, tE] = await Promise.all([
    getTranslations("messages"),
    getTranslations("especes"),
  ]);

  const admin = createAdminClient();
  const { data: convs } = await admin
    .from("conversations")
    .select("id, annonce_id, dernier_message_at, dernier_message_par")
    .eq("proprietaire_id", user.id)
    .order("dernier_message_at", { ascending: false });

  const conversations = convs ?? [];
  // Noms des animaux pour l'affichage.
  const ids = [...new Set(conversations.map((c) => c.annonce_id))];
  const { data: annonces } = ids.length
    ? await admin
        .from("annonces")
        .select("id, nom_animal, espece")
        .in("id", ids)
    : { data: [] };
  const nomPar = new Map(
    (annonces ?? []).map((a) => [a.id, a.nom_animal || tE(a.espece)]),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-dark">
        <IconMessage size={22} className="text-brand" />
        {t("boiteTitre")}
      </h1>

      {conversations.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          {t("boiteVide")}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {conversations.map((c) => {
            const nouveau = c.dernier_message_par === "trouveur";
            return (
              <li key={c.id}>
                <Link
                  href={`/mes-messages/${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-brand"
                >
                  <div>
                    <p className="font-semibold text-brand-dark">
                      {nomPar.get(c.annonce_id) ?? t("laFamille")}
                    </p>
                    <p className="text-xs text-muted">
                      {formaterDate(c.dernier_message_at, locale)}
                    </p>
                  </div>
                  {nouveau && (
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
                      {t("nouveau")}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
