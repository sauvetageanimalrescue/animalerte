"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { envoyerContact, type EtatContact } from "@/lib/actions/contact";

export function ContactForm() {
  const t = useTranslations("contact");
  const [etat, formAction, pending] = useActionState<EtatContact, FormData>(
    envoyerContact,
    {},
  );

  const champ =
    "rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";
  const label = "flex flex-col gap-1 text-sm font-medium text-muted";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-dark">{t("titre")}</h1>
      <p className="mt-2 text-muted">{t("sousTitre")}</p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <label className={label}>
          <span>
            {t("nom")} <span className="text-accent">*</span>
          </span>
          <input name="nom" type="text" required className={champ} />
        </label>
        <label className={label}>
          <span>
            {t("courriel")} <span className="text-accent">*</span>
          </span>
          <input name="courriel" type="email" required className={champ} />
        </label>
        <label className={label}>
          {t("sujet")}
          <input name="sujet" type="text" className={champ} />
        </label>
        <label className={label}>
          <span>
            {t("message")} <span className="text-accent">*</span>
          </span>
          <textarea name="message" rows={6} required className={champ} />
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
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? t("envoi") : t("envoyer")}
        </button>
      </form>
    </div>
  );
}
