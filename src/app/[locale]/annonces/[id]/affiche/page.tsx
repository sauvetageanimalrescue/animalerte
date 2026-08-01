import { headers } from "next/headers";
import QRCode from "qrcode";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { obtenirAnnonce } from "@/lib/annonces";
import { formaterDate } from "@/lib/format";
import { LIGNE_SANS_FRAIS } from "@/lib/constants";
import { BoutonImprimer } from "@/components/bouton-imprimer";

const ESPECE_BI: Record<string, string> = {
  chien: "Chien / Dog",
  chat: "Chat / Cat",
};
const SEXE_BI: Record<string, string> = {
  male: "Mâle / Male",
  femelle: "Femelle / Female",
  inconnu: "Inconnu / Unknown",
};

export default async function AffichePage({
  params,
}: PageProps<"/[locale]/annonces/[id]/affiche">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [annonce, t] = await Promise.all([
    obtenirAnnonce(id),
    getTranslations("affiche"),
  ]);

  if (!annonce) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">
        {t("introuvable")}
      </div>
    );
  }

  const perdu = annonce.type === "perdu";
  const entete = perdu ? "#ce1f2b" : "#167a4d";
  const motFr = perdu ? "PERDU" : "TROUVÉ";
  const motEn = perdu ? "LOST" : "FOUND";
  const sousTitre = perdu
    ? "Aidez-nous à le retrouver / Help us find them"
    : "Aidez à retrouver sa famille / Help find their family";

  const h = await headers();
  const host = h.get("host") ?? "animalerte.ca";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const url = `${proto}://${host}/annonces/${id}`;
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 260,
    color: { dark: "#0c5679", light: "#ffffff" },
  });

  const nom = annonce.nom_animal || ESPECE_BI[annonce.espece] || annonce.espece;
  const especeVal = ESPECE_BI[annonce.espece] ?? annonce.espece;
  const sexeVal = SEXE_BI[annonce.sexe] ?? annonce.sexe;
  const dossier = annonce.numero_dossier;

  const champs: { k: string; v: string; large?: boolean }[] = [
    { k: "Espèce / Species", v: especeVal },
    ...(annonce.race ? [{ k: "Race / Breed", v: annonce.race }] : []),
    { k: "Sexe / Sex", v: sexeVal },
    ...(annonce.couleur ? [{ k: "Couleur / Colour", v: annonce.couleur }] : []),
    ...(annonce.signes_distinctifs
      ? [
          {
            k: "Signes distinctifs / Distinctive marks",
            v: annonce.signes_distinctifs,
            large: true,
          },
        ]
      : []),
    ...(annonce.accessoires
      ? [
          {
            k: "Collier, laisse / Collar, leash",
            v: annonce.accessoires,
            large: true,
          },
        ]
      : []),
  ];

  return (
    <>
      <style>{`
        @media print {
          @page { size: letter; margin: 0; }
          body { visibility: hidden; }
          #aff-print, #aff-print * { visibility: visible; }
          #aff-print { position: absolute; left: 0; top: 0; margin: 0; box-shadow: none; }
          .aff-noprint { display: none !important; }
        }
        .aff-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 24px 16px 48px; }
        #aff-print {
          width: 816px; min-height: 1056px; background: #fff; color: #1a1a1a;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,.2);
          font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
        }
        .aff-entete { color: #fff; padding: 20px 40px; display: flex; align-items: center; gap: 24px; }
        .aff-badge { background: #fff; border-radius: 14px; padding: 8px 14px; display: flex; align-items: center; }
        .aff-badge img { height: 78px; width: auto; display: block; }
        .aff-titre { flex: 1; }
        .aff-mot { font-size: 62px; font-weight: 800; letter-spacing: 2px; line-height: 1; }
        .aff-mot small { font-size: 32px; font-weight: 700; opacity: .9; }
        .aff-tagline { font-size: 15px; margin-top: 6px; opacity: .95; }
        .aff-photo { width: 100%; height: 360px; object-fit: cover; display: block; background: #f2f6f9; }
        .aff-photo-vide { width: 100%; height: 360px; background: #f2f6f9; display: flex; align-items: center; justify-content: center; color: #3d87b3; font-size: 18px; }
        .aff-corps { flex: 1; display: flex; flex-direction: column; padding: 26px 40px 0; gap: 20px; }
        .aff-nom { font-size: 58px; font-weight: 800; color: #0c5679; line-height: 1; word-break: break-word; }
        .aff-grille { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 26px; }
        .aff-large { grid-column: 1 / -1; }
        .aff-k { font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: #6b7b86; }
        .aff-v { font-size: 21px; font-weight: 600; color: #1a1a1a; }
        .aff-lieu { background: #f2f6f9; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .aff-lieu .aff-v { font-size: 23px; font-weight: 700; color: #0c5679; }
        .aff-recompense { background: #0c5679; color: #fff; border-radius: 12px; padding: 14px 18px; text-align: center; font-size: 25px; font-weight: 800; letter-spacing: 1px; }
        .aff-recompense span { color: #ffd54a; }
        .aff-bas { margin-top: auto; margin-bottom: 26px; display: flex; gap: 28px; align-items: center; }
        .aff-contact { flex: 1; }
        .aff-app { font-size: 15px; color: #6b7b86; margin-bottom: 4px; }
        .aff-aide { font-size: 52px; font-weight: 800; color: #ce1f2b; line-height: 1; letter-spacing: 1px; }
        .aff-num { font-size: 30px; font-weight: 700; color: #0c5679; margin-top: 4px; }
        .aff-dossier { font-size: 16px; color: #40515c; margin-top: 8px; }
        .aff-qr { width: 158px; flex-shrink: 0; text-align: center; }
        .aff-qr img { width: 158px; height: 158px; display: block; border: 3px solid #0c5679; border-radius: 12px; }
        .aff-qr p { font-size: 11px; color: #6b7b86; margin-top: 5px; line-height: 1.3; }
        .aff-pied { background: #0c5679; color: #fff; padding: 14px 40px; display: flex; justify-content: space-between; font-size: 15px; align-items: center; }
        .aff-pied b i { font-style: normal; color: #9fd0ea; }
      `}</style>

      <div className="aff-wrap">
        <div className="aff-noprint flex w-full max-w-[816px] items-center justify-between">
          <Link
            href={`/annonces/${id}`}
            className="text-sm font-medium text-brand hover:text-brand-dark"
          >
            {t("retour")}
          </Link>
          <BoutonImprimer label={t("imprimer")} />
        </div>

        <div id="aff-print">
          <div className="aff-entete" style={{ background: entete }}>
            <div className="aff-badge">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="animALERTE" />
            </div>
            <div className="aff-titre">
              <div className="aff-mot">
                {motFr} <small>/ {motEn}</small>
              </div>
              <div className="aff-tagline">{sousTitre}</div>
            </div>
          </div>

          {annonce.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={annonce.photo_url} alt={nom} className="aff-photo" />
          ) : (
            <div className="aff-photo-vide">Photo</div>
          )}

          <div className="aff-corps">
            <div className="aff-nom">{nom}</div>

            <div className="aff-grille">
              {champs.map((c) => (
                <div key={c.k} className={c.large ? "aff-large" : ""}>
                  <div className="aff-k">{c.k}</div>
                  <div className="aff-v">{c.v}</div>
                </div>
              ))}
            </div>

            <div className="aff-lieu">
              <div>
                <div className="aff-k">Vu pour la dernière fois / Last seen</div>
                <div className="aff-v">{annonce.ville}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="aff-k">Date</div>
                <div className="aff-v">
                  {formaterDate(annonce.date_evenement, "fr")}
                </div>
              </div>
            </div>

            {perdu && annonce.recompense && (
              <div className="aff-recompense">
                RÉCOMPENSE / REWARD
                {annonce.recompense_montant ? (
                  <>
                    {" "}
                    <span>•</span> {annonce.recompense_montant}
                  </>
                ) : null}
              </div>
            )}

            <div className="aff-bas">
              <div className="aff-contact">
                <div className="aff-app">
                  Un renseignement ? Composez / Any info? Call
                </div>
                <div className="aff-aide">1-833-999-AIDE</div>
                <div className="aff-num">{LIGNE_SANS_FRAIS}</div>
                {dossier && (
                  <div className="aff-dossier">
                    Mentionnez le dossier / Quote file&nbsp;: {dossier}
                  </div>
                )}
              </div>
              <div className="aff-qr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="Code QR" />
                <p>Scannez pour la fiche / Scan for details</p>
              </div>
            </div>
          </div>

          <div className="aff-pied">
            <b>
              anim<i>ALERTE</i>.ca
            </b>
            <span>{dossier ? `Dossier / File ${dossier}` : ""}</span>
          </div>
        </div>
      </div>
    </>
  );
}
