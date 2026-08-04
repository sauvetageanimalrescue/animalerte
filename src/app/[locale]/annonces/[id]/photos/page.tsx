import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { nbPhotosMax } from "@/lib/forfaits";
import { GestionPhotos } from "@/components/gestion-photos";

export default async function PhotosPage({
  params,
}: PageProps<"/[locale]/annonces/[id]/photos">) {
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
  // Les photos supplémentaires demandent un forfait qui en autorise plus d'une.
  if (nbPhotosMax(annonce.forfait) <= 1) {
    redirect(`/${locale}/annonces/${id}/forfait`);
  }

  const [t, tE] = await Promise.all([
    getTranslations("photos"),
    getTranslations("especes"),
  ]);
  const nom = annonce.nom_animal || tE(annonce.espece);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/annonces/${annonce.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
      >
        <IconArrowLeft size={16} />
        {t("retour")}
      </Link>

      <h1 className="text-2xl font-bold text-brand-dark">
        {t("titre", { nom })}
      </h1>
      <p className="mt-1 text-muted">{t("intro")}</p>

      <div className="mt-6">
        <GestionPhotos
          id={annonce.id}
          photoUrl={annonce.photo_url}
          photos={annonce.photos ?? []}
          max={nbPhotosMax(annonce.forfait)}
        />
      </div>
    </div>
  );
}
