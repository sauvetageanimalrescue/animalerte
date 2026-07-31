"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ESPECES, PROVINCES, SEXES } from "@/lib/constants";
import {
  publierAnnonce,
  type EtatAnnonce,
} from "@/lib/actions/annonces";
import { ChampAdresse } from "@/components/champ-adresse";
import { ChampTelephone } from "@/components/champ-telephone";

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
  const tP = useTranslations("provinces");
  const tCommun = useTranslations("commun");

  const type = defaultType;
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
        <input type="hidden" name="type" value={type} />

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
            <span>
              {tChamp("nomAnimal")}{" "}
              {type === "perdu" && <span className="text-accent">*</span>}
            </span>
            <input
              name="nom_animal"
              type="text"
              required={type === "perdu"}
              className={champ}
            />
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
            {type === "perdu" ? tSection("lieuPerdu") : tSection("lieuTrouve")}
          </legend>
          <label className={label}>
            <span>
              {tChamp("ville")} <span className="text-accent">*</span>
            </span>
            <input name="ville" type="text" required className={champ} />
          </label>
          <label className={label}>
            <span>
              {tChamp("province")} <span className="text-accent">*</span>
            </span>
            <select name="province" defaultValue="QC" required className={champ}>
              {PROVINCES.map((v) => (
                <option key={v} value={v}>
                  {tP(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            <span>
              {type === "perdu"
                ? tChamp("dateEvenement")
                : tChamp("dateDecouverte")}{" "}
              <span className="text-accent">*</span>
            </span>
            <input
              name="date_evenement"
              type="date"
              required
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("heure")}
            <input name="heure_approx" type="time" className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {type === "perdu"
              ? tChamp("adressePerdu")
              : tChamp("adresseTrouve")}
            <ChampAdresse
              name="adresse"
              className={champ}
              onSelect={(_a, lat, lng) => setPos({ lat, lng })}
            />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("precisionLieu")}
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

        {/* Récompense (uniquement pour un animal perdu) */}
        {type === "perdu" && (
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
        )}

        {/* Contact */}
        <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("contact")}
          </legend>
          <label className={label}>
            <span>
              {tChamp("contactNom")} <span className="text-accent">*</span>
            </span>
            <input
              name="contact_nom"
              type="text"
              required
              defaultValue={contact.nom}
              className={champ}
            />
          </label>
          <label className={label}>
            <span>
              {tChamp("contactPrenom")} <span className="text-accent">*</span>
            </span>
            <input name="contact_prenom" type="text" required className={champ} />
          </label>
          <label className={`${label} sm:col-span-2`}>
            <span>
              {tChamp("contactAdresse")}{" "}
              {type === "perdu" && <span className="text-accent">*</span>}
            </span>
            <ChampAdresse
              name="contact_adresse"
              required={type === "perdu"}
              className={champ}
            />
          </label>
          <label className={label}>
            <span>
              {tChamp("contactCourriel")} <span className="text-accent">*</span>
            </span>
            <input
              name="contact_courriel"
              type="email"
              required
              defaultValue={contact.courriel}
              className={champ}
            />
          </label>
          <label className={label}>
            <span>
              {tChamp("contactTelephone")} <span className="text-accent">*</span>
            </span>
            <ChampTelephone
              name="contact_telephone"
              required
              defaultValue={contact.telephone}
              className={champ}
            />
          </label>
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
