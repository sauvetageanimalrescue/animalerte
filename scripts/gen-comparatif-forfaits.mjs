// Génère public/comparatif-forfaits.pdf (le comparatif des forfaits téléchargé
// depuis la page /forfaits). Source unique : modifier les données ci-dessous,
// puis régénérer.
//
//   node scripts/gen-comparatif-forfaits.mjs /tmp/comparatif.html
//   chrome --headless --disable-gpu --no-pdf-header-footer \
//     --print-to-pdf=public/comparatif-forfaits.pdf file:///tmp/comparatif.html
//
// Tenir en phase avec les points de forfait (messages/*.json → forfaits.*.points)
// et la carte des accès (src/lib/forfaits.ts → REQUIS).
import { writeFileSync } from "node:fs";

const COLS = [
  { nom: "Gratuit", prix: "0 $", c: "#647d94" },
  { nom: "Locale", prix: "49,99 $", c: "#3d87b3" },
  { nom: "Régionale", prix: "149,99 $", c: "#0c5679" },
  { nom: "Provinciale", prix: "249,99 $", c: "#ce1f2b" },
];

// Chaque rangée : titre, description, 4 cellules (check | dash | texte), et
// options d'apparence (fond ombré, barre rouge à gauche) pour coller au design.
const ROWS = [
  { t: "Annonce sur animalerte.ca", d: "Votre animal est publié dans notre répertoire public d'animaux perdus, consultable par toute la communauté.", v: ["check", "check", "check", "check"] },
  { t: "Photos", d: "Nombre de photos affichées dans la fiche détaillée de votre animal sur animalerte.ca.", v: ["1", "2", "3", "4"], shaded: true },
  { t: "Courriel de conseils", d: "Un courriel qui réunit tous les conseils de nos experts en animaux perdus : chaque geste à poser pour maximiser vos chances de retrouver votre animal.", v: ["check", "check", "check", "check"] },
  { t: "Affiche intelligente", d: "Une affiche conçue automatiquement par le système, prête à imprimer, avec toutes les informations dessus. Imprimez-la à la maison ou apportez le fichier chez un imprimeur, puis posez-la dans votre secteur.", v: ["dash", "check", "check", "check"], shaded: true, bar: true },
  { t: "Publication et images pour les réseaux sociaux", d: "Le système génère automatiquement les images prêtes à utiliser ainsi qu'une publication déjà rédigée : il ne vous reste qu'à copier-coller sur vos réseaux sociaux.", v: ["dash", "dash", "check", "check"], shaded: true, bar: true },
  { t: "Ligne sans frais 1 833 999 AIDE", d: "Un numéro sans frais qui paraît sur vos affiches et publications. La personne qui trouve votre animal appelle cette ligne, qui la dirige vers vous sans jamais dévoiler votre numéro personnel.", v: ["dash", "check", "check", "check"] },
  { t: "Messagerie anonyme", d: "Recevez dans votre compte les messages des gens qui croient avoir vu votre animal, sans dévoiler vos coordonnées.", v: ["check", "check", "check", "check"] },
  { t: "Alerte · Diffusion Sentinelle", d: "Une alerte envoyée sur notre réseau interne géolocalisé selon le lieu de la disparition : utilisateurs d'animALERTE, boutiques pour animaux, vétérinaires et services animaliers du secteur.", v: ["dash", "5 km", "25 km", "Québec"] },
  { t: "Alerte · Publicité ciblée Meta", d: "Meta met à notre disposition la diffusion d'une publication de votre animal perdu, dans un rayon de 5 km, 25 km ou à l'échelle de la province, sur les téléphones, tablettes et ordinateurs des utilisateurs de Facebook et Instagram.", v: ["dash", "5 km", "25 km", "Québec"] },
  { t: "flAIr · jumelage par intelligence artificielle", d: "L'intelligence artificielle d'animALERTE analyse le visage de votre chat ou chien (oreilles, museau, couleur et motif du pelage, couleur des yeux) pour le comparer aux animaux trouvés et vous alerter dès qu'un animal pourrait correspondre au vôtre.", v: ["dash", "dash", "check", "check"], shaded: true },
  { t: "Annonce prioritaire", d: "Votre fiche apparaît en tête de la liste des animaux perdus, sur la page d'accueil comme dans la recherche, pour un maximum de visibilité.", v: ["dash", "dash", "check", "check"] },
  { t: "Diffusion partenaire", d: "animALERTE est en partenariat avec Sauvetage Animal Rescue, un organisme québécois dont la page rassemble une vaste communauté d'amoureux des animaux. Lors d'une alerte provinciale, votre publication y est partagée.", v: ["dash", "dash", "dash", "check"], shaded: true },
];

