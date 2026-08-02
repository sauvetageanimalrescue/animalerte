import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { IconMapPin, IconPaw } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { Annonce } from "@/lib/types";
import { formaterDate } from "@/lib/format";
import { TypeBadge, StatutBadge, ForfaitBadge } from "./badges";

export async function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const [tE, tT, tS, tA, tP, tF, locale] = await Promise.all([
    getTranslations("especes"),
    getTranslations("types"),
    getTranslations("statuts"),
    getTranslations("annonce"),
    getTranslations("provinces"),
    getTranslations("forfaits"),
    getLocale(),
  ]);

  const titre = annonce.nom_animal || tE(annonce.espece);
  const dateLabel =
    annonce.type === "perdu"
      ? tA("disparuLe", { date: formaterDate(annonce.date_evenement, locale) })
      : tA("trouveLe", { date: formaterDate(annonce.date_evenement, locale) });

  return (
    <Link
      href={`/annonces/${annonce.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-brand-soft">
        {annonce.photo_url ? (
          <Image
            src={annonce.photo_url}
            alt={titre}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand/40">
            <IconPaw size={48} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <TypeBadge type={annonce.type} label={tT(annonce.type)} />
          <ForfaitBadge
            forfait={annonce.forfait}
            label={tF(`${annonce.forfait}.nom`)}
          />
          <StatutBadge statut={annonce.statut} label={tS(annonce.statut)} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-foreground">{titre}</h3>
        <p className="text-sm text-muted">
          {tE(annonce.espece)}
          {annonce.race ? ` · ${annonce.race}` : ""}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <IconMapPin size={14} />
          {annonce.ville}, {tP(annonce.province)}
        </p>
        <p className="mt-auto pt-2 text-xs text-muted">{dateLabel}</p>
      </div>
    </Link>
  );
}
