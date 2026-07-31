-- AnimAlerte — contact enrichi : prénom + adresse (facturation).
-- Migration idempotente (à coller dans l'éditeur SQL Supabase).

alter table public.annonces
  add column if not exists contact_prenom text,
  add column if not exists contact_adresse text;
