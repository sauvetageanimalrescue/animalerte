"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  ESPECES,
  PROVINCES,
  SEXES,
  TYPES_ANNONCE,
} from "@/lib/constants";
import {
  publierAnnonce,
  type EtatAnnonce,
} from "@/lib/actions/annonces";

const CarteSelecteur = dynamic(
  () => import("@/components/carte-selecteur"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-2xl bg-brand-soft" />
    ),
  },
);

type Contact = { nom: string; courriel: string; telephone: string };

export function FormulaireAnnonce({
  defaultType,
  contact,
}: {
  defaultType: "perdu" | "trouve";
  contact: Contact;
}) {
  const t = useTranslations("formulaire");
  const tChamp = useTranslations("formulaire.champ");
  const tSection = useTranslations("formulaire.section");
  const tE = useTranslations("especes");
  const tSexe = useTranslations("sexes");
  const tType = useTranslations("types");
  const tP = useTranslations("provinces");
  const tCommun = useTranslations("commun");

  const [type, setType] = useState<"perdu" | "trouve">(defaultType);
  const [pos, setPos] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [etat, formAction, pending] = useActionState<EtatAnnonce, FormData>(
    publierAnnonce,
    {},
  );

  const champ =
    "rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";
  const label = "flex flex-col gap-1 text-sm font-medium text-muted";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        {type === "perdu" ? t("titrePerdu") : t("titreTrouve")}
      </h1>

      <form action={formAction} className="flex flex-col gap-6">
        {/* Type */}
        <fieldset className="rounded-2xl border border-border bg-surface p-4">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("type")}
          </legend>
          <div className="mt-2 flex gap-3">
            {TYPES_ANNONCE.map((v) => (
              <label
                key={v}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  type === v
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-border text-muted hover:bg-brand-soft/50"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={v}
                  checked={type === v}
                  onChange={() => setType(v)}
                  className="sr-only"
                />
                {tType(v)}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Animal */}
        <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("animal")}
          </legend>
          <label className={label}>
            {tChamp("espece")}
            <select name="espece" defaultValue="chien" className={champ}>
              {ESPECES.map((v) => (
                <option key={v} value={v}>
                  {tE(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("sexe")}
            <select name="sexe" defaultValue="inconnu" className={champ}>
              {SEXES.map((v) => (
                <option key={v} value={v}>
                  {tSexe(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("nomAnimal")}
            <input name="nom_animal" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("race")}
            <input name="race" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("age")}
            <input name="age" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("poids")}
            <input name="poids" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("couleur")}
            <input name="couleur" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("couleurYeux")}
            <input name="couleur_yeux" type="text" className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("signesDistinctifs")}
            <input name="signes_distinctifs" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("sterilise")}
            <select name="sterilise" defaultValue="" className={champ}>
              <option value="">{t("inconnu")}</option>
              <option value="oui">{t("oui")}</option>
              <option value="non">{t("non")}</option>
            </select>
          </label>
          <label className={label}>
            {tChamp("micropuce")}
            <select name="micropuce" defaultValue="" className={champ}>
              <option value="">{t("inconnu")}</option>
              <option value="oui">{t("oui")}</option>
              <option value="non">{t("non")}</option>
            </select>
          </label>
          <label className={label}>
            {tChamp("micropuceNumero")}
            <input name="micropuce_numero" type="text" className={champ} />
          </label>
          <label className={label}>
            {tChamp("accessoires")}
            <input name="accessoires" type="text" className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("temperament")}
            <input name="temperament" type="text" className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("description")}
            <textarea
              name="description"
              rows={3}
              placeholder={tChamp("descriptionAide")}
              className={champ}
            />
          </label>
        </fieldset>

        {/* Lieu et date */}
        <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("lieu")}
          </legend>
          <label className={label}>
            {tChamp("ville")} <span className="text-accent">*</span>
            <input name="ville" type="text" required className={champ} />
          </label>
          <label className={label}>
            {tChamp("province")} <span className="text-accent">*</span>
            <select name="province" defaultValue="QC" required className={champ}>
              {PROVINCES.map((v) => (
                <option key={v} value={v}>
                  {tP(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("dateEvenement")} <span className="text-accent">*</span>
            <input
              name="date_evenement"
              type="date"
              required
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("heure")}
            <input name="heure_approx" type="text" className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("adresse")}
            <input name="adresse" type="text" className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("dernierLieuVu")}
            <input name="dernier_lieu_vu" type="text" className={champ} />
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-muted">
              {tChamp("position")}
            </p>
            <CarteSelecteur
              lat={pos.lat}
              lng={pos.lng}
              onPick={(lat, lng) => setPos({ lat, lng })}
            />
            <p className="mt-1 text-xs text-muted">{tChamp("positionAide")}</p>
            <input type="hidden" name="latitude" value={pos.lat ?? ""} />
            <input type="hidden" name="longitude" value={pos.lng ?? ""} />
          </div>
        </fieldset>

        {/* Récompense */}
        <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("recompense")}
          </legend>
          <label className={label}>
            {tChamp("recompense")}
            <select name="recompense" defaultValue="non" className={champ}>
              <option value="non">{t("non")}</option>
              <option value="oui">{t("oui")}</option>
            </select>
          </label>
          <label className={label}>
            {tChamp("recompenseMontant")}
            <input name="recompense_montant" type="text" className={champ} />
          </label>
        </fieldset>

        {/* Contact */}
        <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("contact")}
          </legend>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("contactNom")} <span className="text-accent">*</span>
            <input
              name="contact_nom"
              type="text"
              required
              defaultValue={contact.nom}
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("contactCourriel")}
            <input
              name="contact_courriel"
              type="email"
              defaultValue={contact.courriel}
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("contactTelephone")}
            <input
              name="contact_telephone"
              type="tel"
              defaultValue={contact.telephone}
              className={champ}
            />
          </label>
          <p className="text-xs text-muted sm:col-span-2">
            {tChamp("contactAide")}
          </p>
        </fieldset>

        {/* Photo */}
        <fieldset className="rounded-2xl border border-border bg-surface p-4">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("photo")}
          </legend>
          <label className={`${label} mt-2`}>
            {tChamp("photo")}
            <input
              name="photo"
              type="file"
              accept="image/*"
              className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-dark"
            />
          </label>
        </fieldset>

        <p className="text-xs text-muted">{t("retention")}</p>

        {etat.erreur && (
          <p className="rounded-lg bg-perdu-soft px-3 py-2 text-sm text-perdu">
            {etat.erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {pending ? t("publication") : t("publier")}
        </button>
        <span className="sr-only">{tCommun("chargement")}</span>
      </form>
    </div>
  );
}
