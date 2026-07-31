-- AnimAlerte — champs enrichis de la fiche + numéro de dossier.
-- Migration idempotente (à coller dans l'éditeur SQL Supabase).

-- ─────────────────────────────────────────────────────────────────────────
-- Numéro de dossier : format « 26-000000 » (année 26 + séquentiel 6 chiffres).
-- La séquence démarre à un numéro « établi ». AVANT la mise en ligne, ajustez
-- le point de départ fictif souhaité avec, par exemple :
--   alter sequence public.dossier_seq restart with 1247;
-- ─────────────────────────────────────────────────────────────────────────
create sequence if not exists public.dossier_seq start with 1000;

-- ─────────────────────────────────────────────────────────────────────────
-- Nouvelles colonnes de la fiche
-- ─────────────────────────────────────────────────────────────────────────
alter table public.annonces
  add column if not exists numero_dossier text unique,
  add column if not exists age text,
  add column if not exists poids text,
  add column if not exists couleur_yeux text,
  add column if not exists signes_distinctifs text,
  add column if not exists sterilise boolean,
  add column if not exists micropuce boolean,
  add column if not exists micropuce_numero text,
  add column if not exists accessoires text,
  add column if not exists temperament text,
  add column if not exists heure_approx text,
  add column if not exists adresse text,
  add column if not exists dernier_lieu_vu text,
  add column if not exists recompense boolean not null default false,
  add column if not exists recompense_montant text;

-- ─────────────────────────────────────────────────────────────────────────
-- Attribution automatique du numéro de dossier à l'insertion
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.attribuer_numero_dossier()
returns trigger
language plpgsql
as $$
begin
  if new.numero_dossier is null then
    new.numero_dossier :=
      '26-' || lpad(nextval('public.dossier_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists on_annonce_dossier on public.annonces;
create trigger on_annonce_dossier
  before insert on public.annonces
  for each row execute function public.attribuer_numero_dossier();
