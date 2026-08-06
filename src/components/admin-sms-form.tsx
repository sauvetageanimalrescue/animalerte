"use client";

import { useActionState } from "react";
import { IconSend } from "@tabler/icons-react";
import { envoyerSmsAdmin, type EtatSms } from "@/lib/actions/admin-sms";

const etatInitial: EtatSms = {};

export function AdminSmsForm({ messageDefaut }: { messageDefaut: string }) {
  const [etat, action, enCours] = useActionState(envoyerSmsAdmin, etatInitial);

  const champ =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div>
        <label
          htmlFor="telephone"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Numéro de téléphone
        </label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          required
          placeholder="514-555-1234"
          className={champ}
        />
        <p className="mt-1 text-xs text-muted">
          Numéro nord-américain à 10 chiffres, tel qu'affiché sur l'affiche.
        </p>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={600}
          defaultValue={messageDefaut}
          className={champ}
        />
        <p className="mt-1 text-xs text-muted">
          Garde un ton respectueux et utile. La personne peut répondre STOP pour
          ne plus être contactée.
        </p>
      </div>

      {etat.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            etat.ok
              ? "bg-green-50 text-green-800"
              : "bg-accent-soft text-accent"
          }`}
        >
          {etat.message}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        <IconSend size={18} />
        {enCours ? "Envoi..." : "Envoyer le SMS"}
      </button>
    </form>
  );
}
