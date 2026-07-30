import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconSearch,
  IconAlertTriangle,
  IconHeartHandshake,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { obtenirAnnoncesRecentes } from "@/lib/annonces";
import { AnnonceCard } from "@/components/annonce-card";
import { Logo } from "@/components/logo";

export default async function AccueilPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("accueil");
  const recentes = await obtenirAnnoncesRecentes(6);

  const etapes = [
    { icon: IconSpeakerphone, titre: t("etape1Titre"), texte: t("etape1Texte") },
    { icon: IconSearch, titre: t("etape2Titre"), texte: t("etape2Texte") },
    { icon: IconHeartHandshake, titre: t("etape3Titre"), texte: t("etape3Texte") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft to-background">
        {/* Filigrane : photo (public/hero.jpg) teintée en bleu, en fondu.
            Purement décoratif ; si le fichier est absent, seul le dégradé reste. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('/hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-brand/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-soft/60 via-brand-soft/20 to-background" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
          <div className="rounded-3xl bg-surface p-5 shadow-sm">
            <Logo className="h-28 w-auto" priority />
          </div>
          <h1 className="max-w-2xl whitespace-pre-line text-3xl font-extrabold tracking-tight text-brand-dark md:text-5xl">
            {t("titre")}
          </h1>
          <p className="max-w-xl text-lg text-muted">{t("sousTitre")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/recherche"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              <IconSearch size={18} />
              {t("chercherCta")}
            </Link>
            <Link
              href="/signaler?type=perdu"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:brightness-95"
            >
              <IconAlertTriangle size={18} />
              {t("signalerPerduCta")}
            </Link>
            <Link
              href="/signaler?type=trouve"
              className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-semibold text-brand-dark transition hover:bg-brand-soft"
            >
              {t("signalerTrouveCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Signalements récents */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("recentesTitre")}
          </h2>
          <Link
            href="/recherche"
            className="text-sm font-semibold text-brand hover:text-brand-dark"
          >
            {t("recentesVoirTout")} →
          </Link>
        </div>
        {recentes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted">
            {t("aucuneRecente")}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentes.map((a) => (
              <AnnonceCard key={a.id} annonce={a} />
            ))}
          </div>
        )}
      </section>

      {/* Comment ça marche */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
            {t("commentTitre")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {etapes.map((e, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <e.icon size={28} />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{e.titre}</h3>
                <p className="mt-1 text-sm text-muted">{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
