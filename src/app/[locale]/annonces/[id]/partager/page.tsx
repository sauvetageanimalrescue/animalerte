import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { obtenirAnnonce } from "@/lib/annonces";
import { genererLegende } from "@/lib/affiche/legende";
import { BoutonCopier } from "@/components/bouton-copier";

export default async function PartagerPage({
  params,
}: PageProps<"/[locale]/annonces/[id]/partager">) {
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

  const [t, tE] = await Promise.all([
    getTranslations("partager"),
    getTranslations("especes"),
  ]);
  const nom = annonce.nom_animal || tE(annonce.espece);

  const h = await headers();
  const host = h.get("host") ?? "animalerte.ca";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const legende = await genererLegende(annonce, `${proto}://${host}`);

  const carte =
    "rounded-2xl border border-border bg-surface p-4 text-center";
  const bouton =
    "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition hover:brightness-95";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-dark">
        {t("titre", { nom })}
      </h1>
      <p className="mt-1 text-muted">{t("instructions")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={carte}>
          <div className="mb-3 text-left font-semibold text-brand-dark">
            {t("carre")}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/carre/${annonce.id}`}
            alt=""
            className="mx-auto h-[340px] w-auto rounded-xl"
          />
          <a href={`/api/carre/${annonce.id}`} download className={bouton}>
            {t("telechargerCarre")}
          </a>
        </div>

        <div className={carte}>
          <div className="mb-3 text-left font-semibold text-brand-dark">
            {t("story")}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/story/${annonce.id}`}
            alt=""
            className="mx-auto h-[340px] w-auto rounded-xl"
          />
          <a href={`/api/story/${annonce.id}`} download className={bouton}>
            {t("telechargerStory")}
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="font-semibold text-brand-dark">{t("legende")}</div>
          <BoutonCopier
            texte={legende}
            labelCopier={t("copier")}
            labelCopie={t("copie")}
          />
        </div>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-brand-soft/30 p-4 text-sm leading-relaxed text-foreground">
          {legende}
        </pre>
      </div>

      <p className="mt-4 text-sm text-muted">{t("noteInstagram")}</p>
    </div>
  );
}
