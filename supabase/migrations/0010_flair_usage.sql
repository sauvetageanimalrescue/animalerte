-- ─────────────────────────────────────────────────────────────────────────
-- 0010 — Journal d'utilisation de flAIr (analyse de photo)
-- Sert à limiter le nombre d'analyses par compte et par jour (anti-abus /
-- protection du coût API). Les écritures passent par le serveur (service_role),
-- donc aucune politique publique n'est nécessaire.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.flair_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists flair_analyses_user_created_idx
  on public.flair_analyses (user_id, created_at);

alter table public.flair_analyses enable row level security;
