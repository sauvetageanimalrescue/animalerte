"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { IconMessage, IconCheck } from "@tabler/icons-react";
import {
  demarrerConversation,
  type EtatContact,
} from "@/lib/actions/messages";

// Formulaire de contact anonyme sur la fiche. Le trouveur laisse un message et
// son courriel (qui reste chez animALERTE) ; il reçoit un lien privé pour
// suivre la conversation, sans créer de compte.
export function ContacterFamille({ annonceId }: { annonceId: string }) {
  const t = useTranslations("messages");
  const [etat, formAction, pending] = useActionState<EtatContact, FormData>(
    demarrerConversation,
    {},
  );

  const champ =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  if (etat.envoye) {
    return (
      <div className="mt-6 rounded-2xl border border-brand/30 bg-brand-soft p-4">
        <p className="flex items-center gap-2 font-semibold text-brand-dark">
          <IconCheck size={18} className="text-brand" />
          {t("envoyeTitre")}
        </p>
        <p className="mt-1 text-sm text-foreground/80">{t("envoyeTexte")}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-6 rounded-2xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="annonce" value={annonceId} />
      <p className="flex items-center gap-2 font-semibold text-brand-dark">
        <IconMessage size={18} className="text-brand" />
        {t("contacterTitre")}
      </p>
      <p className="mt-1 text-sm text-muted">{t("contacterIntro")}</p>

      <label className="mt-3 block text-sm font-medium text-muted">
        {t("votreCourriel")}
        <input
          name="courriel"
          type="email"
          required
          className={`${champ} mt-1`}
          placeholder="vous@exemple.com"
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-muted">
        {t("votreMessage")}
        <textarea
          name="message"
          required
          rows={4}
          maxLength={4000}
          className={`${champ} mt-1`}
          placeholder={t("placeholderContact")}
        />
      </label>

      {etat.erreur && (
        <p className="mt-2 text-sm text-perdu">
          {etat.erreur === "soi" ? t("erreurSoi") : t("erreurChamps")}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        <IconMessage size={16} />
        {pending ? t("envoiEnCours") : t("envoyer")}
      </button>
      <p className="mt-2 text-[11px] text-muted">{t("confidentialite")}</p>
    </form>
  );
}
