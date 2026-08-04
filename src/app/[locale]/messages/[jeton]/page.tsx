import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { repondreTrouveur } from "@/lib/actions/messages";
import { FilMessages } from "@/components/fil-messages";

export default async function ConversationTrouveurPage({
  params,
}: PageProps<"/[locale]/messages/[jeton]">) {
  const { locale, jeton } = await params;
  setRequestLocale(locale);

  const admin = createAdminClient();
  const { data: conv } = await admin
    .from("conversations")
    .select("id, annonce_id")
    .eq("trouveur_jeton", jeton)
    .maybeSingle();
  if (!conv) notFound();

  const [t, tE] = await Promise.all([
    getTranslations("messages"),
    getTranslations("especes"),
  ]);
  const { data: annonce } = await admin
    .from("annonces")
    .select("nom_animal, espece")
    .eq("id", conv.annonce_id)
    .single();
  const nom = annonce?.nom_animal || (annonce ? tE(annonce.espece) : "");

  const { data: messages } = await admin
    .from("messages")
    .select("id, expediteur, corps, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  const champ =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold text-brand-dark">
        {t("conversationAuSujet", { nom })}
      </h1>
      <Link
        href={`/annonces/${conv.annonce_id}`}
        className="text-sm text-brand underline decoration-dotted"
      >
        {t("voirFiche")}
      </Link>
      <p className="mt-1 text-xs text-muted">{t("lienPrive")}</p>

      <div className="mt-5">
        <FilMessages messages={messages ?? []} moi="trouveur" />
      </div>

      <form
        action={repondreTrouveur}
        className="mt-6 flex flex-col gap-2 border-t border-border pt-4"
      >
        <input type="hidden" name="jeton" value={jeton} />
        <textarea
          name="message"
          required
          rows={3}
          maxLength={4000}
          className={champ}
          placeholder={t("placeholderReponse")}
        />
        <button
          type="submit"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          {t("envoyerReponse")}
        </button>
      </form>
    </div>
  );
}
