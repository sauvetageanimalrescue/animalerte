"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { connexion, inscription, type EtatAuth } from "@/lib/actions/auth";
import { ChampTelephone } from "@/components/champ-telephone";

export function AuthForm({ mode }: { mode: "connexion" | "inscription" }) {
  const t = useTranslations("auth");
  const action = mode === "connexion" ? connexion : inscription;
  const [etat, formAction, pending] = useActionState<EtatAuth, FormData>(
    action,
    {},
  );

  const champ =
    "rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        {mode === "connexion" ? t("connexionTitre") : t("inscriptionTitre")}
      </h1>

      <form action={formAction} className="flex flex-col gap-4">
        {mode === "inscription" && (
          <>
            <label className="flex flex-col gap-1 text-sm font-medium text-muted">
              {t("nom")}
              <input name="nom" type="text" required className={champ} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-muted">
              {t("telephone")}
              <ChampTelephone name="telephone" className={champ} />
            </label>
          </>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("courriel")}
          <input name="courriel" type="email" required className={champ} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-muted">
          {t("motDePasse")}
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

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {mode === "connexion" ? t("seConnecter") : t("sInscrire")}
        </button>

        {mode === "connexion" && (
          <>
            <Link
              href="/inscription"
              className="rounded-full bg-brand-light px-4 py-2.5 text-center font-semibold text-white transition hover:brightness-95"
            >
              {t("lienInscription")}
            </Link>
            <Link
              href="/mot-de-passe-oublie"
              className="text-center text-sm text-muted hover:text-brand-dark"
            >
              {t("oubliMotDePasse")}
            </Link>
          </>
        )}
      </form>

      {mode === "inscription" && (
        <p className="mt-6 text-center text-sm text-muted">
          {t("dejaCompte")}{" "}
          <Link
            href="/connexion"
            className="font-semibold text-brand hover:text-brand-dark"
          >
            {t("lienConnexion")}
          </Link>
        </p>
      )}
    </div>
  );
}
