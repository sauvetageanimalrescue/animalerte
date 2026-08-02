-- ─────────────────────────────────────────────────────────────────────────
-- 0006 — Forfait + suivi de paiement Stripe sur les annonces
-- Idempotent : peut être ré-exécuté sans erreur.
-- ─────────────────────────────────────────────────────────────────────────

-- Forfait choisi pour l'annonce. Par défaut « gratuit ».
-- Devient un forfait payant seulement après confirmation du paiement (webhook).
alter table public.annonces
  add column if not exists forfait text not null default 'gratuit';

-- Suivi du paiement (pour les forfaits payants).
alter table public.annonces
  add column if not exists paye boolean not null default false;

alter table public.annonces
  add column if not exists paye_at timestamptz;

-- Référence de la session Stripe Checkout (réconciliation via le webhook).
alter table public.annonces
  add column if not exists stripe_session_id text;

-- Validation des valeurs de forfait.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'annonces_forfait_valide'
  ) then
    alter table public.annonces
      add constraint annonces_forfait_valide
      check (forfait in ('gratuit', 'locale', 'regional', 'provincial'));
  end if;
end $$;

create index if not exists annonces_forfait_idx on public.annonces (forfait);
