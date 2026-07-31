"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resetMotDePasse, type EtatAuth } from "@/lib/actions/auth";

export function FormReset() {
  const t = useTranslations("auth");
  const [etat, formAction, pending] = useActionState<EtatAuth, FormData>(
    resetMotDePasse,
    {},
  );

  const champ =
    "rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-brand-dark">
        {t("reinitTitre")}
      </h1>
      <p className="mb-6 text-sm text-muted">{t("reinitInstruction")}</p>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("courriel")}
          <input name="courriel" type="email" required className={champ} />
        </label>

        {etat.erreur && (
          <p className="rounded-lg bg-perdu-soft px-3 py-2 text-sm text-perdu">
            {etat.erreur}
          </p>
        )}
        {etat.message && (
          <p className="rounded-lg bg-trouve-soft px-3 py-2 text-sm text-trouve">
            {etat.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {t("reinitEnvoyer")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/connexion"
          className="font-semibold text-brand hover:text-brand-dark"
        >
          {t("lienConnexion")}
        </Link>
      </p>
    </div>
  );
}
