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
import { COULEURS, formaterAge, formaterPoids } from "@/lib/champs";
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
  const nom = a.nom_animal || ESPECE_BI[a.espece] || a.espece;

  draw(nom, 293, 170, black, fit(black, nom, 290, 34), navy);

  // Valeurs en français seulement (l'affiche bilingue surchargeait trop la mise
  // en page). On prend la partie française, avant « / ».
  const tCoulFr = await getTranslations({ locale: "fr", namespace: "couleurs" });
  const couleurFr =
    a.couleur && (COULEURS as readonly string[]).includes(a.couleur)
      ? tCoulFr(a.couleur)
      : a.couleur;

  const COL_G = 150; // largeur dispo colonne gauche (x=293 → avant x=444)
  const COL_D = 138; // largeur dispo colonne droite (x=444 → bord droit)
  const grille = [
    { t: ESPECE_BI[a.espece] ?? a.espece, x: 293, base: 212, maxW: COL_G },
    { t: nomRace(a.race, a.espece, "fr"), x: 444, base: 212, maxW: COL_D },
    { t: SEXE_BI[a.sexe] ?? a.sexe, x: 293, base: 257, maxW: COL_G },
    { t: couleurFr, x: 444, base: 257, maxW: COL_D },
    { t: a.age ? formaterAge(a.age, "fr") : null, x: 293, base: 301, maxW: COL_G },
    { t: a.poids ? formaterPoids(a.poids) : null, x: 444, base: 301, maxW: COL_D },
  ].map((c) => ({ ...c, fr: c.t ? c.t.split(" / ")[0] : null }));

  // Taille uniforme de TOUTE l'information de l'affiche : 11 pt partout.
  // (11 pt fait tenir même les valeurs les plus longues sans troncature.)
  const TAILLE = 11;
  for (const c of grille) {
    if (c.fr) draw(c.fr, c.x, c.base, semi, TAILLE, navy);
  }
  // Signes distinctifs : texte libre ; rétréci sous 11 pt seulement si très long.
  draw(
    a.signes_distinctifs,
    293,
    347,
    semi,
    a.signes_distinctifs ? fit(semi, a.signes_distinctifs, 290, TAILLE) : TAILLE,
    navy,
  );
  // MESSAGE (293, 393) : laissé vide (pas de colonne « message » en BD).

  draw(a.ville, 32, 418, bold, TAILLE, navy);
  draw(nomDeRue(a.adresse) || a.dernier_lieu_vu, 32, 436, bold, TAILLE, navy);
  draw(formaterDate(a.date_evenement, "fr"), 32, 486, bold, TAILLE, navy);

  if (poste) draw(`1 833 999 2433  #${poste}`, 32, 618, bold, 22, blue);
  if (dossier) drawRight(dossier, 583, 70, bold, 32, white);

  if (a.photo_url) {
    try {
      const resp = await fetch(a.photo_url);
      const buf = Buffer.from(await resp.arrayBuffer());
      const w = 238,
        h = 240,
        r = 16;
      const masque = Buffer.from(
        `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`,
      );
      const cropped = await sharp(buf)
        .resize(w, h, { fit: "cover" })
        .composite([{ input: masque, blend: "dest-in" }])
        .png()
        .toBuffer();
      const img = await pdf.embedPng(cropped);
      page.drawImage(img, { x: 31, y: td(370), width: w, height: h });
    } catch {
      // Photo inaccessible : on laisse le cadre vide du gabarit.
    }
  }

  const qrPng = await QRCode.toBuffer(`${origin}/annonces/${a.id}`, {
    margin: 0,
    width: 300,
    color: { dark: "#0c3d56", light: "#ffffff" },
  });
  const qrImg = await pdf.embedPng(qrPng);
  page.drawImage(qrImg, { x: 450, y: td(618), width: 129, height: 129 });

  return await pdf.save();
}
