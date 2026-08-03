-- ─────────────────────────────────────────────────────────────────────────
-- 0009 — Sentinelles : inscription légère (sans compte) pour recevoir les
-- alertes géociblées selon la ville. Les insertions passent par le serveur
-- (clé service_role), donc aucune politique publique n'est nécessaire.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.sentinelles (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  courriel text not null,
  telephone text,
  ville text,
  ville_lat double precision,
  ville_lng double precision,
  created_at timestamptz not null default now()
);

create index if not exists sentinelles_courriel_idx on public.sentinelles (courriel);
create index if not exists sentinelles_ville_idx on public.sentinelles (ville);

alter table public.sentinelles enable row level security;