const check = (c) =>
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;

const cell = (val, c) => {
  if (val === "check") return check(c);
  if (val === "dash") return `<span class="dash">—</span>`;
  return `<span class="val" style="color:${c}">${val}</span>`;
};

const headRow = COLS.map(
  (col) =>
    `<th><div class="pill" style="background:${col.c}"><span class="pn">${col.nom}</span><span class="pp">${col.prix}</span></div></th>`,
).join("");

const bodyRows = ROWS.map((r) => {
  const cls = [r.shaded ? "shaded" : "", r.bar ? "bar" : ""].filter(Boolean).join(" ");
  const cells = r.v.map((val, i) => `<td class="cc">${cell(val, COLS[i].c)}</td>`).join("");
  return `<tr class="${cls}">
    <td class="feat"><div class="ft">${r.t}</div><div class="fd">${r.d}</div></td>
    ${cells}
  </tr>`;
}).join("\n");

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  @page { size: Letter; margin: 8mm 11mm 7mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2a30; }

  .top { display: flex; align-items: flex-end; justify-content: space-between; }
  .brand { font-size: 22pt; font-weight: 800; letter-spacing: -0.5px; }
  .brand .a { color: #0c5679; } .brand .r { color: #ce1f2b; }
  .title { font-size: 17pt; font-weight: 800; color: #08405c; }
  .sub { margin: 4px 0 8px; color: #5b6b74; font-size: 9pt; }

  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  col.feat { width: 40%; }
  th { vertical-align: bottom; padding: 0 4px 6px; }
  .pill { border-radius: 9px 9px 0 0; padding: 6px 4px; text-align: center; color: #fff; }
  .pn { display: block; font-size: 11pt; font-weight: 800; }
  .pp { display: block; font-size: 8.5pt; font-weight: 600; opacity: .95; margin-top: 1px; }

  tbody tr { border-bottom: 1px solid #e7eef2; }
  tbody tr.shaded { background: #f4f8fb; }
  tbody tr.bar td.feat { box-shadow: inset 4px 0 0 #ce1f2b; }
  td { padding: 4px 8px; vertical-align: middle; }
  td.feat { padding-left: 12px; }
  .ft { font-weight: 700; color: #223038; font-size: 9.5pt; }
  .fd { margin-top: 1px; color: #6a7a83; font-size: 7.3pt; line-height: 1.28; }
  td.cc { text-align: center; }
  td.cc svg { vertical-align: middle; }
  .dash { color: #b3c1c9; font-weight: 700; }
  .val { font-weight: 800; font-size: 11pt; }

  .footer { margin-top: 7px; text-align: center; }
  .f1 { font-weight: 700; color: #33434c; font-size: 9.5pt; }
  .f2 { margin-top: 2px; color: #7a8a95; font-size: 8.5pt; }
</style>
</head>
<body>
  <div class="top">
    <span class="brand"><span class="a">anim</span><span class="r">ALERTE</span></span>
    <span class="title">Comparatif des forfaits</span>
  </div>
  <p class="sub">Signaler un animal perdu : choisissez la portée de diffusion qui vous convient.</p>

  <table>
    <colgroup><col class="feat"><col><col><col><col></colgroup>
    <thead>
      <tr><th class="feat" style="text-align:left;font-size:11pt;font-weight:800;color:#223038;vertical-align:bottom;padding-bottom:14px">Fonctions incluses</th>${headRow}</tr>
    </thead>
    <tbody>
      ${bodyRows}
    </tbody>
  </table>

  <div class="footer">
    <div class="f1">Les annonces « Trouvé » sont toujours gratuites.&nbsp;&nbsp;·&nbsp;&nbsp;Paiement unique par annonce, sans abonnement.</div>
    <div class="f2">animalerte.ca&nbsp;&nbsp;·&nbsp;&nbsp;1 833 999 AIDE</div>
  </div>
</body>
</html>`;

const out = process.argv[2];
writeFileSync(out, html);
console.log("wrote " + out);
