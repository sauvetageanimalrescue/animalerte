import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import sharp from "sharp";
import * as mupdf from "mupdf";
import type { Annonce } from "@/lib/types";

const DIR = path.join(process.cwd(), "src", "lib", "affiche");
const geist = (poids: string) =>
  fs.readFileSync(path.join(DIR, "fonts", `Geist-${poids}.ttf`));

// Rend un PDF rempli en JPEG haute qualité à la largeur voulue.
async function rendreJpeg(
  pdfBytes: Uint8Array,
  largeurPx: number,
  largeurPt: number,
): Promise<Buffer> {
  const doc = mupdf.Document.openDocument(pdfBytes, "application/pdf");
  const p = doc.loadPage(0);
  const s = largeurPx / largeurPt;
  const pix = p.toPixmap(
    mupdf.Matrix.scale(s, s),
    mupdf.ColorSpace.DeviceRGB,
    false,
  );
  return sharp(Buffer.from(pix.asPNG())).jpeg({ quality: 90 }).toBuffer();
}

async function qrArrondi(url: string): Promise<Buffer> {
  const raw = await QRCode.toBuffer(url, {
    margin: 2,
    width: 380,
    color: { dark: "#0c3d56", light: "#ffffff" },
  });
  const sq = 380,
    r = 38;
  const masque = Buffer.from(
    `<svg width="${sq}" height="${sq}"><rect width="${sq}" height="${sq}" rx="${r}" ry="${r}"/></svg>`,
  );
  return sharp(raw)
    .resize(sq, sq)
    .composite([{ input: masque, blend: "dest-in" }])
    .png()
    .toBuffer();
}

// ---- Carré (Facebook / Instagram), gabarit 600x600 -> 2500x2500 ----
export async function remplirCarre(a: Annonce, origin: string): Promise<Buffer> {
  const pdf = await PDFDocument.load(fs.readFileSync(path.join(DIR, "fb-vide.pdf")));
  pdf.registerFontkit(fontkit);
  const bold = await pdf.embedFont(geist("Bold"));
  const black = await pdf.embedFont(geist("Black"));
  const page = pdf.getPage(0);
  const H = page.getHeight();
  const white = rgb(1, 1, 1);
  const blue = rgb(61 / 255, 135 / 255, 179 / 255);
  const td = (v: number) => H - v;

  const dossier = a.numero_dossier ?? "";
  const poste = dossier ? dossier.replace(/^\d+-/, "") : "";

  if (a.photo_url) {
    try {
      const buf = Buffer.from(await (await fetch(a.photo_url)).arrayBuffer());
      const crop = await sharp(buf).resize(1800, 1344, { fit: "cover" }).png().toBuffer();
      page.drawImage(await pdf.embedPng(crop), { x: 0, y: 70, width: 600, height: 448 });
    } catch {}
  }
  page.drawRectangle({
    x: 0, y: 71, width: 600, height: 18,
    color: rgb(158 / 255, 199 / 255, 221 / 255), opacity: 0.5,
  });
  const logo = await pdf.embedPng(
    fs.readFileSync(path.join(process.cwd(), "public", "logos-combo-blanc-v2.png")),
  );
  const lh = 68,
    lw = (logo.width / logo.height) * lh;
  page.drawImage(logo, { x: 49, y: td(493), width: lw, height: lh, opacity: 0.55 });
  page.drawImage(await pdf.embedPng(await qrArrondi(`${origin}/annonces/${a.id}`)), {
    x: 440, y: td(490), width: 120, height: 120,
  });
  if (dossier) {
    const s = 26,
      w = black.widthOfTextAtSize(dossier, s);
    page.drawText(dossier, { x: 568 - w, y: td(52), size: s, font: black, color: white });
  }
  const num = "1 833 999 2433 ",
    sf = 22;
  page.drawText(num, { x: 30, y: td(572), size: sf, font: bold, color: white });
  if (poste) {
    const wn = bold.widthOfTextAtSize(num, sf);
    page.drawText(`#${poste}`, { x: 30 + wn, y: td(572), size: sf, font: bold, color: blue });
  }
  return rendreJpeg(await pdf.save(), 2500, 600);
}

// ---- Story (vertical), gabarit 259.2x460.8 -> 1080x1920 ----
export async function remplirStory(a: Annonce, origin: string): Promise<Buffer> {
  const pdf = await PDFDocument.load(fs.readFileSync(path.join(DIR, "story-vide.pdf")));
  pdf.registerFontkit(fontkit);
  const black = await pdf.embedFont(geist("Black"));
  const page = pdf.getPage(0);
  const H = page.getHeight();
  const white = rgb(1, 1, 1);
  const td = (v: number) => H - v;
  const dossier = a.numero_dossier ?? "";

  if (a.photo_url) {
    try {
      const buf = Buffer.from(await (await fetch(a.photo_url)).arrayBuffer());
      const crop = await sharp(buf).resize(1037, 856, { fit: "cover" }).png().toBuffer();
      page.drawImage(await pdf.embedPng(crop), { x: 0, y: td(283), width: 259.2, height: 214 });
    } catch {}
  }
  page.drawImage(await pdf.embedPng(await qrArrondi(`${origin}/annonces/${a.id}`)), {
    x: 73.7, y: td(370.8), width: 112, height: 112,
  });
  if (dossier) {
    const s = 24,
      w = black.widthOfTextAtSize(dossier, s);
    page.drawText(dossier, { x: 246 - w, y: td(58), size: s, font: black, color: white });
  }
  return rendreJpeg(await pdf.save(), 1080, 259.2);
}
