-- ─────────────────────────────────────────────────────────────────────────
-- 0008 — Ville du profil (pour les alertes géociblées / Sentinelles)
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists ville text;
alter table public.profiles add column if not exists ville_lat double precision;
alter table public.profiles add column if not exists ville_lng double precision;
