import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  IconSearch,
  IconAlertTriangle,
  IconMapPin,
  IconUsers,
  IconArrowRight,
  IconScan,
  IconPaw,
  IconCalendarStats,
} from "@tabler/icons-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  obtenirAnnoncesRecentes,
  obtenirAnnoncesPrioritaires,
} from "@/lib/annonces";
import { AnnonceCard } from "@/components/annonce-card";
import { ForfaitsCards } from "@/components/forfaits-cards";
import { FlairWord } from "@/components/logo";

export default async function AccueilPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("accueil");
  const m = await getTranslations("marketing");
  const tf = await getTranslations("forfaits");
  const recentes = await obtenirAnnoncesRecentes(6);
  const prioritaires = await obtenirAnnoncesPrioritaires();

  const criteres = [
    { icon: IconScan, titre: m("crit1Titre"), texte: m("crit1Texte") },
    { icon: IconPaw, titre: m("crit2Titre"), texte: m("crit2Texte") },
    { icon: IconMapPin, titre: m("crit3Titre"), texte: m("crit3Texte") },
    { icon: IconCalendarStats, titre: m("crit4Titre"), texte: m("crit4Texte") },
  ];

  // Points de reconnaissance flAIr superposés sur l'image (en % de l'image),
  // mesurés à la grille. 4 par chat : oreille, œil, nez, pelage (sur le côté).
  const pointsFlair = [
    // Chat perdu (gauche) — Agathinne : oreille 8N, œil 11S, nez 13V, pelage 19U
    { x: 14.4, y: 26.0 }, { x: 20.2, y: 35.6 }, { x: 24.0, y: 41.3 }, { x: 35.6, y: 39.4 },
    // Chat trouvé (droite) — Inconnu : oreille 40I, œil 42O, nez 44R, pelage 37U
    { x: 76.0, y: 16.3 }, { x: 79.8, y: 27.9 }, { x: 83.7, y: 33.7 }, { x: 70.2, y: 39.4 },
  ];

  // Marqueurs GPS (radar pulsant autour du 📍 de l'emplacement). QQ8 / NN24.
  const pointsGps = [
    { x: 14.4, y: 81.7 }, // Agathinne — Beauharnois
    { x: 45.2, y: 76.0 }, // Inconnu — Chateauguay
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/40 via-brand-dark/10 to-background" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center md:py-20">
          <Image
            src="/logos-combo-blanc-v2.png"
            alt="animALERTE · flAIr"
            width={420}
            height={170}
            priority
            className="h-auto w-full max-w-md"
          />
          <h1 className="max-w-2xl whitespace-pre-line text-3xl font-extrabold tracking-tight text-brand-soft md:text-5xl">
            {t("titre")}
          </h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signaler?type=perdu"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:brightness-95"
            >
              <IconAlertTriangle size={18} />
              {t("signalerPerduCta")}
            </Link>
            <Link
              href="/recherche"
              className="inline-flex items-center gap-2 rounded-full bg-brand-light px-6 py-3 font-semibold text-white transition hover:brightness-95"
            >
              <IconSearch size={18} />
              {t("chercherCta")}
            </Link>
            <Link
              href="/signaler?type=trouve"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {t("signalerTrouveCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Carrousel des annonces prioritaires */}
      {prioritaires.length > 0 && (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconAlertTriangle size={20} className="text-accent" />
                <h2 className="text-lg font-bold text-foreground">
                  {t("prioritairesTitre")}
                </h2>
              </div>
              <Link
                href="/recherche"
                className="whitespace-nowrap text-sm font-semibold text-brand hover:text-brand-dark"
              >
                {t("recentesVoirTout")}
              </Link>
            </div>
            <div className="flex snap-x gap-5 overflow-x-auto pb-3">
              {prioritaires.map((a) => (
                <div key={a.id} className="w-72 shrink-0 snap-start">
                  <AnnonceCard annonce={a} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* flAIr */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">
            {m("flairUnique")}
          </p>
          <div className="mt-3 text-4xl font-extrabold md:text-5xl">
            <FlairWord />{" "}
            <span className="italic tracking-tight text-muted">
              {m("flairVerbe")}
            </span>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-muted">{m("flairIntro")}</p>

          <div className="relative mx-auto mt-8 w-full max-w-3xl">
            <Image
              src="/flair-hero.png"
              alt="flAIr — reconnaissance faciale animale"
              width={1535}
              height={1063}
              className="h-auto w-full"
            />
            {pointsFlair.map((p, i) => (
              <span
                key={i}
                className="pointer-events-none absolute aspect-square w-[3.4%] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span className="block h-full w-full rounded-full border-2 border-brand bg-brand/10 shadow-[0_0_0_2px_rgba(255,255,255,0.55)]" />
                <span
                  className="absolute inset-0 rounded-full border-2 border-brand animate-ping [animation-duration:1.8s]"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              </span>
            ))}
            {pointsGps.map((p, i) => (
              <span
                key={`gps-${i}`}
                className="pointer-events-none absolute aspect-square w-[4.2%] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span
                  className="absolute inset-0 rounded-full border-2 border-accent animate-ping [animation-duration:2s]"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
                <span
                  className="absolute inset-[28%] rounded-full border-2 border-accent animate-ping [animation-duration:2s]"
                  style={{ animationDelay: `${i * 0.5 + 0.6}s` }}
                />
              </span>
            ))}
          </div>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
            {criteres.map((c, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <c.icon size={22} />
                </div>
                <h3 className="font-semibold text-foreground">{c.titre}</h3>
                <p className="text-sm text-muted">{c.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forfaits */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-foreground">
          {tf("titre")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-muted">
          {tf("sousTitre")}
        </p>
        <div className="mt-10">
          <ForfaitsCards />
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
            className="whitespace-nowrap text-sm font-semibold text-brand hover:text-brand-dark"
          >
            {t("recentesVoirTout")}
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
