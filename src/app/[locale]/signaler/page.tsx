import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/authz";
import { FormulaireAnnonce } from "@/components/formulaire-annonce";

function premier(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function SignalerPage({
  params,
  searchParams,
}: PageProps<"/[locale]/signaler">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect({ href: "/connexion", locale });

  const profil = await getCurrentProfile();
  const sp = await searchParams;
  const type = premier(sp.type) === "trouve" ? "trouve" : "perdu";

  return (
    <FormulaireAnnonce
      defaultType={type}
      contact={{
        nom: profil?.nom ?? "",
        courriel: profil?.courriel ?? user?.email ?? "",
        telephone: profil?.telephone ?? "",
      }}
    />
  );
}
