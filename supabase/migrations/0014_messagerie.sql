-- ─────────────────────────────────────────────────────────────────────────
-- 0014 — Messagerie anonyme (fils de conversation)
-- Une conversation relie le propriétaire d'une annonce à un « trouveur » (bon
-- samaritain sans compte). Les deux courriels restent chez animALERTE et ne
-- sont JAMAIS échangés : le trouveur accède à son fil par un jeton privé, le
-- propriétaire par son compte. Toutes les écritures passent par le serveur
-- (service_role) ; aucune politique publique.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid not null references public.annonces(id) on delete cascade,
  proprietaire_id uuid not null,
  trouveur_courriel text not null,
  trouveur_jeton text not null unique,
  dernier_message_par text,
  dernier_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (annonce_id, trouveur_courriel)
);

create index if not exists conversations_proprietaire_idx
  on public.conversations (proprietaire_id, dernier_message_at desc);

alter table public.conversations enable row level security;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  expediteur text not null check (expediteur in ('proprietaire', 'trouveur')),
  corps text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;
