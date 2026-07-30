import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconSearch,
  IconAlertTriangle,
  IconHeartHandshake,
  IconSpeakerphone,
  IconEye,
  IconMapPin,
  IconBellRinging,
  IconWorld,
  IconUsers,
  IconMap2,
  IconSparkles,
  IconArrowRight,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { obtenirAnnoncesRecentes } from "@/lib/annonces";
import { AnnonceCard } from "@/components/annonce-card";
import { Logo, FlairWord } from "@/components/logo";

export default async function AccueilPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("accueil");
  const m = await getTranslations("marketing");
  const recentes = await obtenirAnnoncesRecentes(6);

  const etapes = [
    { icon: IconSpeakerphone, titre: t("etape1Titre"), texte: t("etape1Texte") },
    { icon: IconSearch, titre: t("etape2Titre"), texte: t("etape2Texte") },
    { icon: IconHeartHandshake, titre: t("etape3Titre"), texte: t("etape3Texte") },
  ];

  const flairPoints = [
    { icon: IconEye, titre: m("flairPoint1Titre"), texte: m("flairPoint1Texte") },
    { icon: IconMapPin, titre: m("flairPoint2Titre"), texte: m("flairPoint2Texte") },
    { icon: IconBellRinging, titre: m("flairPoint3Titre"), texte: m("flairPoint3Texte") },
  ];

  const portee = [
    { icon: IconWorld, titre: m("porteeWeb"), desc: m("porteeWebD"), variante: "blanc" as const },
    { icon: IconMapPin, titre: m("porteeLocale"), desc: m("porteeLocaleD"), variante: "blanc" as const },
    { icon: IconMap2, titre: m("porteeRegionale"), desc: m("porteeRegionaleD"), variante: "bleu" as const },
    { icon: IconAlertTriangle, titre: m("porteeProvinciale"), desc: m("porteeProvincialeD"), variante: "rouge" as const },
  ];
  const varStyles = {
    blanc: { card: "border-border bg-surface", icon: "bg-brand-soft text-brand", bar: "bg-brand", num: "text-brand/30" },
    bleu: { card: "border-brand/40 bg-brand-soft", icon: "bg-brand text-white", bar: "bg-brand", num: "text-brand/40" },
    rouge: { card: "border-accent/40 bg-accent-soft", icon: "bg-accent text-white", bar: "bg-accent", num: "text-accent/45" },
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft to-background">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('/hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-brand/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-soft/60 via-brand-soft/20 to-background" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center md:py-20">
          <div className="rounded-3xl bg-surface p-4 shadow-sm">
            <Logo className="h-24 w-auto" priority />
          </div>
          <h1 className="max-w-2xl whitespace-pre-line text-3xl font-extrabold tracking-tight text-brand-dark md:text-5xl">
            {t("titre")}
          </h1>
          <p className="hidden max-w-xl text-lg text-muted md:block">
            {t("sousTitre")}
          </p>

          <p className="flex max-w-xl items-center gap-2 rounded-2xl bg-surface/80 px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm ring-1 ring-brand/15">
            <IconSparkles size={18} className="shrink-0 text-accent" />
            <span>
              {m.rich("usp", {
                flair: () => <FlairWord className="font-extrabold" />,
              })}
            </span>
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signaler?type=perdu"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:brightness-95"
            >
              <IconAlertTriangle size={18} />
              {t("signalerPerduCta")}
            </Link>
            <Link
              href="/recherche"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              <IconSearch size={18} />
              {t("chercherCta")}
            </Link>
            <Link
              href="/signaler?type=trouve"
              className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-semibold text-brand-dark transition hover:bg-brand-soft"
            >
              {t("signalerTrouveCta")}
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-semibold text-brand-dark transition hover:bg-brand-soft"
            >
              <IconUsers size={18} />
              {m("sentinelleBouton")}
            </Link>
          </div>
        </div>
      </section>

      {/* flAIr */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            {m("flairUnique")}
          </p>
          <div className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
            <FlairWord /> <span className="italic text-muted">{m("flairVerbe")}</span>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {flairPoints.map((p, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <p.icon size={24} />
                </div>
                <h3 className="font-semibold text-foreground">{p.titre}</h3>
                <p className="text-sm text-muted">{p.texte}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-muted">{m("flairTexte")}</p>
        </div>
      </section>

      {/* Portée */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-foreground">
          {m("porteeTitre")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-muted">
          {m("porteeSousTitre")}
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {portee.map((p, i) => {
            const s = varStyles[p.variante];
            return (
              <div
                key={i}
                className={`flex flex-col gap-3 rounded-2xl border p-5 ${s.card}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.icon}`}
                  >
                    <p.icon size={22} />
                  </div>
                  <span className={`text-2xl font-extrabold ${s.num}`}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{p.titre}</h3>
                <p className="text-sm text-muted">{p.desc}</p>
                <div className="mt-auto h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className={`h-full ${s.bar}`}
                    style={{ width: `${((i + 1) / portee.length) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Signalements récents */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
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
      <section className="mx-auto max-w-6xl px-4 py-16">
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
      </section>

      {/* Sentinelles */}
      <section className="bg-brand-dark">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
            <IconUsers size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            {m("sentinelleTitre")}
          </h2>
          <p className="max-w-xl text-white/80">{m("sentinelleTexte")}</p>
          <Link
            href="/inscription"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-dark transition hover:bg-brand-soft"
          >
            {m("sentinelleCta")}
            <IconArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
