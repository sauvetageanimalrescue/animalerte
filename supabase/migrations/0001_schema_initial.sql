-- AnimAlerte — schéma initial.
-- Migration idempotente : peut être rejouée sans erreur (à coller dans
-- l'éditeur SQL Supabase, aucun CLI requis).

-- ─────────────────────────────────────────────────────────────────────────
-- Types énumérés
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.type_annonce as enum ('perdu', 'trouve');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.statut_annonce as enum ('actif', 'resolu');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.espece_animal as enum
    ('chien', 'chat', 'oiseau', 'lapin', 'rongeur', 'reptile', 'autre');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sexe_animal as enum ('male', 'femelle', 'inconnu');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Table profiles : 1 ligne par utilisateur Supabase authentifié
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  courriel text not null,
  telephone text,
  created_at timestamptz not null default now()
);

-- Crée automatiquement le profil à l'inscription à partir des métadonnées.
create or replace function public.creer_profil_a_inscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nom, courriel, telephone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'telephone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.creer_profil_a_inscription();

-- ─────────────────────────────────────────────────────────────────────────
-- Table annonces : animaux perdus et trouvés
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.annonces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.type_annonce not null,
  statut public.statut_annonce not null default 'actif',
  espece public.espece_animal not null,
  race text,
  nom_animal text,
  sexe public.sexe_animal not null default 'inconnu',
  couleur text,
  description text,
  ville text not null,
  province text not null,
  latitude double precision,
  longitude double precision,
  date_evenement date not null,
  contact_nom text not null,
  contact_courriel text,
  contact_telephone text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists annonces_type_idx on public.annonces (type);
create index if not exists annonces_statut_idx on public.annonces (statut);
create index if not exists annonces_espece_idx on public.annonces (espece);
create index if not exists annonces_province_idx on public.annonces (province);
create index if not exists annonces_created_idx on public.annonces (created_at desc);
create index if not exists annonces_user_idx on public.annonces (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.annonces enable row level security;

-- profiles : chacun lit/modifie le sien.
drop policy if exists "profil_lecture_propre" on public.profiles;
create policy "profil_lecture_propre"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profil_maj_propre" on public.profiles;
create policy "profil_maj_propre"
  on public.profiles for update
  using (auth.uid() = id);

-- annonces : lecture publique (site consultable sans compte).
drop policy if exists "annonces_lecture_publique" on public.annonces;
create policy "annonces_lecture_publique"
  on public.annonces for select
  using (true);

-- annonces : un utilisateur connecté crée ses propres annonces.
drop policy if exists "annonces_insertion_propre" on public.annonces;
create policy "annonces_insertion_propre"
  on public.annonces for insert
  with check (auth.uid() = user_id);

-- annonces : le propriétaire modifie/supprime les siennes.
drop policy if exists "annonces_maj_propre" on public.annonces;
create policy "annonces_maj_propre"
  on public.annonces for update
  using (auth.uid() = user_id);

drop policy if exists "annonces_suppr_propre" on public.annonces;
create policy "annonces_suppr_propre"
  on public.annonces for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Storage : bucket public « photos » pour les images d'annonces
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_lecture_publique" on storage.objects;
create policy "photos_lecture_publique"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "photos_upload_authentifie" on storage.objects;
create policy "photos_upload_authentifie"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

drop policy if exists "photos_suppr_proprietaire" on storage.objects;
create policy "photos_suppr_proprietaire"
  on storage.objects for delete
  using (bucket_id = 'photos' and owner = auth.uid());
