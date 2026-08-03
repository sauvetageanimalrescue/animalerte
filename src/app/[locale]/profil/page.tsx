import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChampAdresse } from "@/components/champ-adresse";
import { ChampTelephone } from "@/components/champ-telephone";
import { modifierProfil } from "@/lib/actions/profil";

export default async function ProfilPage({
  params,
  searchParams,
}: PageProps<"/[locale]/profil">) {
  const { locale } = await params;
  const { ok } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/connexion`);

  const { data: profil } = await supabase
    .from("profiles")
    .select("nom, prenom, courriel, telephone, adresse")
    .eq("id", user.id)
    .single();

  const t = await getTranslations("profil");
  const tc = await getTranslations("commun");

  const champCls =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium text-foreground";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">{t("titre")}</h1>
      <p className="mt-1 text-sm text-muted">{t("sousTitre")}</p>

      {ok && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-800">
          {t("enregistre")}
        </p>
      )}

      <form action={modifierProfil} className="mt-6 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            {t("prenom")}
            <input
              name="prenom"
              defaultValue={profil?.prenom ?? ""}
              className={champCls}
            />
          </label>
          <label className={labelCls}>
            {t("nom")}
            <input
              name="nom"
              defaultValue={profil?.nom ?? ""}
              required
              className={champCls}
            />
          </label>
        </div>
        <label className={labelCls}>
          {t("courriel")}
          <input
            defaultValue={profil?.courriel ?? ""}
            disabled
            className={`${champCls} text-muted`}
          />
        </label>
        <label className={labelCls}>
          {t("telephone")}
          <ChampTelephone
            name="telephone"
            defaultValue={profil?.telephone ?? ""}
            className={champCls}
          />
        </label>
        <label className={labelCls}>
          {t("adresse")}
          <ChampAdresse
            name="adresse"
            defaultValue={profil?.adresse ?? ""}
            className={champCls}
          />
          <span className="mt-1 block text-xs text-muted">
            {t("adresseAide")}
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          {tc("enregistrer")}
        </button>
      </form>
    </div>
  );
}
