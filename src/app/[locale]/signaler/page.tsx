import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { IconAlertTriangle, IconHeartHandshake } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
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
  if (!user) redirect(`/${locale}/connexion`);

  const sp = await searchParams;
  const type = premier(sp.type);

  // Sans type précis : écran de choix (deux cartes).
  if (type !== "perdu" && type !== "trouve") {
    const [tf, ta] = await Promise.all([
      getTranslations("formulaire"),
      getTranslations("accueil"),
    ]);
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-center text-2xl font-bold text-brand-dark">
          {tf("choixTitre")}
        </h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/signaler?type=perdu"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center transition hover:border-accent hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <IconAlertTriangle size={28} />
            </div>
            <span className="font-semibold text-brand-dark">
              {ta("signalerPerduCta")}
            </span>
          </Link>
          <Link
            href="/signaler?type=trouve"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center transition hover:border-trouve hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-trouve-soft text-trouve">
              <IconHeartHandshake size={28} />
            </div>
            <span className="font-semibold text-brand-dark">
              {ta("signalerTrouveCta")}
            </span>
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
        courriel: profil?.courriel ?? user.email ?? "",
        telephone: profil?.telephone ?? "",
      }}
    />
  );
}
