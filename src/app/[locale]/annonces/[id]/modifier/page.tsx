import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { FormulaireAnnonce } from "@/components/formulaire-annonce";

export default async function ModifierAnnoncePage({
  params,
}: PageProps<"/[locale]/annonces/[id]/modifier">) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/connexion`);

  const annonce = await obtenirAnnonce(id);
  if (!annonce || annonce.user_id !== user.id) {
    redirect(`/${locale}/annonces/${id}`);
  }

  return (
    <FormulaireAnnonce
      defaultType={annonce.type as "perdu" | "trouve"}
      contact={{ nom: "", courriel: "", telephone: "" }}
      initial={annonce}
    />
  );
}
