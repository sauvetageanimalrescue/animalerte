-- Migration 0005 : état d'un animal trouvé (sain / blessé / décédé).
-- Colonne texte facultative (codes : « sain », « blesse », « decede »).
-- Idempotent.

alter table public.annonces
  add column if not exists etat text;
