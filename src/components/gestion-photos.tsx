"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { IconTrash, IconPhotoPlus } from "@tabler/icons-react";
import {
  ajouterPhotos,
  supprimerPhoto,
  type EtatPhotos,
} from "@/lib/actions/photos";

export function GestionPhotos({
  id,
  photoUrl,
  photos,
  max,
}: {
  id: string;
  photoUrl: string | null;
  photos: string[];
  max: number; // nombre total autorisé (photo principale comprise)
}) {
  const t = useTranslations("photos");
  const [etat, formAction, pending] = useActionState<EtatPhotos, FormData>(
    ajouterPhotos,
    {},
  );

  const extrasMax = Math.max(0, max - 1);
  const placesRestantes = extrasMax - photos.length;
  const total = (photoUrl ? 1 : 0) + photos.length;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        {t("compte", { total, max })}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Photo principale (non supprimable ici) */}
        {photoUrl && (
          <figure className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <figcaption className="absolute bottom-0 w-full bg-black/50 px-2 py-1 text-center text-[11px] font-medium text-white">
              {t("principale")}
            </figcaption>
          </figure>
        )}

        {/* Photos supplémentaires, chacune supprimable */}
        {photos.map((url) => (
          <figure
            key={url}
            className="relative overflow-hidden rounded-xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="aspect-square w-full object-cover"
            />
            <form action={supprimerPhoto} className="absolute right-1.5 top-1.5">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="url" value={url} />
              <button
                type="submit"
                aria-label={t("supprimer")}
                className="rounded-full bg-black/60 p-1.5 text-white transition hover:bg-perdu"
              >
                <IconTrash size={15} />
              </button>
            </form>
          </figure>
        ))}
      </div>

      {placesRestantes > 0 ? (
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={id} />
          <label className="text-sm font-medium text-muted">
            {t("ajouterLabel", { n: placesRestantes })}
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="mt-1 block text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-dark"
            />
          </label>
          {etat.erreur && (
            <p className="text-sm text-perdu">
              {etat.erreur === "limite"
                ? t("erreurLimite")
                : etat.erreur === "aucune"
                  ? t("erreurAucune")
                  : t("erreurGenerale")}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            <IconPhotoPlus size={18} />
            {pending ? t("envoi") : t("ajouter")}
          </button>
        </form>
      ) : (
        <p className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">
          {t("complet")}
        </p>
      )}
    </div>
  );
}
