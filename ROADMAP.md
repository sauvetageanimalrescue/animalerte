# animALERTE — Plan de route (vision produit)

> Document de travail. Capture la vision au-delà du MVP en ligne (2026-07-30).
> Statut MVP : site bilingue en ligne sur www.animalerte.ca (affichage, recherche,
> carte, comptes, publication perdu/trouvé). La suite structure la valeur ajoutée
> et le modèle de forfaits.

## 0. Positionnement

- **Zone géographique : Québec** (le site reste bilingue FR/EN, mais on cible le Québec).
- Ce n'est **pas** « un service communautaire gratuit ». Il y aura possiblement un
  niveau gratuit limité, puis des forfaits payants qui débloquent des fonctions.

## 1. Modèle de forfaits (DÉCIDÉ)

**Règles de fond :**
- **Paiement par annonce** (ponctuel, à la publication), **pas d'abonnement** pour le
  grand public. (Un abonnement pro/refuge pourra venir plus tard.)
- **Une annonce « TROUVÉ » est toujours gratuite** (maximiser les signalements = la moitié
  des matchs). Seules les alertes **« PERDU »** sont tarifées.
- L'échelle des forfaits = l'échelle de **portée** de la diffusion.

| Fonction | **Gratuit** | **Base** | **Régional** | **Provincial** |
|---|:--:|:--:|:--:|:--:|
| **Prix** | **0 $** | **49,99 $** | **149,99 $** | **249,99 $** |
| Fiche sur animalerte.ca (recherche + carte) | ✅ | ✅ | ✅ | ✅ |
| Photos | 1 | plusieurs | plusieurs + **vidéo** | plusieurs + vidéo |
| Courriel éducatif « quoi faire » | ✅ | ✅ | ✅ | ✅ |
| Kit d'affiches (PDF 8,5×11 + carré + story + caption + QR + code) | — | ✅ | ✅ (+ infos : micropuce, récompense…) | ✅ complet |
| Ligne sans frais anonyme (code d'animal) | — | ✅ | ✅ | ✅ |
| **Pub Facebook géo-ciblée payante** | — | petit rayon | rayon moyen (~10-25 km) | **tout le Québec** |
| Réseau **Sentinelle** du secteur | — | — | ✅ | ✅ |
| Diffusion page FB **Sauvetage Animal Rescue (112 k)** | — | — | — | ✅ |
| Alerte **SPCA** provinciale + matching IA prioritaire | — | — | — | ✅ |
| Messagerie anonyme finder ↔ propriétaire | — | ✅ | ✅ | ✅ |

> ⚠️ Les forfaits payants incluent un **budget de pub Meta** : prix = budget pub + marge.
> À valider avec le coût réel des pubs (benchmark PawBoost + CPM Meta) pour dimensionner
> le budget/rayon de chaque niveau — surtout Provincial (249,99 $) qui couvre tout le Québec.

**Raffinements forfaits (2026-07-31) :**
- Noms des 4 niveaux = **Gratuit / Alerte locale / Alerte régionale / Alerte provinciale** (terminologie uniforme partout).
- **Rayons** : locale = **5 km**, régionale = **25 km**, provinciale = tout le Québec.
- **flAIr** débloqué dès l'**Alerte régionale** (plus seulement Provincial).
- **Une seule affiche pour tous** (pas de versions « enrichies ») : « affiche imprimable + image pour réseaux sociaux ». Elle doit être **riche/complète/belle** même au niveau de base. Les champs exacts de l'affiche restent à valider.
- Provinciale : Facebook SAR **sans afficher le nombre d'abonnés** (info changeante). **SPCA / services animaliers** = font partie de la diffusion des alertes provinciales, mais **pas mentionnés dans l'offre pour l'instant**.
- **Courriel de conseils** (ancien « quoi faire quand on perd son animal »).
- Nouveau perk **Provincial : « Signalement prioritaire »** — les annonces provinciales apparaissent dans une section **« Signalements prioritaires »** en haut de l'accueil, avant « Signalements récents ». *Nécessite un champ de priorité sur les annonces (lié au forfait/paiement) — section d'accueil à construire quand ce mécanisme existera.*

## 2. Fonctionnalités (backlog groupé)

### A. Kit de diffusion (médias multi-formats) + code QR
Même source de données → **plusieurs médias générés automatiquement** pour chaque animal :
- **Affiche imprimable 8,5 × 11 (PDF)** — impression, babillards, cliniques véto.
- **Carré 1080 × 1080 px (PNG)** — fil Facebook / Instagram.
- **Story vertical 1080 × 1920 px (PNG)** — stories FB/IG, Reels, TikTok.
- **Caption prête** (FR + EN) à copier-coller : nom, ville, dernier lieu vu, lien court/QR,
  hashtags. → permet une diffusion **manuelle** immédiate (voir B, phase 1).
- **Code QR unique par animal** + **code d'animal** court → ramènent vers la fiche.
- Forfaits élevés = plus de champs sur les médias (micropuce, récompense, etc.).
- *Faisabilité : élevée.* Images sociales via **Satori / @vercel/og** (PNG depuis un
  gabarit JSX) ; PDF via `@react-pdf/renderer`. QR = lib triviale.
- **Référence (directionnelle, pas un gabarit à copier)** : ancienne affiche « PERDU /
  LOST » de Sauvetage Animal Rescue — montre les champs et l'esprit. Le look animALERTE
  sera refait, plus propre, à sa marque (logo animALERTE, numéro sans frais, QR, code).
- **Champs structurés révélés par l'affiche** (à ajouter au modèle, débloqués par forfait) :
  n° de dossier (date+séquence), âge, poids, signes distinctifs, stérilisé (oui/non),
  micropuce (oui/non + **numéro** sur forfaits élevés), collier/harnais, tempérament,
  dernier endroit vu, adresse précise de disparition, **récompense offerte** (oui/non).
  Le gratuit montre l'essentiel ; les forfaits élevés débloquent tous ces champs.

### B. Diffusion sur les réseaux sociaux
- Niveaux : site seulement → + page Facebook animALERTE → + page Facebook SAR (112 k).
- **Phase 1 (rapide, sans API)** : le kit de diffusion (A) fournit images + caption prêtes ;
  Éric publie **manuellement** sur FB/IG/TikTok. Débloque la valeur sans attendre Meta.
- **Phase 2 (plus tard)** : publication **automatique** via l'API Meta Graph (token de page
  + revue d'app Meta — prévoir des semaines de délai). Pages qu'on possède : animALERTE puis SAR.
  La diffusion sur SAR (112 k abonnés) = argument de vente fort du forfait Complet.
- *Faisabilité : phase 1 élevée (dépend de A), phase 2 moyenne (revue Meta).*

**B-bis. Publicité géo-ciblée payante (mécanique clé de diffusion + croissance)**
- Au lieu (ou en plus) du courriel de masse : **payer une pub Facebook/Instagram** ciblée
  sur un **rayon** autour du lieu de perte. Le forfait détermine le budget/portée :
  local = petit budget · régional (~10 km) = moyen · provincial (tout le QC) = gros.
- **Règle le problème du spam** (pas de courriel froid, pas de LCAP, pas de réputation à risque).
- Le **ciblage par rayon** est natif chez Meta → colle exactement au modèle de forfaits.
- **Flywheel** : chaque pub sponsorisée affiche la marque animALERTE → notoriété + nouveaux
  abonnés. *Les clients financent la promotion de la plateforme.* Croissance auto-alimentée.
- **Manuel d'abord** : créer la pub à la main dans Meta Ads Manager avec le visuel du kit (A) +
  rayon + budget du forfait ; automatiser plus tard via **Meta Marketing API** (compte pub +
  revue Meta). Bon à savoir : révision Meta de chaque pub (minutes-heures) ; CPM fluctue →
  fixer les prix avec un coussin ; une pub = de la *portée*, pas une garantie de retrouver l'animal.
- **Complémentarité** : pubs = grand public du secteur ; réseau d'adhérents (C) = professionnels
  (vétos/animaleries/SPCA) chez qui un animal trouvé aboutit. Les deux couvrent des publics distincts.

### C. Annuaire du réseau + alertes géographiques par rayon
- **Annuaire** `points_reseau` : type (vétérinaire / animalerie / service animalier),
  nom, adresse, **lat/lng**, courriel, statut d'adhésion.
  - Sources : **OMVQ** (vétérinaires), **API Google Places** (animaleries/magasins,
    adresses déjà géocodées), compilation manuelle (SPCA, fourrières municipales).
  - Géocodage en lot (adresse → GPS) une fois, puis maintenu. Répond aussi à « quel
    service dessert le secteur selon l'espèce ».
- **Rayon** (PostGIS `ST_DWithin`, requête instantanée) selon le forfait :
  - aucune (gratuit) ; **régionale** (~10 km : vétos, animaleries, services + utilisateurs
    inscrits du secteur → « réseau ») ; **provinciale** (tout le Québec / SPCA).
- **Identité des membres (marque) — NOM RETENU : « Sentinelle » / « Sentinel »** (bilingue,
  fonctionne pour individus *et* commerces : « clinique sentinelle »). CTA « Devenir Sentinelle » ;
  badge de profil ; compteur social « X sentinelles veillent près de chez vous » sur les fiches
  (levier émotionnel + preuve sociale).
- **⚠️ Enjeu spam — critique.** Envoi de masse froid = risque **LCAP** (loi anti-pourriel)
  + destruction de la **réputation d'envoi** (blocklist → même les alertes aux propriétaires
  tombent en spam). **Solution : réseau sur ADHÉSION (opt-in).** On invite les cliniques/
  commerces à *adhérer* gratuitement (gagnant pour eux : visibilité, achalandage). Conforme
  LCAP + délivrabilité préservée + argument de partenariat.
