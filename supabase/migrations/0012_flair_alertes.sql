-- ─────────────────────────────────────────────────────────────────────────
-- 0012 — Journal des alertes flAIr envoyées (anti-doublon)
-- Une ligne par paire (perdu, trouvé) déjà notifiée. La contrainte d'unicité
-- sert au dédoublonnage atomique : on n'envoie le courriel que si l'insertion
-- de la paire est nouvelle. Écritures par le serveur (service_role).
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.flair_alertes (
  id uuid primary key default gen_random_uuid(),
  perdu_id uuid not null,
  trouve_id uuid not null,
  created_at timestamptz not null default now(),
  unique (perdu_id, trouve_id)
);

alter table public.flair_alertes enable row level security;
