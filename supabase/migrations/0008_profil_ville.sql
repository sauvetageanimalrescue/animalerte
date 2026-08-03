-- ─────────────────────────────────────────────────────────────────────────
-- 0008 — Ville du profil (pour les alertes géociblées / Sentinelles)
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

-- Profil de publication : prénom et adresse (en plus de nom/courriel/téléphone
-- déjà présents). Ces champs pré-remplissent la section « Vos coordonnées »
-- des annonces. La VILLE, elle, vit désormais dans la table sentinelles (0009).
alter table public.profiles add column if not exists prenom text;
alter table public.profiles add column if not exists adresse text;

-- Colonnes ville héritées d'une version antérieure : conservées mais inutilisées
-- côté profil (la ville sert aux Sentinelles). Sans effet si déjà absentes.
alter table public.profiles add column if not exists ville text;
alter table public.profiles add column if not exists ville_lat double precision;
alter table public.profiles add column if not exists ville_lng double precision;
