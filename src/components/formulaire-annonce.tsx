"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { ESPECES, PROVINCES, SEXES } from "@/lib/constants";
import {
  COULEURS,
  YEUX,
  TEMPERAMENTS,
  ETATS,
  AGES,
  POIDS_LB,
  formaterAge,
  formaterPoids,
} from "@/lib/champs";
import { racesPour } from "@/lib/races";
import {
  publierAnnonce,
  modifierAnnonce,
  type EtatAnnonce,
} from "@/lib/actions/annonces";
import type { Annonce } from "@/lib/types";
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

type Contact = {
  nom: string;
  prenom: string;
  courriel: string;
  telephone: string;
  adresse: string;
};

// « oui »/« non »/« » à partir du tri-état booléen stocké.
const triState = (b: boolean | null | undefined) =>
  b === true ? "oui" : b === false ? "non" : "";

export function FormulaireAnnonce({
  defaultType,
  contact,
  initial,
}: {
  defaultType: "perdu" | "trouve";
  contact: Contact;
  initial?: Annonce;
}) {
  const t = useTranslations("formulaire");
  const tChamp = useTranslations("formulaire.champ");
  const tSection = useTranslations("formulaire.section");
  const tE = useTranslations("especes");
  const tSexe = useTranslations("sexes");
  const tP = useTranslations("provinces");
  const tCommun = useTranslations("commun");
  const tCoul = useTranslations("couleurs");
  const tYeux = useTranslations("yeux");
  const tTemp = useTranslations("temperaments");
  const tEtat = useTranslations("etats");
  const langAge: "fr" | "en" = useLocale() === "en" ? "en" : "fr";

  const enEdition = !!initial;
  const type = (initial?.type as "perdu" | "trouve") ?? defaultType;
  // Espèce contrôlée : la liste des races en dépend.
  const [espece, setEspece] = useState<string>(initial?.espece ?? "chien");
  const [race, setRace] = useState<string>(initial?.race ?? "");
  const [pos, setPos] = useState<{ lat: number | null; lng: number | null }>({
    lat: initial?.latitude ?? null,
    lng: initial?.longitude ?? null,
  });
  const [etat, formAction, pending] = useActionState<EtatAnnonce, FormData>(
    enEdition ? modifierAnnonce : publierAnnonce,
    {},
  );

  const champ =
    "rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-brand focus:outline-none";
  const label = "flex flex-col gap-1 text-sm font-medium text-muted";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        {enEdition
          ? t("titreModifier")
          : type === "perdu"
            ? t("titrePerdu")
            : t("titreTrouve")}
      </h1>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="type" value={type} />
        {enEdition && <input type="hidden" name="id" value={initial.id} />}

        {/* Animal */}
        <fieldset className="grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            {tSection("animal")}
          </legend>
          {type === "trouve" && (
            <label className={`${label} sm:col-span-2`}>
              {tChamp("etat")}
              <select
                name="etat"
                defaultValue={initial?.etat ?? ""}
                className={champ}
              >
                <option value="">—</option>
                {ETATS.map((c) => (
                  <option key={c} value={c}>
                    {tEtat(c)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={`${label} sm:col-span-2`}>
            <span>
              {tChamp("nomAnimal")}{" "}
              {type === "perdu" && <span className="text-accent">*</span>}
            </span>
            <input
              name="nom_animal"
              type="text"
              required={type === "perdu"}
              defaultValue={initial?.nom_animal ?? ""}
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("espece")}
            <select
              name="espece"
              value={espece}
              onChange={(e) => {
                setEspece(e.target.value);
                setRace("");
              }}
              className={champ}
            >
              {ESPECES.map((v) => (
                <option key={v} value={v}>
                  {tE(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("race")}
            <select
              name="race"
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className={champ}
            >
              <option value="">—</option>
              {racesPour(espece).map((r) => (
                <option key={r.code} value={r.code}>
                  {langAge === "en" ? r.en : r.fr}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("sexe")}
            <select
              name="sexe"
              defaultValue={initial?.sexe ?? "inconnu"}
              className={champ}
            >
              {SEXES.map((v) => (
                <option key={v} value={v}>
                  {tSexe(v)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("age")}
            <select
              name="age"
              defaultValue={initial?.age ?? ""}
              className={champ}
            >
              <option value="">—</option>
              {AGES.map((c) => (
                <option key={c} value={c}>
                  {formaterAge(c, langAge)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("couleur")}
            <select
              name="couleur"
              defaultValue={initial?.couleur ?? ""}
              className={champ}
            >
              <option value="">—</option>
              {COULEURS.map((c) => (
                <option key={c} value={c}>
                  {tCoul(c)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("couleurYeux")}
            <select
              name="couleur_yeux"
              defaultValue={initial?.couleur_yeux ?? ""}
              className={champ}
            >
              <option value="">—</option>
              {YEUX.map((c) => (
                <option key={c} value={c}>
                  {tYeux(c)}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("poids")}
            <select
              name="poids"
              defaultValue={initial?.poids ?? ""}
              className={champ}
            >
              <option value="">—</option>
              {POIDS_LB.map((lb) => (
                <option key={lb} value={String(lb)}>
                  {formaterPoids(String(lb))}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            {tChamp("sterilise")}
            <select
              name="sterilise"
              defaultValue={triState(initial?.sterilise)}
              className={champ}
            >
              <option value="">{t("inconnu")}</option>
              <option value="oui">{t("oui")}</option>
              <option value="non">{t("non")}</option>
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("signesDistinctifs")}
            <input
              name="signes_distinctifs"
              type="text"
              defaultValue={initial?.signes_distinctifs ?? ""}
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("accessoires")}
            <input
              name="accessoires"
              type="text"
              defaultValue={initial?.accessoires ?? ""}
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("micropuce")}
            <select
              name="micropuce"
              defaultValue={triState(initial?.micropuce)}
              className={champ}
            >
              <option value="">{t("inconnu")}</option>
              <option value="oui">{t("oui")}</option>
              <option value="non">{t("non")}</option>
            </select>
          </label>
          <label className={label}>
            {tChamp("micropuceNumero")}
            <input
              name="micropuce_numero"
              type="text"
              defaultValue={initial?.micropuce_numero ?? ""}
              className={champ}
            />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("temperament")}
            <select
              name="temperament"
              defaultValue={initial?.temperament ?? ""}
              className={champ}
            >
              <option value="">—</option>
              {TEMPERAMENTS.map((c) => (
                <option key={c} value={c}>
                  {tTemp(c)}
                </option>
              ))}
            </select>
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("description")}
            <textarea
              name="description"
              rows={3}
              placeholder={tChamp("descriptionAide")}
              defaultValue={initial?.description ?? ""}
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
            <input
              name="ville"
              type="text"
              required
              defaultValue={initial?.ville ?? ""}
              className={champ}
            />
          </label>
          <label className={label}>
            <span>
              {tChamp("province")} <span className="text-accent">*</span>
            </span>
            <select
              name="province"
              defaultValue={initial?.province ?? "QC"}
              required
              className={champ}
            >
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
              defaultValue={initial?.date_evenement?.slice(0, 10) ?? ""}
              className={champ}
            />
          </label>
          <label className={label}>
            {tChamp("heure")}
            <input
              name="heure_approx"
              type="time"
              defaultValue={initial?.heure_approx?.slice(0, 5) ?? ""}
              className={champ}
            />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {type === "perdu"
              ? tChamp("adressePerdu")
              : tChamp("adresseTrouve")}
            <ChampAdresse
              name="adresse"
              defaultValue={initial?.adresse ?? ""}
              className={champ}
              onSelect={(_a, lat, lng) => setPos({ lat, lng })}
            />
          </label>
          <label className={`${label} sm:col-span-2`}>
            {tChamp("precisionLieu")}
            <input
              name="dernier_lieu_vu"
              type="text"
              defaultValue={initial?.dernier_lieu_vu ?? ""}
              className={champ}
            />
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
              <select
                name="recompense"
                defaultValue={initial?.recompense ? "oui" : "non"}
                className={champ}
              >
                <option value="non">{t("non")}</option>
                <option value="oui">{t("oui")}</option>
              </select>
            </label>
            <label className={label}>
              {tChamp("recompenseMontant")}
              <input
                name="recompense_montant"
                type="text"
                defaultValue={initial?.recompense_montant ?? ""}
                className={champ}
              />
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
              defaultValue={initial?.contact_nom ?? contact.nom}
              className={champ}
            />
          </label>
          <label className={label}>
            <span>
              {tChamp("contactPrenom")} <span className="text-accent">*</span>
            </span>
            <input
              name="contact_prenom"
              type="text"
              required
              defaultValue={initial?.contact_prenom ?? contact.prenom}
              className={champ}
            />
          </label>
          <label className={`${label} sm:col-span-2`}>
            <span>
              {type === "perdu"
                ? tChamp("contactAdresse")
                : tChamp("contactAdresseTrouve")}{" "}
              {type === "perdu" && <span className="text-accent">*</span>}
            </span>
            <ChampAdresse
              name="contact_adresse"
              required={type === "perdu"}
              defaultValue={initial?.contact_adresse ?? contact.adresse}
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
              defaultValue={initial?.contact_courriel ?? contact.courriel}
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
              defaultValue={initial?.contact_telephone ?? contact.telephone}
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
          {enEdition && (
            <p className="mt-2 text-xs text-muted">{t("photoConserver")}</p>
          )}
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
          {pending
            ? t("publication")
            : enEdition
              ? t("enregistrerModif")
              : t("publier")}
        </button>
        <span className="sr-only">{tCommun("chargement")}</span>
      </form>
    </div>
  );
}
