-- ─────────────────────────────────────────────────────────────────────────
-- 0011 — Photos supplémentaires
-- La photo principale (visage) reste dans annonces.photo_url. Les photos
-- supplémentaires (vues générales) vivent dans ce tableau d'URLs. Le nombre
-- total autorisé dépend du forfait (1 gratuit / 2 locale / 3 régionale / 4
-- provinciale) ; la limite est appliquée côté serveur.
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.annonces
  add column if not exists photos text[] not null default '{}';
