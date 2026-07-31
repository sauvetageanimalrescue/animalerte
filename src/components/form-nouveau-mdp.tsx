"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { definirMotDePasse, type EtatAuth } from "@/lib/actions/auth";

export function FormNouveauMotDePasse() {
  const t = useTranslations("auth");
  const [etat, formAction, pending] = useActionState<EtatAuth, FormData>(
    definirMotDePasse,
    {},
  );

  const champ =
    "rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        {t("definirTitre")}
      </h1>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("nouveauMotDePasse")}
          <input
            name="motDePasse"
            type="password"
            required
            minLength={6}
            className={champ}
          />
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

        {etat.message ? (
          <Link
            href="/connexion"
            className="rounded-full bg-brand px-4 py-2.5 text-center font-semibold text-white transition hover:bg-brand-dark"
          >
            {t("seConnecter")}
          </Link>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {t("definirBouton")}
          </button>
        )}
      </form>
    </div>
  );
}
