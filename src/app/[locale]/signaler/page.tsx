import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconAlertTriangle, IconHeartHandshake } from "@tabler/icons-react";
import { Link, redirect } from "@/i18n/navigation";
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

  const sp = await searchParams;
  const type = premier(sp.type);

  // Aucun type choisi : on affiche l'écran de choix (perdu / trouvé).
  if (type !== "perdu" && type !== "trouve") {
    const [tf, ta] = await Promise.all([
      getTranslations("formulaire"),
      getTranslations("accueil"),
    ]);
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-dark">
          {tf("choixTitre")}
        </h1>
        <div className="mt-8 flex flex-col gap-4">
          <Link
            href="/signaler?type=perdu"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-semibold text-white transition hover:brightness-95"
          >
            <IconAlertTriangle size={20} />
            {ta("signalerPerduCta")}
          </Link>
          <Link
            href="/signaler?type=trouve"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-trouve px-6 py-4 font-semibold text-white transition hover:brightness-95"
          >
            <IconHeartHandshake size={20} />
            {ta("signalerTrouveCta")}
          </Link>
        </div>
      </div>
    );
  }

  const profil = await getCurrentProfile();
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
