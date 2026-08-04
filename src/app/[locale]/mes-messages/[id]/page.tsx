import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { repondreProprietaire } from "@/lib/actions/messages";
import { FilMessages } from "@/components/fil-messages";

export default async function ConversationProprioPage({
  params,
}: PageProps<"/[locale]/mes-messages/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/connexion`);

  const admin = createAdminClient();
  const { data: conv } = await admin
    .from("conversations")
    .select("id, proprietaire_id, annonce_id")
    .eq("id", id)
    .single();
  if (!conv || conv.proprietaire_id !== user.id) {
    redirect(`/${locale}/mes-messages`);
  }

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
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const champ =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/mes-messages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
      >
        <IconArrowLeft size={16} />
        {t("retourBoite")}
      </Link>

      <h1 className="text-xl font-bold text-brand-dark">
        {t("conversationAuSujet", { nom })}
      </h1>
      <Link
        href={`/annonces/${conv.annonce_id}`}
        className="text-sm text-brand underline decoration-dotted"
      >
        {t("voirFiche")}
      </Link>

      <div className="mt-5">
        <FilMessages messages={messages ?? []} moi="proprietaire" />
      </div>

      <form
        action={repondreProprietaire}
        className="mt-6 flex flex-col gap-2 border-t border-border pt-4"
      >
        <input type="hidden" name="conversation" value={id} />
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