- **Canaux d'envoi** : courriel via service transactionnel authentifié (**Resend/Postmark**,
  SPF/DKIM/DMARC, un envoi par destinataire, jamais de gros BCC). **Fax** possible comme
  canal secondaire ciblé vétos (contourne les filtres anti-spam ; API Documo/Phaxio).
  **Jamais** par téléphone.
- *Faisabilité : rayon = élevée ; annuaire + adhésions = chantier de contenu ; envois = élevée.*

### D. Messagerie anonyme finder ↔ propriétaire
- Boîte de réception sur le site, sans échanger de numéro de téléphone (anonymat).
- *Faisabilité : moyenne.* Table de messages + relais courriel, sans exposer les coordonnées.

### E. Médias multiples
- Gratuit = 1 photo ; forfaits élevés = plusieurs photos, voire une **vidéo**.
- *Faisabilité : élevée.* Nouvelle table `annonce_medias` + limites selon le forfait.

### F. Courriels automatisés
- **À l'inscription / au signalement** : courriel éducatif « quoi faire quand on perd
  son animal » + conseils (candidat au niveau gratuit comme valeur d'entrée).
- **Alerte de proximité** : courriel à l'utilisateur quand un animal est trouvé dans son secteur.
- *Faisabilité : élevée.* Service type **Resend** (distinct des courriels d'auth Supabase).

### G. Matching IA — « flAIr »
**flAIr** = seule marque publique du matching IA, stylisée **fl·AI·r** (« AI » dans le mot,
même logique typo que anim**ALERTE**). « flair » = instinct de détection, identique FR/EN.
flAIr se base sur la **géolocalisation** + le **visage** de l'animal (robe, motif, dessins du
visage, **couleur des yeux** — crucial chez le chat → c'est vraiment un « face match »).
*Noms « FaceMatch / AreaMatch » abandonnés : trop génériques, pas ownable. Le géo et le
visage sont juste le fonctionnement interne, pas des marques.*

**Logo flAIr** : wordmark seul (pas de pictogramme) — `fl` marine + `AI` rouge + `r` marine,
gras. Fichier `public/flair-logo.svg`. Le `f` minuscule évoque subtilement Facebook (capital
de confiance) — jouer ça *subtil*, garder le marine (pas le bleu FB) pour éviter tout risque
de marque et rester dans la famille animALERTE.

**Positionnement marketing — « flAIr flaire »** (le mot = métaphore du museau infatigable) :
- **Slogan principal : « flAIr renifle » / « flAIr sniffs »** (court, actif).
- Ligne signature (courriel d'alerte) : **« flAIr a reniflé une piste. »** / « flAIr caught a
  scent. » (Éric préfère « reniflé » à « flairé ».)
- Autres slogans (à fignoler plus tard) : « Pendant que vous cherchez, flAIr renifle » ;
  « flAIr garde le museau au vent » ; « flAIr has a nose for reunions ».
- Pitch bénéfice (jamais « géoloc + reconnaissance faciale ») : « flAIr reconnaît le visage de
  votre animal — sa robe, son motif, *jusqu'à la couleur de ses yeux* — et veille sur votre
  secteur sans relâche. » Le détail « jusqu'à la couleur des yeux » impressionne (précision).

**Pas besoin de biométrie militaire** — c'est du « ça se ressemble », en 3 couches :
1. **Attributs structurés** (espèce, couleur/robe, taille, sexe, marques) — livre ~80 % de la valeur.
2. **Géo + temps** : ne comparer qu'avec les animaux trouvés dans le secteur, récemment.
3. **Similarité visuelle** : empreinte d'image (vision IA) stockée dans **pgvector** (Supabase),
   comparée par similarité cosinus → « il lui ressemble ». C'est la couche vendue comme
   « reconnaissance faciale » (honnête : ça utilise vraiment de la vision par IA).
- **UX : flAIr *suggère*, l'humain *confirme*.** Courriel « un animal trouvé pourrait être le
  vôtre — est-ce lui ? » + photo. Gère les faux positifs, rassure.
- **Livraison en phases** :
  - **Phase 1 (facile, grande valeur)** : alerte courriel « animal trouvé correspondant à ta
    description, près de chez toi » = attributs + géo + temps, **aucune IA visuelle requise**.
  - **Phase 2 (« wow »)** : ajoute la similarité visuelle → « …et il lui ressemble » (forfait Provincial).
  - Phase 3 (si jamais nécessaire) : modèle dédié aux visages d'animaux.
- Possibilité d'utiliser la **vision de Claude** pour décrire/comparer les animaux (v1 explicable).

### H. Paiements
- Plateforme de paiement + gestion transactionnelle (**Stripe** recommandé).
- Décision clé : **paiement par annonce** (ponctuel) vs **abonnement**. Le cas d'usage
  (perte occasionnelle) penche vers le paiement par annonce, à la publication.

### I. Ligne téléphonique sans frais (IVR + appel masqué)
- **Un seul numéro sans frais** (1-8xx) imprimé sur toutes les affiches.
- Le finder appelle, entre le **code à 4 chiffres** de l'animal (menu vocal FR/EN),
  et l'appel est **transféré vers le cellulaire du propriétaire** — sans jamais
  exposer les numéros de part et d'autre (anonymat, rejoint la fonction D).
- **Zéro gestion manuelle** : le lien « code → propriétaire » vit dans la base ; à
  chaque appel, un webhook du site répond à Twilio qui faire sonner. Une annonce
  résolue cesse de router.
- Bonus : message vocal + **SMS** au propriétaire si pas de réponse.
- *Faisabilité : élevée.* Pattern classique **Twilio** (numéro masqué + IVR/DTMF).
  Coût : numéro sans frais (~qq $/mois) + tarif à la minute. Fonction de forfait payant.
- **Bloc partagé** : un **« code public / numéro d'animal »** court (4-6 chiffres) par
  annonce, réutilisé par l'affiche, le QR et le téléphone. Réutiliser les codes des
  annonces résolues pour garder 4 chiffres, ou passer à 5-6 chiffres.

### J. Croissance / acquisition
- **Idée à garder — SMS de notoriété** : collecter les numéros publiés dans les annonces
  d'animaux perdus ailleurs (ex. groupes Facebook) et envoyer un SMS présentant animALERTE
  à ces personnes (clients potentiels).
- **⚠️ Drapeau légal MAJEUR** : le SMS commercial non sollicité est le canal le **plus risqué**
  — LCAP (consentement requis, amendes lourdes) + règles opérateurs (A2P/10DLC exigent un
  opt-in ; blocage/bannissement du numéro). Cold SMS = quasi certainement non conforme sans consentement.
- **Pistes conformes à explorer** : ne contacter que les gens qui viennent à nous ; reformuler
  comme entraide avec opt-out clair et immédiat ; valider avec un conseiller juridique avant tout envoi.

### K. Page d'accueil marketing — ✅ CONSTRUITE
- Hero + accroche USP « la seule plateforme au Québec propulsée par flAIr », section **flAIr**
  (« flAIr renifle », les 3 forces, pitch « jusqu'à la couleur des yeux »), section **« Jusqu'où
  va votre alerte ? »** (web → FB animALERTE → FB SAR 112 k → provincial), bandeau **Sentinelles**.
- Textes bilingues (namespace `marketing`). Composant `FlairWord`. Logo flAIr : `public/flair-logo.svg`.
- ⚠️ Décrit des fonctions pas encore livrées (flAIr, forfaits, Sentinelles) — décider avant la
  mise en ligne : lancer tel quel (vision) ou nuancer certaines en « bientôt ».

## 3. Séquencement suggéré (des fondations vers l'ambitieux)

1. **Fondations forfaits** : notion de forfait sur l'annonce + limites (photos), champ payé.
2. **Affiche PDF + QR** (valeur visible, faisabilité élevée, autonome).
3. **Courriel éducatif gratuit** + service courriel (Resend).
4. **Paiements Stripe** (débloque les forfaits payants pour de vrai).
5. **Médias multiples / vidéo**.
6. **Diffusion Facebook** (animALERTE puis SAR).
7. **Alertes géo par rayon** (PostGIS) + annuaire des services par secteur/espèce.
8. **Messagerie anonyme**.
9. **Matching IA** (phase R&D).

## 3-bis. Concurrents à étudier (benchmark)

Les plus proches du modèle animALERTE :
- **PawBoost** (US) — fiche gratuite + boost payant via **pubs Facebook ciblées** par secteur + réseau « Rescue Squad ». *Modèle de pub payante quasi identique — à disséquer.*
- **PetAlert** (France/Belgique) — réseau de **pages Facebook régionales** (par département). *Modèle de diffusion sociale régionale.*
- **FindToto / Pet Amber Alert** (US) — **alertes en masse (appels/courriels)** aux voisins dans un **rayon**, forfaits selon la portée.
- **Petco Love Lost** (ex-Finding Rover, US) — base nationale + **reconnaissance faciale IA** perdu/trouvé.

Aussi pertinents :
- **DoglostUK** (UK) — réseau de **bénévoles** + affiches (proche des « Sentinelles »).
- **HomeAgain / Lost My Doggie / 24Petwatch** (US) — alertes aux vétos/refuges, liées à la **micropuce**.
- **Filalapat (I-CAD)** (France) — registre officiel lié à l'identification.
- **Nextdoor + groupes Facebook locaux** — concurrence gratuite, hyperlocale, mais désorganisée.

**Différenciation animALERTE** : personne ne *combine* tout ça. Atouts = (1) local Québec +
bilingue français d'abord ; (2) page SAR 112 k abonnés (audience de départ unique) ; (3) offre
intégrée (kit d'affiches + pubs géo-ciblées + ligne sans frais anonyme + matching IA + réseau
Sentinelle) ; (4) flywheel « le client finance la pub de la plateforme » (validé par PawBoost).

## 4. Questions ouvertes à trancher

**Décidé :** modèle = paiement par annonce (pas d'abonnement) · « Trouvé » gratuit ·
4 niveaux (Gratuit / Base 49,99 / Régional 149,99 / Provincial 249,99) · nom réseau = Sentinelle.

**Encore ouvert :**
1. **Restriction géo** : garde-t-on toutes les provinces dans les filtres, ou on limite
   au Québec (régions du Québec plutôt que provinces) ?
2. **Réseau Sentinelle** : d'où viennent les adhérents (recrutement, annuaire manuel au départ) ?
3. **Annuaire des services par secteur/espèce** : source des données (SPCA, municipalités, OMVQ) ?
4. **Budget pub par forfait** : montant Meta réel inclus dans chaque niveau (dépend du benchmark).
5. **Priorité de construction #1** : par quelle brique on commence à coder ?
