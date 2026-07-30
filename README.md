# animALERTE

Site communautaire bilingue (FR/EN) pour **signaler et retrouver les animaux
de compagnie perdus au Canada**. Consultation publique ; la publication d'une
annonce demande un compte.

## Fonctionnalités

- Signaler un animal **perdu** ou **trouvé** (photo, espèce, lieu, date, contact)
- **Recherche** avec filtres (type, espèce, province, ville, statut, mot-clé)
- **Carte** des signalements (Leaflet + OpenStreetMap)
- Fiche détaillée avec coordonnées de contact et carte
- Gestion de ses annonces (marquer résolu, supprimer)
- Interface **bilingue** français / anglais (routes `/fr` et `/en`)

## Stack

| Élément | Techno |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Base de données, auth, stockage | Supabase |
| Style | Tailwind CSS 4 |
| Carte | Leaflet + react-leaflet + OpenStreetMap |
| i18n | next-intl |
| Icônes | @tabler/icons-react |

> Next.js 16 : le « middleware » s'appelle désormais **proxy** (`src/proxy.ts`).

## Mise en route

### 1. Variables d'environnement

Copiez `.env.example` vers `.env.local` et remplissez les clés Supabase
(Tableau de bord Supabase → *Project Settings* → *API*) :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> Un `.env.local` de démonstration (valeurs bidon) est fourni pour lancer
> l'interface sans backend ; remplacez-le par vos vraies clés pour que la
> recherche, l'auth et la publication fonctionnent.

### 2. Base de données

Dans l'éditeur SQL Supabase, collez le contenu de
[`supabase/migrations/0001_schema_initial.sql`](supabase/migrations/0001_schema_initial.sql)
et exécutez-le. La migration est **idempotente** (rejouable sans erreur) et crée :

- les tables `profiles` et `annonces` + leurs politiques RLS ;
- le trigger de création automatique du profil à l'inscription ;
- le bucket de stockage public `photos`.

Dans *Authentication → Providers*, activez le fournisseur **Email**. Pour un
test rapide sans courriel de confirmation, désactivez *Confirm email* ; sinon
l'utilisateur doit confirmer son adresse avant de se connecter.

### 3. Développement

```bash
npm install
npm run dev
```

L'app démarre sur http://localhost:3000 (redirige vers `/fr`).

### 4. Build de production

```bash
npm run build
```

> Toujours lancer `npm run build` avant de déployer : le mode dev ne détecte
> pas certaines erreurs TypeScript qui bloquent le build Vercel.

## Déploiement (Vercel)

1. Importez le dépôt dans Vercel.
2. Ajoutez les trois variables d'environnement ci-dessus.
3. Déployez — aucune configuration supplémentaire requise.

## Structure

```
src/
  proxy.ts                 # locale (next-intl) + rafraîchissement session Supabase
  i18n/                    # routing, navigation, chargement des messages
  lib/
    supabase/              # clients browser / server / admin
    actions/               # Server Actions (auth, annonces)
    annonces.ts            # accès aux données
    constants.ts, types.ts # domaine (espèces, provinces, statuts…)
  components/              # en-tête, carte, formulaires, cartes d'annonce
  app/[locale]/            # pages : accueil, recherche, annonces/[id],
                           #         signaler, mes-annonces, connexion, inscription
messages/                  # fr.json, en.json
supabase/migrations/       # schéma SQL (à coller dans Supabase)
```

## Logo

Le mark du logo est recréé en SVG dans [`src/components/logo.tsx`](src/components/logo.tsx).
Pour utiliser le PNG officiel, déposez-le dans `public/` et remplacez
`<LogoMark />` par une balise `<Image>`.
