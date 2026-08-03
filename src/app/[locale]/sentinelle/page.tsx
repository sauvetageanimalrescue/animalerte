import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconUsers, IconCheck } from "@tabler/icons-react";
import { ChampVille } from "@/components/champ-ville";
import { ChampTelephone } from "@/components/champ-telephone";
import { inscrireSentinelle } from "@/lib/actions/sentinelle";

export default async function SentinellePage({
  params,
  searchParams,
}: PageProps<"/[locale]/sentinelle">) {
  const { locale } = await params;
  const { ok } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("sentinelle");

  const champCls =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium text-foreground";

  if (ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-trouve-soft text-trouve">
          <IconCheck size={30} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-brand-dark">{t("merci")}</h1>
        <p className="mt-2 text-muted">{t("merciTexte")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <IconUsers size={22} />
        </div>
        <h1 className="text-2xl font-bold text-brand-dark">{t("titre")}</h1>
      </div>
      <p className="mt-2 text-muted">{t("sousTitre")}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">{t("intro")}</p>

      <form action={inscrireSentinelle} className="mt-6 flex flex-col gap-4">
        <label className={labelCls}>
          {t("nom")}
          <input name="nom" required className={champCls} />
        </label>
        <label className={labelCls}>
          {t("courriel")}
          <input name="courriel" type="email" required className={champCls} />
        </label>
        <label className={labelCls}>
          {t("telephone")}
          <ChampTelephone name="telephone" className={champCls} />
        </label>
        <label className={labelCls}>
          {t("ville")}
          <ChampVille
            name="ville"
            latName="ville_lat"
            lngName="ville_lng"
            required
            className={champCls}
          />
          <span className="mt-1 block text-xs text-muted">{t("villeAide")}</span>
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          {t("cta")}
        </button>
      </form>
    </div>
  );
}
