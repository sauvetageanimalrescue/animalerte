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
  const bande = perdu ? "#d9535e" : "#4ba07f";
  const motFr = perdu ? "PERDU" : "TROUVÉ";
  const motEn = perdu ? "LOST" : "FOUND";

  const h = await headers();
  const host = h.get("host") ?? "animalerte.ca";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const url = `${proto}://${host}/annonces/${id}`;
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 300,
    color: { dark: "#0c3d56", light: "#ffffff" },
  });

  const nom = annonce.nom_animal || ESPECE_BI[annonce.espece] || annonce.espece;
  const especeVal = ESPECE_BI[annonce.espece] ?? annonce.espece;
  const sexeVal = SEXE_BI[annonce.sexe] ?? annonce.sexe;
  // Sur l'affiche, on montre le dossier sans le préfixe d'année (« 26- »).
  const dossier = annonce.numero_dossier
    ? annonce.numero_dossier.replace(/^\d+-/, "")
    : null;
  const aide = "1 833 999 AIDE";
  const numAffiche = LIGNE_SANS_FRAIS.replace(/-/g, " ");
  const lieu2 = annonce.adresse || annonce.dernier_lieu_vu;

  // Toutes les étiquettes s'affichent, même si la valeur est vide (comme le
  // modèle d'affiche).
  const champs: { k: string; v: string | null; large?: boolean }[] = [
    { k: "Espèce / Species", v: especeVal },
    { k: "Race / Breed", v: annonce.race },
    { k: "Sexe / Sex", v: sexeVal },
    { k: "Couleur / Colour", v: annonce.couleur },
    { k: "Âge / Age", v: annonce.age },
    { k: "Poids / Weight", v: annonce.poids },
    {
      k: "Signes distinctifs / Distinctive features",
      v: annonce.signes_distinctifs,
      large: true,
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @media print {
          @page { size: letter; margin: 0; }
          body { visibility: hidden; }
          #aff-print, #aff-print * { visibility: visible; }
          #aff-print { position: absolute; left: 0; top: 0; margin: 0; box-shadow: none; }
          .aff-noprint { display: none !important; }
        }
        .aff-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 24px 16px 48px; }
        #aff-print {
          width: 816px; min-height: 1056px; background: #fff; color: #16232b;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,.2);
          font-family: "Poppins", system-ui, -apple-system, sans-serif;
        }
        #aff-print, #aff-print * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .aff-entete { color: #fff; padding: 22px 44px 24px; display: flex; align-items: center; justify-content: space-between; }
        .aff-mot { font-size: 68px; font-weight: 800; letter-spacing: 1px; line-height: 1; }
        .aff-mot small { font-size: 32px; font-weight: 700; }
        .aff-dossier-top { font-size: 40px; font-weight: 700; letter-spacing: 1px; }
        .aff-bande { height: 14px; }
        .aff-corps { flex: 1; display: flex; gap: 36px; padding: 34px 44px 30px; }
        .aff-gauche { width: 336px; flex-shrink: 0; display: flex; flex-direction: column; }
        .aff-photo { width: 336px; height: 336px; object-fit: cover; border-radius: 14px; border: 3px solid #0c5679; display: block; background: #eef3f6; }
        .aff-photo-vide { width: 336px; height: 336px; border-radius: 14px; border: 3px solid #0c5679; background: #eef3f6; display: flex; align-items: center; justify-content: center; color: #3d87b3; font-size: 18px; }
        .aff-bloc { margin-top: 22px; }
        .aff-k { font-size: 13px; text-transform: uppercase; letter-spacing: .5px; color: #7c8b95; font-weight: 600; }
        .aff-v { font-size: 21px; font-weight: 700; color: #0c5679; line-height: 1.15; }
        .aff-recompense { margin-top: 20px; display: inline-block; background: #fdeaec; color: #ce1f2b; font-weight: 700; font-size: 18px; padding: 8px 16px; border-radius: 10px; }
        .aff-appel { margin-top: auto; }
        .aff-appel .lbl { font-size: 16px; color: #7c8b95; margin-bottom: 6px; }
        .aff-aide { font-size: 46px; font-weight: 800; color: #ce1f2b; line-height: 1; letter-spacing: 1px; }
        .aff-num { font-size: 30px; font-weight: 700; color: #3d87b3; margin-top: 2px; letter-spacing: 1px; }
        .aff-droite { flex: 1; display: flex; flex-direction: column; }
        .aff-nom { font-size: 60px; font-weight: 800; color: #0c5679; line-height: 1; margin-bottom: 20px; word-break: break-word; }
        .aff-grille { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 24px; align-content: start; }
        .aff-large { grid-column: 1 / -1; }
        .aff-cell .aff-cv { font-size: 20px; font-weight: 600; color: #16232b; margin-top: 2px; }
        .aff-qr { margin-top: auto; margin-left: auto; text-align: right; }
        .aff-qr .lbl { font-size: 15px; color: #7c8b95; line-height: 1.35; margin-bottom: 8px; }
        .aff-qr img { width: 170px; height: 170px; display: inline-block; }
        .aff-pied { background: #0c3d56; color: #fff; padding: 30px 44px; display: flex; align-items: center; justify-content: space-between; }
        .aff-pied img { height: 64px; width: auto; display: block; }
        .aff-url { font-size: 36px; font-weight: 700; letter-spacing: .5px; }
        .aff-url i { font-style: normal; color: #6fb2d6; }
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
            <div className="aff-mot">
              {motFr} <small>/ {motEn}</small>
            </div>
            {dossier && <div className="aff-dossier-top">#{dossier}</div>}
          </div>
          <div className="aff-bande" style={{ background: bande }} />

          <div className="aff-corps">
            <div className="aff-gauche">
              {annonce.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={annonce.photo_url} alt={nom} className="aff-photo" />
              ) : (
                <div className="aff-photo-vide">Photo</div>
              )}

              <div className="aff-bloc">
                <div className="aff-k">Vu pour la dernière fois / Last seen</div>
                <div className="aff-v">
                  {annonce.ville}
                  {lieu2 ? (
                    <>
                      <br />
                      {lieu2}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="aff-bloc">
                <div className="aff-k">Date</div>
                <div className="aff-v">
                  {formaterDate(annonce.date_evenement, "fr")}
                </div>
              </div>

              {perdu && annonce.recompense && (
                <div className="aff-recompense">
                  Récompense / Reward
                  {annonce.recompense_montant
                    ? ` : ${annonce.recompense_montant}`
                    : ""}
                </div>
              )}

              <div className="aff-appel">
                <div className="lbl">
                  Une information ? Appelez / Any info? Call
                </div>
                <div className="aff-aide">{aide}</div>
                <div className="aff-num">{numAffiche}</div>
              </div>
            </div>

            <div className="aff-droite">
              <div className="aff-nom">{nom}</div>
              <div className="aff-grille">
                {champs.map((c) => (
                  <div
                    key={c.k}
                    className={`aff-cell ${c.large ? "aff-large" : ""}`}
                  >
                    <div className="aff-k">{c.k}</div>
                    <div className="aff-cv">{c.v || " "}</div>
                  </div>
                ))}
              </div>

              <div className="aff-qr">
                <div className="lbl">
                  Scannez pour la fiche complète
                  <br />
                  Scan for full details
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="Code QR" />
              </div>
            </div>
          </div>

          <div className="aff-bande" style={{ background: "#3d87b3" }} />
          <div className="aff-pied">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos-combo-blanc-v2.png" alt="animALERTE · flAIr" />
            <div className="aff-url">
              anim<i>alerte</i>.ca
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
