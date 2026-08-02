import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type Color } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import sharp from "sharp";
import { getTranslations } from "next-intl/server";
import type { Annonce } from "@/lib/types";
import { formaterDate, nomDeRue } from "@/lib/format";
import {
  COULEURS,
  YEUX,
  TEMPERAMENTS,
  formaterAge,
  formaterPoids,
} from "@/lib/champs";
import { nomRace } from "@/lib/races";

const DIR = path.join(process.cwd(), "src", "lib", "affiche");

const ESPECE_BI: Record<string, string> = {
  chien: "Chien / Dog",
  chat: "Chat / Cat",
};
const SEXE_BI: Record<string, string> = {
  male: "Mâle / Male",
  femelle: "Femelle / Female",
  inconnu: "Inconnu / Unknown",
};

// Remplit le gabarit PDF d'Eric (affiche-vide.pdf) avec les données de l'annonce.
// Le design reste 100 % le gabarit ; on ne fait qu'« estamper » les données.
export async function remplirAffiche(
  a: Annonce,
  origin: string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(
    fs.readFileSync(path.join(DIR, "affiche-vide.pdf")),
  );
  pdf.registerFontkit(fontkit);
  const black = await pdf.embedFont(
    fs.readFileSync(path.join(DIR, "fonts", "Geist-Black.ttf")),
  );
  const bold = await pdf.embedFont(
    fs.readFileSync(path.join(DIR, "fonts", "Geist-Bold.ttf")),
  );
  const semi = await pdf.embedFont(
    fs.readFileSync(path.join(DIR, "fonts", "Geist-SemiBold.ttf")),
  );

  const page = pdf.getPage(0);
  const H = page.getHeight();
  const navy = rgb(12 / 255, 86 / 255, 121 / 255);
  const blue = rgb(61 / 255, 135 / 255, 179 / 255);
  const white = rgb(1, 1, 1);
  const td = (v: number) => H - v;

  const fit = (font: PDFFont, text: string, maxW: number, start: number) => {
    let s = start;
    while (s > 9 && font.widthOfTextAtSize(text, s) > maxW) s -= 0.5;
    return s;
  };
  const draw = (
    text: string | null | undefined,
    x: number,
    base: number,
    font: PDFFont,
    size: number,
    color: Color,
  ) => {
    if (text) page.drawText(String(text), { x, y: td(base), size, font, color });
  };
  const drawRight = (
    text: string,
    xRight: number,
    base: number,
    font: PDFFont,
    size: number,
    color: Color,
  ) => {
    const w = font.widthOfTextAtSize(text, size);
    draw(text, xRight - w, base, font, size, color);
  };

  const dossier = a.numero_dossier;
  const poste = dossier ? dossier.replace(/^\d+-/, "") : null;
  const nom = a.nom_animal || ESPECE_BI[a.espece]?.split(" / ")[0] || a.espece;

  // Nom : le haut des majuscules aligné au haut de la photo.
  const PHOTO_TOP = 132;
  const sNom = fit(black, nom, 290, 42);
  draw(nom, 291, PHOTO_TOP + sNom * 0.72, black, sNom, navy);

  // Traductions FR + EN pour construire les valeurs bilingues.
  const [tCoulFr, tCoulEn, tYeuxFr, tYeuxEn, tTempFr, tTempEn] =
    await Promise.all([
      getTranslations({ locale: "fr", namespace: "couleurs" }),
      getTranslations({ locale: "en", namespace: "couleurs" }),
      getTranslations({ locale: "fr", namespace: "yeux" }),
      getTranslations({ locale: "en", namespace: "yeux" }),
      getTranslations({ locale: "fr", namespace: "temperaments" }),
      getTranslations({ locale: "en", namespace: "temperaments" }),
    ]);
  const biCode = (
    v: string | null,
    liste: readonly string[],
    fr: (k: string) => string,
    en: (k: string) => string,
  ) => (v && liste.includes(v) ? `${fr(v)} / ${en(v)}` : v);

  const couleurBi = biCode(a.couleur, COULEURS, tCoulFr, tCoulEn);
  const yeuxBi = biCode(a.couleur_yeux, YEUX, tYeuxFr, tYeuxEn);
  const tempBi = biCode(a.temperament, TEMPERAMENTS, tTempFr, tTempEn);
  const micropuceBi =
    a.micropuce === true
      ? "Oui / Yes"
      : a.micropuce === false
        ? "Non / No"
        : null;

  // Grille bilingue : français gras (marine) au-dessus, anglais dessous (bleu,
  // plus petit). Chaque langue occupe sa propre ligne, donc pas de débordement.
  const COL_G = 145; // colonne gauche (x=293)
  const COL_D = 139; // colonne droite (x=444)
  const champs = [
    { c: ESPECE_BI[a.espece] ?? a.espece, x: 293, ly: 179, max: COL_G },
    { c: nomRace(a.race, a.espece, "bi"), x: 444, ly: 179, max: COL_D },
    { c: couleurBi, x: 293, ly: 230, max: COL_G },
    { c: yeuxBi, x: 444, ly: 230, max: COL_D },
    { c: a.age ? formaterAge(a.age, "bi") : null, x: 293, ly: 284, max: COL_G },
    { c: a.poids ? formaterPoids(a.poids) : null, x: 444, ly: 284, max: COL_D },
    { c: SEXE_BI[a.sexe] ?? a.sexe, x: 293, ly: 336, max: COL_G },
    { c: micropuceBi, x: 444, ly: 336, max: COL_D },
    { c: tempBi, x: 293, ly: 389, max: COL_G },
  ].map((o) => {
    const p = o.c ? o.c.split(" / ") : [];
    return {
      ...o,
      fr: p[0] ?? null,
      en: p.length === 2 && p[0] !== p[1] ? p[1] : null,
    };
  });

  // Tailles uniformes : la plus grande qui fait tenir la valeur la plus longue.
  let sFR = 14;
  let sEN = 11;
  for (const c of champs) {
    if (c.fr) sFR = Math.min(sFR, fit(bold, c.fr, c.max, 14));
    if (c.en) sEN = Math.min(sEN, fit(semi, c.en, c.max, 11));
  }
  const DZ = 29; // décalage de la 1re ligne sous sa légende
  const DE = 42; // décalage de la ligne anglaise
  for (const c of champs) {
    draw(c.fr, c.x, c.ly + DZ, bold, sFR, navy);
    if (c.en) draw(c.en, c.x, c.ly + DE, semi, sEN, blue);
  }

  // Lieu (ville + rue) et date, même style que le français.
  draw(a.ville, 32, 388 + DZ, bold, sFR, navy);
  draw(nomDeRue(a.adresse) || a.dernier_lieu_vu, 32, 388 + DE, bold, sFR, navy);
  draw(formaterDate(a.date_evenement, "fr"), 32, 456 + DZ, bold, sFR, navy);

  // Numéro bleu (le rouge « 1 833 999 AIDE » est pré-imprimé dans le gabarit).
  if (poste) draw(`1 833 999 2433 #${poste}`, 33, 614, bold, 20, blue);
  // Numéro de dossier dans le bandeau rouge (sans #).
  if (dossier) drawRight(dossier, 584, 66, bold, 34, white);

  if (a.photo_url) {
    try {
      const resp = await fetch(a.photo_url);
      const buf = Buffer.from(await resp.arrayBuffer());
      const w = 238,
        h = 236,
        r = 18;
      // Coins arrondis, sans bordure.
      const masque = Buffer.from(
        `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`,
      );
      const cropped = await sharp(buf)
        .resize(w, h, { fit: "cover" })
        .composite([{ input: masque, blend: "dest-in" }])
        .png()
        .toBuffer();
      const img = await pdf.embedPng(cropped);
      page.drawImage(img, { x: 33, y: td(PHOTO_TOP + h), width: w, height: h });
    } catch {
      // Photo inaccessible : on laisse le cadre vide du gabarit.
    }
  }

  const qrPng = await QRCode.toBuffer(`${origin}/annonces/${a.id}`, {
    margin: 0,
    width: 320,
    color: { dark: "#0c5679", light: "#ffffff" },
  });
  const qrImg = await pdf.embedPng(qrPng);
  page.drawImage(qrImg, { x: 450, y: td(488 + 127), width: 127, height: 127 });

  return await pdf.save();
}
